/**
 * @module eidb/idbx/op_hist
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, idbxs.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// NOTE:
// OP HISTORY AND FTS RUN IN BACKGROUND, DON'T AWAIT,
// CALL `eidb.stay_idle` (or just `stay_idle`) TO DELAY FOR A WHILE 
// IF IN NEED OF OP HISTORY OR FTS RESULTS IMMEDIATELY.

// Modules
import eidb from "../../eidb.js";
import idbx from "../idbx.js";

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

// Constants
// Private, use _ first, inner: the same as other stores in index schema
// as regular object property instead of quotes.
const OP_HIST_STORE = "op_hist"; 

const OP2FIELDNAME = {
    "create": "Recent_Creates",
    "read":   "Recent_Reads",
    "update": "Recent_Updates",
    "delete": "Recent_Deletes"
};

/**
 * CRUD operation history
 */ 
class op_hist {
    static max_history = 1000;
    static enabled     = false;

    /**
     * Change default max entries per op type in history
     */ 
    static set_max_history(max){
        history.max_history = max;
    }

    /**
     * Get op hist status
     */ 
    static get_op_hist_status(){
        return op_hist.enabled? "enabled":"disabled";
    }

    /**
     * Enable op history
     */
    static async enable_op_hist(){
        op_hist.enabled = true;
    }

    /**
     * Disable history
     */ 
    static disable_op_hist(){
        op_hist.enabled = false;
    }

    /**
     * Sort a docmeta array descending, most recents first
     */ 
    static sort_docmetas_des(Docmetas){
        Docmetas.sort((A,B)=>{
            if (A.Timestamp < B.Timestamp) return  1; // Descending
            if (A.Timestamp > B.Timestamp) return -1; // Descending
            return 0;
        });
        return Docmetas;
    }

    /**
     * Update op hist CRUD<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static async #update_op_hist(Store_Name, Op_Type, Ids){
        if (!op_hist.enabled || Ids==null || Ids.length==0)
            return;
        if (["create","read","update","delete"].indexOf(Op_Type) == -1){
            loge("op_hist.update_op_hist: No such operation type:",Op_Type);
            return;
        }

        // Open db
        var Db = await idbx.reopen();
        
        if (Db.Object_Store_Names.indexOf(OP_HIST_STORE) == -1) {
            Db.close();
            return;
        }

        // Find
        var T   = Db.transaction(OP_HIST_STORE,RW);
        var S   = T.store1();
        var Obj = await S.index("Store_Name").get(value_is(Store_Name));
        
        // Create object for store if not existing
        if (Obj == null){
            let Obj      = {Store_Name};
            let Docmetas = []; // Assign to one of Recent_*
            let Now      = new Date();             

            for (let id of Ids)
                if (Docmetas.length < op_hist.max_history)
                    Docmetas.push({ id:id, Timestamp:Now }); // Initial items

            for (let Type in OP2FIELDNAME)
                Obj[OP2FIELDNAME[Type]] = []; // All op recents to empty

            let Field  = OP2FIELDNAME[Op_Type];
            Obj[Field] = Docmetas; // Only the current op is not

            await S.add(Obj);
            Db.close();
            return;
        }

        // Combine ids
        var Docmetas = Obj[OP2FIELDNAME[Op_Type]];
        var Cur_Ids  = Docmetas.map(X=>X.id);
        var Now      = new Date();
        
        for (let id of Ids)
            if (Cur_Ids.indexOf(id) == -1)
                Docmetas.push({ id:id, Timestamp:Now });

        Docmetas = op_hist.sort_docmetas_des(Docmetas);
        Docmetas = Docmetas.slice(0, op_hist.max_history);

        Obj[OP2FIELDNAME[Op_Type]] = Docmetas; // Put back into Obj

        // Save to op_hist store and close db con
        await S.put(Obj);
        Db.close();
    }

    /**
     * Update op hist CRUD:C<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_c(Store_Name, Ids){
        op_hist.#update_op_hist(Store_Name, "create",Ids);
    }

    /**
     * Update op hist CRUD:R<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_r(Store_Name, Ids){
        op_hist.#update_op_hist(Store_Name, "read",Ids);
    }

    /**
     * Update op hist CRUD:U<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_u(Store_Name, Ids){
        op_hist.#update_op_hist(Store_Name, "update",Ids);
    }

    /**
     * Update op hist CRUD:D<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_d(Store_Name, Ids){
        op_hist.#update_op_hist(Store_Name, "delete",Ids);
    }

    /**
     * Get operation history entries
     */ 
    static async get_op_hist(Store_Name, max){
        var Db = await idbx.reopen();

        // Get CRUD/C entries (multiple ids inside each)
        var T       = Db.transaction(OP_HIST_STORE,RO);
        var S       = T.store1();
        var Op_Hist = await S.index("Store_Name").get(value_is(Store_Name));

        Db.close();
        return Op_Hist;
    }

    /**
     * Clear operation history, caller should await, to let user see result.
     */ 
    static async clear_op_hist(){
        var Db = await idbx.reopen();

        if (Db instanceof Error){
            loge("op_hist.clear_op_hist: Failed to open db, error:",Db);
            return;
        }

        // Clear
        var T = Db.transaction(OP_HIST_STORE,RW);
        var S = T.store1();
        await S.delete(range_gte(0)); // Primary key (primary index)

        Db.close();
    }
}

export default op_hist;
// EOF