/**
 * @module eidb/idbx
 */
// Modules
import idb from "./idb.js";

/** 
 * `eidb.idbx` IndexedDB extended feature class
 */ 
class idbx {

    /**
     * Open db with version set automatically (av, ie. auto-versioning)
     */
    static async open_av(Name){
    }

    /**
     * Do an operation
     * TO-DO: Add error checking
     */
    static async do_op(Db_Name,Store_Name,Op_Name,...Args){
        var [_,Db] = await idb.open(Db_Name);
        var T      = Db.transaction(Store_Name,RW);
        var S      = T.store1();
        var Result = await S[Op_Name](...Args);
        return Result;
    }
}

// Module export
export default idbx;
// EOF