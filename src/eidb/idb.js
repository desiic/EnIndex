/**
 * @module eidb/idb
 */
// Modules
import eidb from "../eidb.js";
import base from "./base.js";

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
     * Get the list of databases, using the default instance of IDBFactory at `window.indexedDB`
     * @return {Array} See `eidb.idb.factory` class [here](module-eidb_idb_factory-factory.html#databases)
     */
     static async databases(){
        return await eidb.Factory.databases();
    }

    /**
     * Call open db on default instance of IDBFactory already at `window.indexedDB`.
     * [See here](module-eidb_idb_factory-factory.html#open)
     * @param  {String} Name    - See `eidb.idb.factory` class [here](module-eidb_idb_factory-factory.html#open)
     * @param  {Number} version - See `eidb.idb.factory` class [here](module-eidb_idb_factory-factory.html#open)
     * @return {Array}  See `eidb.idb.factory` class [here](module-eidb_idb_factory-factory.html#.open)
     */
    static async open(Name, version){
        window._Db_Name = Name;
        return await eidb.Factory.open(Name,version);
    }

    /**
     * Delete database, using the default instance of IDBFactory already at `window.indexedDB`
     * [See here](module-eidb_idb_factory-factory.html#delete_database)
     * @param  {String}      Name - See `eidb.idb.factory` class [here](module-eidb_idb_factory-factory.html#delete_database)
     * @return {Object|null} See `eidb.idb.factory` class [here](module-eidb_idb_factory-factory.html#delete_database)
     */
    static async delete_database(Name){
        return await eidb.Factory.delete_database(Name);
    }
}

// Module export
export default idb;
// EOF