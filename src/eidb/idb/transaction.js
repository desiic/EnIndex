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

function $_____CLASS_____(){}

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
    
    #_____SETS_AND_GETS_____(){}

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
        // No such this property in Firefox (Sep 2023)
        if (this.self.durability == null)
            return "none";

        // All other browsers' values: strict, relaxed, or default
        else
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
    
    #_____EVENTS_____(){}

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
    
    #_____METHODS_____(){}

    /**
     * Abort
     * @return {Object} Error or null
     */
    abort(){ 
        try {
            this.self.abort();
        }
        catch (Dom_Exception){
            loge("[EI] transaction.abort: Error:",Dom_Exception);
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
            loge("[EI] transaction.commit: Error:",Dom_Exception);
            return Dom_Exception;
        }
    }

    /**
     * Get object store by name
     * @return {Object} Error or object store
     */
    object_store(Name){       
        try {
            var Store = this.self.objectStore(Name);
            return new object_store(Store);
        }
        catch (Dom_Exception){
            loge("[EI] transaction.object_store: Error:",Dom_Exception);
            return Dom_Exception;
        } 
    }
    
    #_____ADDITIONAL_METHODS_____(){}

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