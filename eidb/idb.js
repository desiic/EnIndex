/**
 * @module eidb/idb
 */
// Modules
import base        from "./base.js";
import idb_factory from "./idb/idb-factory.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * `eidb.idb` IndexedDB wrapper
 */
class idb{
    static idb_factory = idb_factory;

    /**
     * Call open db on default instance of IDBFactory already at `window.indexedDB`.
     * [See here](module-eidb_idb_idb_factory-idb.html#.open)
     */
    static async open(Name, version){
        return await (new idb_factory(window.indexedDB)).open(Name,version);
    }
}

// Module export
export default idb;
// EOF