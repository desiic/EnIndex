/**
 * @module eidb/idb/database
 */
// Modules
import base         from "../base.js";
import transaction  from "./transaction.js";
import object_store from "./object-store.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * `eidb.idb.database` IDBDatabase class wrapper
 */
class database {

    /**
     * Properties
     */
    self = null;

    /**
     * Construct with the IDBDatabase instance underhood
     * @param {IDBDatabase} Idb_Database - IDBDatabase instance to use
     */
    constructor(Idb_Database){
        this.self = Idb_Database;
    }

    /**
     * _________________________________________________________________________
     */
    SETS_AND_GETS;

    /**
     * Get name
     * @return {String}
     */
    get Name(){
        return this.self.name;
    }

    /**
     * Get objectStoreNames
     * @return {Array}
     */
    get Object_Store_Names(){
        return [...this.self.objectStoreNames];
    }

    /**
     * Get version
     * @return {Number}
     */
    get version(){
        return this.self.version;
    }

    /**
     * _________________________________________________________________________
     */
    EVENTS;

    /**
     * Close event, callback receives single param event
     */
    set on_close(callback){
        this.self.onclose = callback;
    }

    /**
     * Version change event, callback receives single param event
     */ 
    set on_version_change(callback){
        this.self.onversionchange = callback;
    }

    /**
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Close database connection
     * @return {null}
     */
    close(){
        return this.self.close(); // No exceptions
    }

    /**
     * Create object store
     * @param  {String} Name - Name of object store
     * @return {Array}  1st value: Error object or null<br/>
     *                  2nd object: object_store instance to use
     */
    create_object_store(Name){
        try {
            var Options = {keyPath:"id", autoIncrement:true};
            return [null, new object_store(this.self.createObjectStore(Name,Options))];
        }
        catch (Dom_Exception){
            return [Dom_Exception, null];
        }
    }

    /**
     * Delete object store
     * @return {Object|null} Error object or null
     */
    delete_object_store(Name){
        try {
            return this.self.deleteObjectStore(Name);
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Create transaction
     * @param  {String|Array} Store_Names - String of single store name, or array of store names
     * @param  {String}       Mode        - String, either "readonly" or "readwrite";
     *                                      see `eidb` module with `RO` and `RW` constants defined there.
     * @param  {Object}       Options     - Options passed to IDBDatabase.transaction
     * @return {Array}        1st value: Error object or null<br/>
     *                        2nd value: The created transaction
     */
    transaction(Store_Names, Mode, Options){
        try {
            return [null, new transaction(this.self.transaction(Store_Names, Mode, Options))];
        }
        catch (Dom_Exception){
            return [Dom_Exception, null];
        }
    }
}

// Module export
export default database;
// EOF