/**
 * @module eidb/idb/object_store
 */
// Modules
import base              from "../base.js";
import index             from "../idb/index.js";
import transaction       from "./transaction.js";
import cursor            from "./cursor.js";
import cursor_with_value from "./cursor-with-value.js";

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
        return new transaction(this.self.transaction);
    }

    /* NON-JSDOC
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Add value (INSERT), EnIndex has id field autoincremented, 
     * no key will be passed to IDBObjectStore.add
     * @return {Object} Error or added object id
     */ 
    async add(Value){
        try {
            var Req           = this.self.add(Value);
            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Clear store (DELETE)
     * @return {Object} Error or null
     */
    async clear(){
        try {
            var Req           = this.self.clear();
            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Count values (COUNT)
     * @param  {key_range} Range - The primary index range to count, can be null
     * @return {Object}    Error or count value
     */
    async count(Range){
        try {
            if (Range==null)
                var Req = this.self.count();
            else
                var Req = this.self.count(Range.self);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Create index (CREATE INDEX)
     * @return {Object} Error or the index object
     */
    create_index(Name,Key_Path,Key_Type){
        try {
            if (Key_Type==n1)
                var Params={unique:false, multiEntry:false};
            else
            if (Key_Type==n2)
                var Params={unique:false, multiEntry:true};
            else
            if (Key_Type==u1)
                var Params={unique:true, multiEntry:false};
            else
            if (Key_Type==u2)
                var Params={unique:true, multiEntry:true};
            else{}

            return new index(this.self.createIndex(Name,Key_Path,Params));
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Delete objects (DELETE)
     * @param  {key_range} Range - A primary key range
     * @return {Object}    Error or null
     */
    async delete(Range){
        try {
            var Req           = this.self.delete(Range.self);
            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Delete index (DELETE INDEX)
     * @return {Object} Error or null
     */
    async delete_index(Name){
        try {
            this.self.deleteIndex(Name);
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Get (SELECT) 1 object specified by primary key range
     * @return {Object} Error or data object
     */
    async get(Range){
        try {
            if (Range==null)
                var Req = this.self.get();
            else
                var Req = this.self.get(Range.self);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Get (SELECT) all objects specified by primary key range
     * @return {Object} Error or array of objects
     */
     async get_all(Range){
        try {
            if (Range==null)
                var Req = this.self.getAll();
            else
                var Req = this.self.getAll(Range.self);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Get (SELECT) all key objects (key field of object only) specified by primary key range
     * @return {Object} Error or array of keys
     */
    async get_all_keys(Range, max){
        try {
            if (Range==null)
                var Req = this.self.getAllKeys();
            else
                var Req = this.self.getAllKeys(Range.self, max);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Get (SELECT) 1 key object (key field of object only) specified by primary key range
     * @return {Object} Error or key
     */
    async get_key(Range){
        try {
            if (Range==null)
                var Req = this.self.getKey();
            else
                var Req = this.self.getKey(Range.self);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Get index
     */
    index(Name){
        try {
            return new index(this.self.index(Name));
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Open cursor (normal cursor with .value)<br>
     * Use callback `func` with cursor coz `.onsuccess` is fired multiple times
     * @return {Object} Error or null
     */
    async open_cursor(Range,Direction="next", func){ // "nextunique", "prev", "prevunique"
        try {         
            if (Range==null)   
                var Req = this.self.openCursor();
            else
                var Req = this.self.openCursor(Range.self, Direction);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                var Cursor = Ev.target.result;

                if (Cursor!=null){ 
                    func(Cursor);
                    Cursor.continue();
                }
                else 
                    unlock(null);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Open key cursor (cursor with no .value)<br>
     * Use callback `func` with cursor coz `.onsuccess` is fired multiple times
     * @return {Object} Error or null
     */
    async open_key_cursor(Range,Direction="next", func){ // "nextunique", "prev", "prevunique"
        try {         
            if (Range==null)   
                var Req = this.self.openKeyCursor();
            else
                var Req = this.self.openKeyCursor(Range.self, Direction);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                var Cursor = Ev.target.result;

                if (Cursor!=null){ 
                    func(Cursor);
                    Cursor.continue();
                }
                else 
                    unlock(null);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }

    /**
     * Put (UPSERT) value to store, 
     * Item.id==null|notExisting -> INSERT, Item.id!=null -> UPDATE
     * @return {Object} Error or result
     */
    async put(Item,Range){
        try {            
            if (Range==null)
                var Req = this.self.put(Item);
            else
                var Req = this.self.put(Item,Range.self);

            var [Lock,unlock] = new_lock();

            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = function(Ev){
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            return Dom_Exception;
        }
    }
}

// Module export
export default object_store;
// EOF