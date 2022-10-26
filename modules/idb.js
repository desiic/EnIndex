// Modules
import base        from "./base.js";
import idb_factory from "./idb/idb-factory.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;

/** 
 * eidb.idb, IndexedDB wrapper
 */
class idb{
    static idb_factory = idb_factory;

    /** 
     * Open db
     */
    static async open(Name, version){
        try {
            var Req = window.indexedDB.open(Name,version);
        }
        catch (Err){
            loge("idb.open: Error caught:",Err);
            return null;
        }

        // Lock to wait for callback
        var [Lock,Unlock] = new_lock();

        // Operation sequences may happen:
        //   - error
        //   - blocked -(wait for closing all connections)-> upgrade -> success
        //   - upgrade -> success
        var Sequence_Cancel_Reason = null;

        Req.onerror = function(Ev){
            loge("idb.open: Failed with error:",Ev.target.error);
            Unlock("error"); // Nothing next but just clear the lock, no sequence to cancel
        };        
        Req.onblocked = function(Ev){
            logw(`idb.open: Upgrade blocked, requested to change to version ${version}`);
            logw("Check source code, shouldn't be blocked by connections in current tab or other tabs.");
            logw("Tip: Avoid being blocked by using temporary connections in all tabs\x20"+
                 "together with IDBDatabase.versionchange event.");
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
            return [Result, null]; // Error, no .result        
        if (Result=="blocked") 
            return [Result, null]; // The request has not finished, no .result yet,
                                   // waiting for other connections to close.
        // This returns either db from upgrade or success event,
        // upgrade+close+reopen if it is upgrading case.
        if (Result=="upgrade" || Result=="success") 
            return [Result, Req.result]; // .result is IDBDatabase object
    }
}

// Module export
export default idb;
// EOF