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

    /**
     * Call open db on default instance of IDBFactory already at `window.indexedDB`.
     * [See here](module-eidb_idb_idb_factory-idb_factory.html#open)
     * @param  {String} Name    - See `eidb.idb.idb_factory` class [here](module-eidb_idb_idb_factory-idb_factory.html#open)
     * @param  {Number} version - See `eidb.idb.idb_factory` class [here](module-eidb_idb_idb_factory-idb_factory.html#open)
     * @return {Array}  See `eidb.idb.idb_factory` class [here](module-eidb_idb_idb_factory-idb_factory.html#.open)
     */
    static async open(Name, version){
        return await (new idb_factory(window.indexedDB)) .open(Name,version);
    }

    /**
     * Delete database, using the default instance of IDBFactory already at `window.indexedDB`
     * [See here](module-eidb_idb_idb_factory-idb_factory.html#delete_database)
     * @param  {String}      Name - See `eidb.idb.idb_factory` class [here](module-eidb_idb_idb_factory-idb_factory.html#delete_database)
     * @return {null|Object} See `eidb.idb.idb_factory` class [here](module-eidb_idb_idb_factory-idb_factory.html#delete_database)
     */
    static async delete_database(Name){
        return await (new idb_factory(window.indexedDB)) .delete_database(Name);
    }

    /**
     * Get the list of databases, using the default instance of IDBFactory at `window.indexedDB`
     * @return {Object|Array} See `eidb.idb.idb_factory` class [here](module-eidb_idb_idb_factory-idb_factory.html#databases)
     */
    static async databases(){
        return await (new idb_factory(window.indexedDB)) .databases();
    }
}

// Module export
export default idb;
// EOF