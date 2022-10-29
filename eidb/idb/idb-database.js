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

    /**
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Close database connection
     * @return {null}
     */
    close(){
        return this.self.close();
    }

    /**
     * Create object store
     * @param  {String}           Name    - Name of object store
     * @param  {Object}           Options - Store options
     * @return {idb_object_store}
     */
    create_object_store(Name,Options=null){
        return new idb_object_store(this.self.createObjectStore(Name,Options));
    }
}

// Module export
export default idb_database;
// EOF