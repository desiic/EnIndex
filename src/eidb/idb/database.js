/**
 * @module eidb/idb/database
 */
// Modules
import eidb         from "../../eidb.js";
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

    /* NON-JSDOC
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Close database connection
     * @return {null}
     */
    close(){
        // Reduce number of db cons
        eidb._num_db_cons -= 1;

        return this.self.close(); // No exceptions
    }

    /**
     * Create object store
     * @param  {String} Name - Name of object store
     * @return {Object} Error or the new object store
     */
    create_object_store(Name){
        try {
            var Options = {keyPath:"id", autoIncrement:true};
            return new object_store(this.self.createObjectStore(Name,Options));
        }
        catch (Dom_Exception){
            loge("[EI] database.create_object_store: Error:",Dom_Exception);
            return Dom_Exception;
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
            loge("[EI] database.delete_object_store: Error:",Dom_Exception);
            return Dom_Exception;
        }
    }

    /**
     * Create transaction<br/>
     * _______________________
     * WARNING!!!: A transaction CANNOT be returned from a function coz
     * when a transaction variable is out of scope it is terminated. All db
     * operations must be in the same function with the transaction variable.
     * @param  {String|Array} Store_Names - String of single store name, or array of store names
     * @param  {String}       Mode        - String, either "readonly" or "readwrite";
     *                                      see `eidb` module with `RO` and `RW` constants defined there.
     * @param  {Object}       Options     - OPTIONAL! Options passed to IDBDatabase.transaction
     * @return {Object}       Error or the transaction
     */
    transaction(Store_Names, Mode, Options){
        try {
            return new transaction(this.self.transaction(Store_Names, Mode, Options));
        }
        catch (Dom_Exception){
            loge("[EI] database.transaction: Error:",Dom_Exception);
            return Dom_Exception;
        }
    }
}

// Module export
export default database;
// EOF