/**
 * @module eidb/idb/index
 */

// Modules
import base              from "../base.js";
import object_store      from "./object-store.js";
import key_range         from "./key-range.js";
import cursor            from "./cursor.js";
import cursor_with_value from "./cursor-with-value.js";

// Shorthands
var   log      = console.log;
var   logw     = console.warn;
var   loge     = console.error;
const new_lock = base.new_lock;

function OX_INDENT_ONERROR_ONSUCCESS(){}
function $_____CLASS_____(){}

/**
 * IDBIndex class wrapper
 */
class index {
    self = null;

    /**
     * Constructor
     */
    constructor(Idb_Index){
        this.self = Idb_Index;
    }
    
    #_____SETS_AND_GETS_____(){}

    /**
     * Get key path
     */
    get Key_Path(){
        return this.self.keyPath;
    }

    /**
     * Get multiEntry 
     */ 
    get multientry(){
        return this.self.multiEntry;
    }

    /**
     * Get name
     */
    get Name(){
        return this.self.name;
    }

    /**
     * Get object store
     */ 
    get Object_Store(){
        return new object_store(this.self.objectStore);
    }

    /**
     * Get unique
     */ 
    get unique(){
        return this.self.unique;
    }
    
    #_____METHODS_____(){}

    /**
     * Count
     */
    async count(Range){
        try {
            if (Range==null)
                var Req = this.self.count();
            else{
                if (Range.constructor == key_range)
                    var Req = this.self.count(Range.self);
                else
                    var Req = this.self.count(Range);
            }

            var [Lock,unlock] = new_lock();

            Req.onerror = (Ev)=>{
                unlock(Ev.target.error);
            };
            Req.onsuccess = (Ev)=>{
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            loge("[EI] index.count: Error:",Dom_Exception);
            return Dom_Exception;
        }            
    }

    /**
     * Get
     */
    async get(Range){
        try {
            if (Range==null)
                var Req = this.self.get();
            else{
                if (Range.constructor == key_range)
                    var Req = this.self.get(Range.self);
                else
                    var Req = this.self.get(Range);
            }

            var [Lock,unlock] = new_lock();

            Req.onerror = (Ev)=>{
                unlock(Ev.target.error);
            };
            Req.onsuccess = (Ev)=>{
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            loge("[EI] index.get: Error:",Dom_Exception);
            return Dom_Exception;
        }            
    }

    /**
     * Get all
     */
    async get_all(Range, max){
        try {
            if (Range==null)
                var Req = this.self.getAll();
            else{
                if (Range.constructor==key_range)
                    var Req = this.self.getAll(Range.self, max);
                else
                    var Req = this.self.getAll(Range, max);
            }

            var [Lock,unlock] = new_lock();

            Req.onerror = (Ev)=>{
                unlock(Ev.target.error);
            };
            Req.onsuccess = (Ev)=>{
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            loge("[EI] index.get_all: Error:",Dom_Exception);
            return Dom_Exception;
        }            
    }

    /**
     * Get all keys (key field of doc only)
     */
    async get_all_keys(Range, max){
        try {
            if (Range==null)
                var Req = this.self.getAllKeys();
            else{
                if (Range.constructor==key_range)
                    var Req = this.self.getAllKeys(Range.self, max);
                else
                    var Req = this.self.getAllKeys(Range, max);
            }

            var [Lock,unlock] = new_lock();

            Req.onerror = (Ev)=>{
                unlock(Ev.target.error);
            };
            Req.onsuccess = (Ev)=>{
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            loge("[EI] index.get_all_keys: Error:",Dom_Exception);
            return Dom_Exception;
        }            
    }

    /**
     * Get key (key field only)
     */
    async get_key(Range){
        try {
            if (Range==null)
                var Req = this.self.getKey();
            else{
                if (Range.constructor==key_range)
                    var Req = this.self.getKey(Range.self);
                else
                    var Req = this.self.getKey(Range);
            }

            var [Lock,unlock] = new_lock();

            Req.onerror = (Ev)=>{
                unlock(Ev.target.error);
            };
            Req.onsuccess = (Ev)=>{
                unlock(Ev.target.result);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            loge("[EI] index.get_key: Error:",Dom_Exception);
            return Dom_Exception;
        }            
    }

    /**
     * Open cursor<br>
     * Use callback `func` with cursor coz `.onsuccess` is fired multiple times.
     * There's no cursor close in IndexedDB, callback returns "stop" to stop the cursor, 
     * will be terminated by transaction end.
     */
    async open_cursor(Range,Direction="next",func){ 
        try {         
            if (Range==null)   
                var Req = this.self.openCursor();
            else{
                if (Range.constructor==key_range)
                    var Req = this.self.openCursor(Range.self, Direction);
                else
                    var Req = this.self.openCursor(Range, Direction);
            }

            var [Lock,unlock] = new_lock();

            // Events
            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = async function(Ev){
                var Cursor = Ev.target.result;

                if (Cursor!=null){ 
                    let guide = await func(Cursor);

                    if (guide=="stop")
                        unlock(); // Don't call Cursor.continue()
                    else
                        Cursor.continue();
                }
                else 
                    unlock(null);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            loge("[EI] index.open_cursor: Error:",Dom_Exception);
            return Dom_Exception;
        }            
    }

    /**
     * Open key cursor<br>
     * Use callback `func` with cursor coz `.onsuccess` is fired multiple times.
     * There's no cursor close in IndexedDB, callback returns "stop" to stop the cursor, 
     * will be terminated by transaction end.
     */
    async open_key_cursor(Range,Direction="next",func){
        try {         
            if (Range==null)   
                var Req = this.self.openCursor();
            else{
                if (Range.constructor==key_range)
                    var Req = this.self.openCursor(Range.self, Direction);
                else
                    var Req = this.self.openCursor(Range, Direction);
            }

            var [Lock,unlock] = new_lock();

            // Events
            Req.onerror = function(Ev){
                unlock(Ev.target.error);
            };
            Req.onsuccess = async function(Ev){
                var Cursor = Ev.target.result;

                if (Cursor!=null){ 
                    let guide = await func(Cursor);

                    if (guide=="stop")
                        unlock(); // Don't call Cursor.continue()
                    else
                        Cursor.continue();
                }
                else 
                    unlock(null);
            };
            return await Lock;
        }
        catch (Dom_Exception){
            loge("[EI] index.open_key_cursor: Error:",Dom_Exception);
            return Dom_Exception;
        }            
    }

    #_____EXTENDED_METHODS_____(){}

    /**
     * Delete using index instead of primary key
     */
    async delete(Range){
        var count = 0;

        await this.open_cursor(Range,"next",(Cursor)=>{
            Cursor.delete();
            count++;
        });

        return count;
    }
}

export default index;
// EOF