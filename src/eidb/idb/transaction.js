/**
 * @module eidb/idb/transaction
 */
// Modules
import base         from "../base.js";
import database     from "./database.js";
import object_store from "./object-store.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * `eidb.idb.transaction` IDBTransaction class wrapper
 */
class transaction {

    /**
     * Properties
     */
    self = null;

    /**
     * Construct with the IDBTransaction instance underhood
     * @param {IDBTransaction} Idb_Transaction - IDBTransaction instance to use
     */
    constructor(Idb_Transaction){
        this.self = Idb_Transaction;
    }

    /**
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    SETS_AND_GETS;

    /**
     * Get db
     * @return {database}
     */
    get Db(){
        return new database(this.self.db);
    }

    /**
     * Get durability
     * @return {String}
     */ 
    get Durability(){
        return this.self.durability;
    }

    /**
     * Get error
     * @return {DOMException}
     */ 
    get Error(){
        return this.self.error;
    }

    /**
     * Get mode
     * @return {String}
     */ 
    get Mode(){
        return this.self.mode;
    }

    /**
     * Get objectStoreNames
     * @return {Array}
     */ 
    get Object_Store_Names(){
        return [...this.self.objectStoreNames];
    }

    /**
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */ 
    EVENTS;

    /**
     * On abort event
     */ 
    set on_abort(callback){
        this.self.onabort = callback;
    }

    /**
     * On complete event
     */
    set on_complete(callback){
        this.self.oncomplete = callback;
    }

    /**
     * On error event
     */
    set on_error(callback){
        this.self.onerror = callback;
    }

    /* NON-JSDOC
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Abort
     * @return {Object} Error or null
     */
    abort(){ 
        try {
            this.self.abort();
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }       
    }

    /**
     * Commit
     */
    commit(){        
        try {
            this.self.commit();
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Get object store by name
     * @return {Array} Error|null and store
     */
    object_store(Name){       
        try {
            var Store = this.self.objectStore(Name);
            return [null, new object_store(Store)];
        }
        catch (Dom_Exception){
            return [Dom_Exception,null];
        } 
    }

    /* NON-JSDOC
     * _________________________________________________________________________
     */
    ADDITIONAL_METHODS;

    /**
     * Get first object store when creating transaction
     */
    store1(){
        return this.object_store([...this.self.objectStoreNames][0]);        
    }
}

// Export
export default transaction;
// EOF