/**
 * @module eidb/idb/idb_factory
 */
// Modules
import base         from "../base.js";
import idb_database from "./idb-database.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * `eidb.idb.idb_factory` IDBFactory class wrapper
 */
class idb_factory {
    
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
     * Open db using db name and a specific version, using the IDBFactory 
     * instance set by constructor     
     * @param  {String} Name    - Name of db to open
     * @param  {Number} version - Version of db (version of index schema), >= current ver
     * @return {Array}  2 items which are result message and result object,
     *                  result message is a string, one of "error", "blocked", "upgrade", "success";
     *                  result object for error is error object, for blocked is an event,
     *                  for upgrade and success are both db object to use.<br/>
     *                  <ul><b>4 cases</b>:
     *                      <li>["error",   Error_Obj]            </li>
     *                      <li>["blocked", Event_Obj]            </li>
     *                      <li>["upgrade", idb_database instance]</li>
     *                      <li>["success", idb_database instance]</li>
     *                  </ul>
     */
     async open(Name, version){
        try {
            var Req = this.self.open(Name,version);
        }
        catch (Err){
            loge("idb.open: Error caught:",Err);
            return ["error",Err];
        }

        // Lock to wait for callback
        var [Lock,Unlock] = new_lock();
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
            Unlock("error"); // Nothing next but just clear the lock, no sequence to cancel
        };        
        Req.onblocked = function(Ev){
            logw(`idb.open: Upgrade blocked, requested to change to version ${version}`);
            logw("Check source code, shouldn't be blocked by connections in current tab or other tabs.");
            logw("Tip: Avoid being blocked by using temporary connections in all tabs\x20"+
                 "together with IDBDatabase.versionchange event.");

            Ev_Obj = Ev;     
            Unlock("blocked");
            Sequence_Cancel_Reason = "block";
        };
        Req.onupgradeneeded = function(Ev){
            if (Sequence_Cancel_Reason != null){
                logw(`idb.open: Upgrade cancelled due to '${Sequence_Cancel_Reason}' event fired right previously`);
                Unlock(); // Redundant, no longer awaited
                return;
            }

            log(`idb.open: Upgrade needed, to version ${version}`);
            Unlock("upgrade");
            Sequence_Cancel_Reason = "upgrade";
        };
        Req.onsuccess = function(Ev){
            if (Sequence_Cancel_Reason != null){
                logw(`idb.open: Open cancelled due to '${Sequence_Cancel_Reason}' event fired right previously`);
                Unlock(); // Redundant, no longer awaited
                return;
            }

            log(`idb.open: Database opened successfully`);
            Unlock("success");
        };
        var Result = await Lock;

        if (Result=="error")   
            return [Result, Err_Obj]; // Error, no .result        
        if (Result=="blocked") 
            return [Result, Ev_Obj]; // The request has not finished, no .result yet,
                                     // waiting for other connections to close.
        // This returns either db from upgrade or success event,
        // upgrade+close+reopen if it is upgrading case.
        if (Result=="upgrade" || Result=="success") 
            return [Result, new idb_database(Req.result)]; // .result is IDBDatabase object
    }

    /**
     * Delete database, using the instance of IDBFactory set by constructor
     * @param  {String}      Name - Name of the database to delete
     * @return {null|Object} null if no errors, or error Object; note that it's no
     *                       errors when the database name doesn't exist
     */
    async delete_database(Name){
        var Req           = this.self.deleteDatabase(Name);
        var [Lock,Unlock] = new_lock();

        Req.onerror = function(Ev){
            Unlock(Ev.target.error);
        };
        Req.onsuccess = function(Ev){
            Unlock(null);
        };
        return await Lock;
    }

    /**
     * Get the list of databases, using the instance of IDBFactory set by constructor
     * @return {Object|Array} Error object or the list of databases found, 
     *                        with `name` and `version` properties only.
     *                        Use `instance of Array` to check if it's not error.
     */
    async databases(){
        return await this.self.databases();
    }
}

// Module export
export default idb_factory;
// EOF