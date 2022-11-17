/**
 * @module eidb/idbx
 */
// Modules
import idb     from "./idb.js";
import crud    from "./idbx/crud.js";
import op_hist from "./idbx/op-hist.js";
import fts     from "./idbx/fts.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var obj2json = JSON.stringify;
var json2obj = JSON.parse;

/** 
 * `eidb.idbx` IndexedDB extended feature class
 */ 
class idbx {

    /**
     * _________________________________________________________________________
     */
    SUB_NAMESPACES;

    /**
     * CRUD functionalities
     */
    static crud = crud;

    /**
     * Op history features
     */ 
    static op_hist = op_hist;

    /**
     * FTS features
     */
    static fts = fts;

    /*
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Check if is unused store
     * @private
     */
    static #is_unused_store(Store_Name){
        if (localStorage.Unused_Stores==null || localStorage.Unused_Stores.trim().length==0)
            return false;

        let Unused_Stores = json2obj(localStorage.Unused_Stores);
        return Unused_Stores.indexOf(Store_Name)>=0;
    }

    /**
     * Update unused store list
     * @private
     */
    static #update_unused_store_list(Op,Store_Name){
        if (Op=="add"){
            if (localStorage.Unused_Stores==null || localStorage.Unused_Stores.trim().length==0)
                localStorage.Unused_Stores = obj2json([Store_Name]);
            else{
                // Load
                let Unused_Stores = json2obj(localStorage.Unused_Stores);
                // Combine
                Unused_Stores = Array.from(new Set([...Unused_Stores,Store_Name]));
                // Save
                localStorage.Unused_Stores = obj2json(Unused_Stores);
            }
        }
        else 
        if (Op=="remove"){
            if (localStorage.Unused_Stores==null || localStorage.Unused_Stores.trim().length==0)
                localStorage.Unused_Stores = obj2json([]);
            else{
                // Load
                let Unused_Stores = json2obj(localStorage.Unused_Stores);
                
                // Remove
                let idx = Unused_Stores.indexOf(Store_Name);
                if (idx>=0) Unused_Stores.splice(idx,1);
                
                // Save
                localStorage.Unused_Stores = obj2json(Unused_Stores);
            }
        }
        // No other ops
    }

    /**
     * Get current indices
     */
    static async get_cur_indices(Db_Name){
        var Db = await idb.open(Db_Name);

        // Get indices
        var Indices = {};        
        var T       = Db.transaction(Db.Object_Store_Names,RO);

        for (let Store_Name of Db.Object_Store_Names){
            // Ignore unused store to avoid upgrade being triggered again and again
            if (idbx.#is_unused_store(Store_Name))
                continue;

            // Make index schema
            let S               = T.object_store(Store_Name);
            Indices[Store_Name] = {};     

            for (let Index_Name of S.Index_Names){
                let I          = S.index(Index_Name);
                let Key_Path   = I.Key_Path;
                let unique     = I.unique;
                let multientry = I.multientry;
                let type;

                if (unique==false && multientry==false) type=1; // n1
                else
                if (unique==false && multientry==true)  type=2; // n2
                else
                if (unique==true  && multientry==false) type=3; // u1
                else
                if (unique==true  && multientry==true)  type=4; // u2
                else{}

                Indices[Store_Name][Key_Path] = type;
            }
        }

        Db.close();
        return Indices;
    }

    /**
     * Convert index schema to string to diff
     */
    static indices2str(Indices){
        var Arr = [];
        
        for (let Store_Name in Indices)
            for (let Index_Name in Indices[Store_Name]){
                let type = Indices[Store_Name][Index_Name];
                Arr.push(`${Store_Name}/${Index_Name}:${type};`);
            }

        Arr.sort();
        return Arr.join("");
    }

    /**
     * Get current db version
     */ 
    static async get_cur_db_ver(Db_Name){
        var Db  = await idb.open(Db_Name);
        var ver = Db.version;
        Db.close();
        return ver;
    }

    /**
     * Upgrade db
     */
    static async upgrade_db(Db_Name, Cur_Indices, New_Indices){
        var ver     = await idbx.get_cur_db_ver(Db_Name);
        var new_ver = ver+1;
        log("idbx.upgrade_db: Upgrading to version",new_ver);

        // Open db with new version will trigger upgrade
        var Db = await idb.open(Db_Name, new_ver);

        // Delete unused stores (and their indices)
        var Cur_Stores = Object.keys(Cur_Indices);
        var New_Stores = Object.keys(New_Indices);
        var Del_Stores = [];

        for (let Store_Name of Cur_Stores)
            if (New_Stores.indexOf(Store_Name) == -1)
                Del_Stores.push(Store_Name);

        for (let Store_Name of Del_Stores){
            log("idbx.upgrade_db: Found unused store:",Store_Name);
            // WARN: AVOID LOSING USERS' DATA, WON'T DELETE, COMMENTED OUT:
            // Db.delete_object_store(Store_Name); // Indices are deleted together

            // Mark unused store not to trigger upgrade again
            idbx.#update_unused_store_list("add",Store_Name);
        }
        
        // Create new stores (and new indices)   
        var Cre_Stores = [];

        for (let Store_Name of New_Stores)
            if (Cur_Stores.indexOf(Store_Name)==-1){                
                if (!idbx.#is_unused_store(Store_Name))
                    Cre_Stores.push(Store_Name); // Not existing, create
                else{
                    // Existing, but current index schema ignored Store_Name, 
                    // make empty entry to create all new indices for Store_Name
                    Cur_Indices[Store_Name] = {};
                    // Remove from unused store list coz it's now in index schema:
                    idbx.#update_unused_store_list("remove",Store_Name);
                }
            }

        for (let Store_Name of Cre_Stores){
            log("idbx.upgrade_db: Creating new store:",Store_Name);
            let S = Db.create_object_store(Store_Name);

            for (let Index_Name in New_Indices[Store_Name]){
                let type = New_Indices[Store_Name][Index_Name];
                log("idbx.upgrade_db: Creating new index:",Store_Name,"/",Index_Name);
                S.create_index(Index_Name,Index_Name,type);
            }
        }

        // Now left only the same stores to uprade
        var Same_Stores = [];
        var All_Stores  = Array.from(new Set([...Cur_Stores,...New_Stores]));

        for (let Store_Name of All_Stores)
            if (Del_Stores.indexOf(Store_Name)==-1 && Cre_Stores.indexOf(Store_Name)==-1)
                Same_Stores.push(Store_Name);

        // Delete unused indices, create new indices, and update changed indices
        var T = Db.Transaction;

        for (let Store_Name of Same_Stores){
            let S             = T.object_store(Store_Name);
            let Cur_Idx_Names = Object.keys(Cur_Indices[Store_Name]);
            let New_Idx_Names = Object.keys(New_Indices[Store_Name]);
            let Del_Idx_Names = [];
            let Cre_Idx_Names = [];

            // Del unused
            for (let Idx_Name of Cur_Idx_Names)
                if (New_Idx_Names.indexOf(Idx_Name)==-1){
                    log("idbx.upgrade_db: Deleting unused index:",Store_Name,"/",Idx_Name);
                    S.delete_index(Idx_Name);
                    Del_Idx_Names.push(Idx_Name);
                }

            // Create new
            for (let Idx_Name of New_Idx_Names)
                if (Cur_Idx_Names.indexOf(Idx_Name)==-1){
                    let type = New_Indices[Store_Name][Idx_Name];
                    log("idbx.upgrade_db: Creating new index:",Store_Name,"/",Idx_Name);
                    S.create_index(Idx_Name,Idx_Name,type);
                    Cre_Idx_Names.push(Idx_Name);
                }

            // Update those changed (del, re-create with new type)
            let Same_Idx_Names = [];
            let All_Idx_Names  = Array.from(new Set([...Cur_Idx_Names,...New_Idx_Names]));

            for (let Idx_Name of All_Idx_Names)
                if (Del_Idx_Names.indexOf(Idx_Name)==-1 && Cre_Idx_Names.indexOf(Idx_Name)==-1)
                    Same_Idx_Names.push(Idx_Name);

            for (let Idx_Name of Same_Idx_Names)
                if (New_Indices[Store_Name][Idx_Name] != Cur_Indices[Store_Name][Idx_Name]){
                    let type = New_Indices[Store_Name][Idx_Name];
                    log("idbx.upgrade_db: Updating index to new type:",Store_Name,"/",Idx_Name+":"+type);
                    S.delete_index(Idx_Name);
                    S.create_index(Idx_Name,Idx_Name, type); // New type
                }    
        }         
            
        Db.close();
    }

    /**
     * Open db with version set automatically (av, ie. auto-versioning)
     * @param  {String} Db_Name - Database name
     * @param  {Object} Indices - Index schema of database
     * @return {Array}  Error or null, and database object
     */
    static async open_av(Db_Name,Indices){
        if (Db_Name==null) { 
            loge("idbx.open_av: Db name cannot be null");
            return;
        }
        if (Indices==null){
            loge("idbx.open_av: Indices name cannot be null");
            return;
        }        

        // All id is primary field of u1 type (unique, single value)
        for (let Store_Name in Indices)
            Indices[Store_Name].id = u1;

        // Check if indices changed
        window._Db_Name     = Db_Name;
        var New_Indices     = Indices;
        var Cur_Indices     = await idbx.get_cur_indices(Db_Name);
        var Cur_Indices_Str = idbx.indices2str(Cur_Indices);
        var New_Indices_Str = idbx.indices2str(New_Indices);
        
        // No indices changed, use current db
        if (New_Indices_Str == Cur_Indices_Str)
            return await idb.open(Db_Name);

        // Indices changed, upgrade
        await idbx.upgrade_db(Db_Name, Cur_Indices, New_Indices);
        return await idb.open(Db_Name);
    }

    /**
     * Re-open db with name set by idb.open or idbx.open_av
     */
    static async reopen(){
        return await idb.open(window._Db_Name);
    }

    /**
     * Set db name<br/>
     * Don't call this method, for testing purpose
     */
    static set_db(Name){
        window._Db_Name = Name;
    }

    /**
     * Get store property
     * TO-DO: Add error checking
     */
    static async get_prop(Store_Name,Prop_Name){
        if (window._Db_Name==null || window._Db_Name.trim().length==0){
            loge("idbx.get_prop: Call 'idb.open', 'idbx.open_av', or 'idbx.set_db' first");
            return;
        }

        var Db     = await idb.open(window._Db_Name);
        var T      = Db.transaction(Store_Name,RW);
        var S      = T.store1();
        var Result = S[Prop_Name];
        return Result;
    }

    /**
     * Do an operation
     * TO-DO: Add error checking
     */
    static async do_op(Store_Name,Op_Name,...Args){
        if (window._Db_Name==null || window._Db_Name.trim().length==0){
            loge("idbx.do_op: Call 'idb.open', 'idbx.open_av', or 'idbx.set_db' first");
            return;
        }

        var Db     = await idb.open(window._Db_Name);
        var T      = Db.transaction(Store_Name,RW);
        var S      = T.store1();
        var Result = await S[Op_Name](...Args);
        return Result;
    }
}

// Module export
export default idbx;
// EOF