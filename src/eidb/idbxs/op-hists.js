/**
 * @module eidb/idbxs/op_hists
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
import op_hist from "../idbx/op-hist.js";

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

/**
 * Operation history secure
 */ 
class op_hists {
    // COMMENTED OUT: THESE VALUES ARE IN REGULAR op_hist CLASS
    // static max_history = 1000;
    // static enabled     = false;

    /**
     * Change default max entries per op type in history
     */ 
    static set_max_history(max){
        op_hist.set_max_history(max);
    }

    /**
     * Get op hist status
     */ 
    static get_op_hist_status(){
        return op_hist.get_op_hist_status();
    }

    /**
     * Enable op history
     */
    static async enable_op_hist(){
        op_hist.enable_op_hist();
    }

    /**
     * Disable history
     */ 
    static disable_op_hist(){
        op_hist.disable_op_hist();
    }

    /**
     * Sort a docmeta array descending, most recents first
     */ 
    static sort_docmetas_des(Docmetas){
        // UNUSED, SEE REGULAR op_hist CLASS
    }

    /**
     * Update op hist CRUD<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static async #update_op_hist(Store_Name, Op_Type, Ids){
        // UNUSED, SEE REGULAR op_hist CLASS
    }

    /**
     * Update op hist CRUD:C<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_c(Store_Name, Ids){        
        Store_Name = "#"+Store_Name;
        op_hist.update_op_hist_c(Store_Name, Ids);
    }

    /**
     * Update op hist CRUD:R<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_r(Store_Name, Ids){
        Store_Name = "#"+Store_Name;
        op_hist.update_op_hist_r(Store_Name, Ids);
    }

    /**
     * Update op hist CRUD:U<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_u(Store_Name, Ids){
        Store_Name = "#"+Store_Name;
        op_hist.update_op_hist_u(Store_Name, Ids);
    }

    /**
     * Update op hist CRUD:D<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_d(Store_Name, Ids){        
        Store_Name = "#"+Store_Name;
        op_hist.update_op_hist_d(Store_Name, Ids);
    }

    /**
     * Get operation history entries
     */ 
    static async get_op_hist(Store_Name, max){
        Store_Name = "#"+Store_Name;
        return await op_hist.get_op_hist(Store_Name, max);
    }

    /**
     * Clear operation history, caller should await, to let user see result.
     */ 
    static async clear_op_hist(){
        await op_hist.clear_op_hist();
    }
}

export default op_hists;
// EOF