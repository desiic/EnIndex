/**
 * @module eidb/idb/factory
 */
// Modules
import base     from "../base.js";
import database from "./database.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * `eidb.idb.factory` IDBFactory class wrapper
 */
class factory {
    
    /**
     * Properties
     */ 
    self = null;

    /**
     * Construct with the IDBFactory instance underhood
     * @param {IDBFactory} Idb_Factory - IDBFactory instance to use, usually 
     *                                   just `window.indexedDB`
     */
    constructor(Idb_Factory){
        this.self = Idb_Factory;
    }

    /**
     * IN ALPHABETIC ORDER MATCHING MOZILLA.ORG
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Get the list of databases, using the instance of IDBFactory set by constructor
     * @return {Array} 1st value: Error object or null<br/>
     *                 2nd value: The list of databases found, with `name` and `version` properties only.
     */
    async databases(){
        try {
            return [null,await this.self.databases()];
        }
        catch (Dom_Exception){
            return [Dom_Exception,null];
        }
    }

    /**
     * Delete database, using the instance of IDBFactory set by constructor
     * @param  {String}      Name - Name of the database to delete
     * @return {Object|null} Error object or null; note that it's no
     *                       errors when the database name doesn't exist
     */
     async delete_database(Name){
        var Req           = this.self.deleteDatabase(Name); // No exceptions
        var [Lock,unlock] = new_lock();

        Req.onerror = function(Ev){
            unlock(Ev.target.error);
        };
        Req.onsuccess = function(Ev){
            unlock(null);
        };
        return await Lock;
    }

    /** 
     * Open db using db name and a specific version, using the IDBFactory 
     * instance set by constructor     
     * @param  {String} Name    - Name of db to open
     * @param  {Number} version - Version of db (version of index schema), >= current ver
     * @return {Array}  1st value: Error object or null<br/>
     *                  2nd value: Result object `{Status:, Value:}`<br/>
     *                  <ul><b>4 cases of returned value:</b>
     *                      <li>`[Error_Obj, {Status:"errored",    null                 }]`</li>
     *                      <li>`[null,      {Status:"blocked",    Event_Obj            }]`</li>
     *                      <li>`[null,      {Status:"to-upgrade", database instance}]`</li>
     *                      <li>`[null,      {Status:"opened",     database instance}]`</li>
     *                  </ul>
     */
    async open(Name, version){
        try {
            var Req = this.self.open(Name,version);
        }
        catch (Err){ // eg. when version is 0 or negative
            loge("idb.open: Error caught:",Err);
            return [Err, {Status:"errored", Value:null}];
        }

        // Lock to wait for callback
        var [Lock,unlock] = new_lock();
        var Err_Obj       = null;
        var Ev_Obj        = null;

        // Operation sequences may happen:
        //   - error
        //   - blocked -(wait for closing all connections)-> upgrade -> success
        //   - upgrade -> success
        var Sequence_Cancel_Reason = null;

        Req.onerror = function(Ev){
            loge("idb.open: Failed with error:",Ev.target.error);            
            Err_Obj = Ev.target.error;
            unlock("errored"); // Nothing next but just clear the lock, no sequence to cancel
        };        
        Req.onblocked = function(Ev){
            logw(`idb.open: Upgrade blocked, requested to change to version ${version}`);
            logw("Check source code, shouldn't be blocked by connections in current tab or other tabs.");
            logw("Tip: Avoid being blocked by using temporary connections in all tabs\x20"+
                 "together with IDBDatabase.versionchange event.");

            Ev_Obj = Ev;     
            unlock("blocked");
            Sequence_Cancel_Reason = "blocked";
        };
        Req.onupgradeneeded = function(Ev){
            if (Sequence_Cancel_Reason != null){
                logw(`idb.open: Upgrade cancelled due to '${Sequence_Cancel_Reason}' event fired right previously`);
                unlock(); // Redundant, no longer awaited
                return;
            }

            log(`idb.open: Upgrade needed, to version ${version}`);
            unlock("to-upgrade");
            Sequence_Cancel_Reason = "to-upgrade";
        };
        Req.onsuccess = function(Ev){
            if (Sequence_Cancel_Reason != null){
                logw(`idb.open: Open cancelled due to '${Sequence_Cancel_Reason}' event fired right previously`);
                unlock(); // Redundant, no longer awaited
                return;
            }

            log(`idb.open: Database opened successfully`);
            unlock("opened");
        };
        var Result = await Lock;

        if (Result=="errored")   
            return [Err_Obj, {Status:Result, Value:null}]; // Error, no .result        
        if (Result=="blocked") 
            return [null, {Status:Result, Value:Ev_Obj}]; // The request has not finished, no .result yet,
                                              // waiting for other connections to close.
        // This returns either db from upgrade or success event,
        // upgrade+close+reopen if it is upgrading case.
        if (Result=="to-upgrade" || Result=="opened") 
            return [null, {Status:Result, Value:new database(Req.result)}]; // .result is IDBDatabase object    
    }
}

// Module export
export default factory;
// EOF