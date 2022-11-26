/**
 * @module eidb/idb/open_db_request
 */

// Modules
import request from "../idb/request.js";

/**
 * IDBOpenDbRequest wraper class
 */
class open_db_request extends request {
    self = null;

    /**
     * Constructor
     */
    constructor(Idb_Open_Db_Request){
        this.self = Idb_Open_Db_Request;
    }

    /**
     * _________________________________________________________________________
     */
    EVENTS;

    /**
     * On blocked
     */
    set on_blocked(callback){
        this.self.onblocked = callback;
    }

    /**
     * On upgrade needed
     */ 
    set on_upgrade_needed(callback){
        this.self.onupgradeneeded = callback;
    }
}

export default open_db_request;
// EOF