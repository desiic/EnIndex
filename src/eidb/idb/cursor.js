/**
 * @module eidb/idb/cursor
 */

// Modules
import base from "../base.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

function OX_INDENT_ONERROR_ONSUCCESS(){}
function $_____CLASS_____(){}

/**
 * IDBCursor wraper class
 */
class cursor {
    self = null;

    /**
     * Constructor
     */
    constructor(Idb_Cursor){
        this.self = Idb_Cursor;
    }
    
    #_____SETS_AND_GETS_____(){}

    /**
     * Get direction
     */ 
    get Direction(){
        return this.self.direction;
    }

    /**
     * Get key
     */ 
    get Key(){
        return this.self.key;
    }

    /**
     * Get primary key
     */
    get Primary_Key(){
        return this.self.primaryKey;
    }

    /**
     * Get request
     */ 
    get Request(){
        return new request(this.self.request);
    }

    /**
     * Get source
     */
    get Source(){
        var Src = this.self.source;

        if (Src instanceof IDBObjectStore) return new object_store(Src);
        return new index(Src);
    }
    
    #_____METHODS_____(){}

    /**
     * Advance cursor
     */ 
    advance(count){
        try {
            this.self.advance(count);
        }
        catch (Dom_Exception){
            loge("[EI] cursor.advance: Error:",Dom_Exception);
            return Dom_Exception;
        }
    }

    /**
     * Continue cursor
     */
    continue(Key){
        try {
            this.self.continue(Key);
        }
        catch (Dom_Exception){
            loge("[EI] cursor.continue(K): Error:",Dom_Exception);
            return Dom_Exception;
        }
    }

    /**
     * Continue with primary key
     */
    continue(Key,Prim_Key){
        try {
            this.self.continuePrimaryKey(Key,Prim_Key);
        }
        catch (Dom_Exception){
            loge("[EI] cursor.continue(K,Pk): Error:",Dom_Exception);
            return Dom_Exception;
        }
    }

    /**
     * Delete
     */
    async delete(){
        try {
            var Req = new request(this.self.delete());
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
            loge("[EI] cursor.delete: Error:",Dom_Exception);
            return Dom_Exception;
        }
    }

    /**
     * Update
     */
    async update(Value){
        try {
            var Req = new request(this.self.update(Value));
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
            loge("[EI] cursor.update: Error:",Dom_Exception);
            return Dom_Exception;
        }
    }
}

export default cursor;
// EOF