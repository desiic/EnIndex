/**
 * @module eidb/idb/factory
 */
// Modules
import eidb        from "../../eidb.js";
import base        from "../base.js";
import database    from "./database.js";
import transaction from "./transaction.js";

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
     * Get the list of databases, using the instance of IDBFactory set by constructor
     * @return {Object} Error or the list of database names
     */
    async databases(){
        try {
            return await this.self.databases();
        }
        catch (Dom_Exception){
            loge("[EI] factory.databases: Error:",Dom_Exception);
            return Dom_Exception;
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
     * @return {Object} Error or the database object<br/>
     *                  <ul><b>4 cases of returned value:</b>
     *                      <li>`Err.Status = "errored"`</li>
     *                      <li>`Err.Status = "blocked", Err.Event = Event_Obj`</li>
     *                      <li>`Db.to_upgrade = true, Db.Transaction to use`</li>
     *                      <li>`Db.to_upgrade = false`</li>
     *                  </ul>
     */
    async open(Name, version){
        try {
            var Req = this.self.open(Name,version);
        }
        catch (Err){ // eg. when version is 0 or negative
            loge("[EI] idb.open: Error caught:",Err);
            Err.Status = "errored";
            return Err;
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
            // TO-DO: Fix "DOMException: The connection was closed" when callin open_av,
            // open_av already returned db with to-upgrade but this onerror still fired.
            // Temporary commented this error log line out:
            // loge("[EI] idb.open: Failed with error:",Ev.target.error);            
            Err_Obj = Ev.target.error;
            unlock("errored"); // Nothing next but just clear the lock, no sequence to cancel
        };        
        Req.onblocked = function(Ev){
            logw(`[EI] idb.open: Upgrade blocked, requested to change to version ${version}`);
            logw("[EI] Check source code, shouldn't be blocked by connections in current tab or other tabs.");
            logw("[EI] Tip: Avoid being blocked by using temporary connections in all tabs\x20"+
                 "together with IDBDatabase.versionchange event.");

            Ev_Obj = Ev;     
            unlock("blocked");
            Sequence_Cancel_Reason = "blocked";
        };
        Req.onupgradeneeded = function(Ev){
            if (Sequence_Cancel_Reason != null){
                logw(`[EI] idb.open: Upgrade cancelled due to '${Sequence_Cancel_Reason}' event fired right previously`);
                unlock(); // Redundant, no longer awaited
                return;
            }

            log(`[EI] idb.open: Upgrade needed, to version ${version}`);
            unlock("to-upgrade");
            Sequence_Cancel_Reason = "to-upgrade";
        };
        Req.onsuccess = function(Ev){
            if (Sequence_Cancel_Reason != null){
                logw(`[EI] idb.open: Open cancelled due to '${Sequence_Cancel_Reason}' event fired right previously`);
                unlock(); // Redundant, no longer awaited
                return;
            }

            // log(`[EI] idb.open: Database opened successfully`); // Avoid log polution, commented out
            unlock("opened");
        };
        var Result = await Lock;

        if (Result=="errored"){   
            Err_Obj.Status = "errored";
            return Err_Obj; // Error, no .result        
        }

        if (Result=="blocked"){ 
            let Err_Obj    = new Error("Upgrade is blocked by other connections, close them all first.");
            Err_Obj.Status = "blocked";
            Err_Obj.Event  = Ev_Obj;
            return Err_Obj;
        }
        
        // To upgrade: Caller to upgrade, close, and reopen db
        if (Result=="to-upgrade"){ 
            let Db = new database(Req.result); // .result is IDBDatabase object    
            Db.to_upgrade  = true;
            Db.Transaction = new transaction(Req.transaction);

            // Count number of connections
            if (eidb._num_db_cons==null) eidb._num_db_cons =1;
            else                         eidb._num_db_cons+=1;

            return Db;
        }

        // Db opened normally
        if (Result=="opened"){ 
            let Db = new database(Req.result); // .result is IDBDatabase object    
            Db.to_upgrade = false;

            // Count number of connections
            if (eidb._num_db_cons==null) eidb._num_db_cons =1;
            else                         eidb._num_db_cons+=1;
            
            return Db;
        }
    }
}

// Module export
export default factory;
// EOF