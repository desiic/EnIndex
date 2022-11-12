/**
 * @module eidb/idbx
 */
// Modules
import idb from "./idb.js";

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

/** 
 * `eidb.idbx` IndexedDB extended feature class
 */ 
class idbx {

    /**
     * Get current indices
     */
    static async get_cur_indices(Db_Name){
        var [Err,{Status,Value}] = await idb.open(Db_Name);
        if (Err!=null || Status=="blocked" || Status=="to-upgrade") return null;

        // Get indices
        var Db      = Value;
        var Indices = {};
        
        for (let Store_Name of Db.Object_Store_Names){
            // let 
        }
    }

    /**
     * Open db with version set automatically (av, ie. auto-versioning)
     * @param  {String} Db_Name - Database name
     * @param  {Object} Indices - Index schema of database
     * @return {Array}  Error or null, and database object
     */
    static async open_av(Db_Name,Indices){
        window._Db_Name = Db_Name;
        var Cur_Indices = await idbx.get_cur_indices(Db_Name);
        log(Cur_Indices)
    }

    /**
     * Re-open db with name set by idb.open or idbx.open_av
     */
    static async reopen(){
    }

    /**
     * Set db name
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

        var [_,Res] = await idb.open(window._Db_Name);
        var Db      = Res.Value;
        var [_,T]   = Db.transaction(Store_Name,RW);
        var [_,S]   = T.store1();
        var Result  = S[Prop_Name];
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

        var [_,Res] = await idb.open(window._Db_Name);
        var Db      = Res.Value;
        var [_,T]   = Db.transaction(Store_Name,RW);
        var [_,S]   = T.store1();
        var Result  = await S[Op_Name](...Args);
        return Result;
    }
}

// Module export
export default idbx;
// EOF