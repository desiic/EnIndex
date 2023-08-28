/**
 * @module eidb/idb/request
 */

// Modules
import object_store      from "./object-store.js";
import index             from "./index.js";
import cursor            from "./cursor.js";
import cursor_with_value from "./cursor-with-value.js";

function $_____CLASS_____(){}

/**
 * IDBRequest wraper class
 */
class request {
    self = null;

    /**
     * Constructor
     */
    constructor(Idb_Request){
        this.self = Idb_Request;
    }
    
    #_____SETS_AND_GETS_____(){}

    /**
     * Get error
     */
    get Error(){
        return this.self.error;
    }

    /**
     * Get readyState
     */
    get Ready_State(){
        return this.self.readyState;
    }

    /**
     * Get result
     */
    get Result(){
        return this.self.result;
    }

    /**
     * Get source
     */
    get Source(){
        var Src = this.self.source;

        if (Src instanceof IDBObjectStore)     return new object_store(Src);
        if (Src instanceof IDBIndex)           return new index(Src);
        if (Src instanceof IDBCursorWithValue) return new cursor_with_value(Src);
        return new cursor(Src);
    }

    /**
     * Get transaction
     */ 
    get Transaction(){
        return new transaction(this.self.transaction);
    }
    
    #_____EVENTS_____(){}

    /**
     * On error
     */
    set on_error(callback){
        this.self.onerror = callback;
    }

    /**
     * On success
     */ 
    set on_success(callback){
        this.self.onsuccess = callback;
    }
}

export default request;
// EOF