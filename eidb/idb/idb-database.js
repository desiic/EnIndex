/**
 * @module eidb/idb/idb_database
 */
// Modules
import base from "../base.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * `eidb.idb.idb_database` IDBDatabase class wrapper
 */
class idb_database {

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
     */
    get Name(){
        return this.self.name;
    }

    /**
     * Get objectStoreNames
     */
    get Object_Store_Names(){
        return [...this.self.objectStoreNames];
    }

    /**
     * Get version
     */
    get version(){
        return this.self.version;
    }
}

// Module export
export default idb_database;
// EOF