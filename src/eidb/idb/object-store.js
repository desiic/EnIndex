/**
 * @module eidb/idb/object_store
 */
// Modules
import base from "../base.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * `eidb.idb.object_store` IDBObjectStore class wrapper
 */
class object_store {

    /**
     * Properties
     */
    self = null;

    /**
     * Construct with the IDBObjectStore instance underhood
     * @param {IDBObjectStore} Idb_Object_Store - IDBObjectStore instance to use
     */
    constructor(Idb_Object_Store){
        this.self = Idb_Object_Store;
    }

    /**
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    SETS_AND_GETS;

    /**
     * Get autoIncrement
     * @return {Boolean}
     */
    get auto_increment(){
        return this.self.autoIncrement;
    }

    /**
     * Get indexNames
     * @return {Array}
     */
    get Index_Names(){
        return [...this.self.indexNames];
    }

    /**
     * Get keyPath
     * @return {String|Array}
     */
    get Key_Path(){
        return this.self.keyPath;
    }

    /**
     * Get name
     * @return {Boolean}
     */
    get Name(){
        return this.self.name;
    }

    /**
     * Get current transaction
     * @return {Object}
     */
    get Transaction(){
        return this.self.transaction;
    }

    /* NON-JSDOC
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Add value (INSERT), EnIndex has id field autoincremented, 
     * no key will be passed to IDBObjectStore.add
     * @return {Array} Error|null and added object id
     */ 
    async add(Value){
        try {
            var Req           = this.self.add(Value);
            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(["error", Ev.target.error]);
            };
            Req.onsuccess = function(Ev){
                unlock(["okay", Ev.target.result]);
            };
            var [Stat,Result] = await Lock;

            // Result
            if (Stat=="error") return [Result,null];
            return [null,Result]; // Added object id
        }
        catch (Dom_Exception){
            return [Dom_Exception, null];
        }
    }

    /**
     * Clear store
     * @return {Object} Error or null
     */
    async clear(){
        try {
            var Req           = this.self.clear();
            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(["error", Ev.target.error]);
            };
            Req.onsuccess = function(Ev){
                unlock(["okay", Ev.target.result]);
            };
            var [Stat,Result] = await Lock;

            // Result
            if (Stat=="error") return Result;
            return null;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Count values
     * @param  {key_range} Range - The range to count, can be null
     * @return {Array}     Error or null, and count
     */
    async count(Range){
        try {
            if (Range==null)
                var Req = this.self.count();
            else
                var Req = this.self.count(Range.self);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(["error", Ev.target.error]);
            };
            Req.onsuccess = function(Ev){
                unlock(["okay", Ev.target.result]);
            };
            var [Stat,Result] = await Lock;

            // Result
            if (Stat=="error") return [Result,null];
            return [null,Result];
        }
        catch (Dom_Exception){
            return [Dom_Exception,null];
        }
    }
}

// Module export
export default object_store;
// EOF