/**
 * @module eidb/idbx
 */
// Modules
import eidb    from "../eidb.js";
import idb     from "./idb.js";
import crud    from "./idbx/crud.js";
import op_hist from "./idbx/op-hist.js";
import fts     from "./idbx/fts.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var obj2json = JSON.stringify;
var json2obj = JSON.parse;

function $_____CONSTANTS_____(){}

// Literals
const n1=1, n2=2, u1=3, u2=4; // Match values in eidb.js

// Constants
// Default indices
// Internal data for both unencrypted & encrypted
var _DEFAULT_INDICES = {};
_DEFAULT_INDICES["_meta"] = {
    Store:u1 // Store name or "_global" for global
    // Non indexed: See idbxs.js
};

// OPERATION HISTORY STORE:
// Docmetas array is supposed to contain unique values but laxed, this array is
// sorted to have most recent items first, no duplication.<br/>
// Sample op_hist object:
// {
//     Store_Name: String, 
//     Recent_Creates: [{
//         id:        Integer,
//         Timestamp: Date
//     }],
//     Recent_Reads: ...,
//     Recent_Updates: ...,
//     Recent_Deletes: ...
// }
// Operation history store indices:
_DEFAULT_INDICES["op_hist"] = {
    Store_Name:1
    // Non indexed: Recent_*
};

// Encrypted
_DEFAULT_INDICES["#op_hist"] = { 
    // None, secure op history is the same as regular op hist
};

// FULL-TEXT SEARCH STORE
// Algorithm complexity: O(n * logn)
// Full text search store indices, data about words & ids:
_DEFAULT_INDICES["fts_words"] = {
    Store:              1,  // Store name, FTS find step1: O(1)
    Word:               1,  // A single-word term to search            
    "Store,Word":       u1, // Compound to look up

    // Other indices:
    num_obj_ids:        1,  // To select the first term with fewest ids
};
_DEFAULT_INDICES["fts_ids"] = {    
    Store:              1,  // Store name, FTS outer loop O(n), in-next-set operation O(logn)
    Word:               1,  // A single-word term to search            
    "Store,Word":       1,  // Not unique due to multiple obj_id(s)

    // Other indices:
    obj_id:             1,  // A single object id of object containing Word
    "Store,obj_id":     1,  // To remove all unused words on 'update', 'delete'
    "Store,Word,obj_id":u1  // Compound index to find if Store+Word+obj_id exists (set intersection),
                            // this compound value is always true, or doesn't exist.
};        

// Encrypted
_DEFAULT_INDICES["#fts_words"] = { 
    Store:              1,  // Store name, FTS find step1: O(1)
    Word:               1,  // A single-word term to search            
    "Store,Word":       u1, // Compound to look up

    // Other indices:
    num_obj_ids:        1,  // To select the first term with fewest ids
};
_DEFAULT_INDICES["#fts_ids"] = {
    Store:              1,  // Store name, FTS outer loop O(n), in-next-set operation O(logn)
    Word:               1,  // A single-word term to search            
    "Store,Word":       1,  // Not unique due to multiple obj_id(s)

    // Other indices:
    obj_id:             1,  // A single object id of object containing Word
    "Store,obj_id":     1,  // To remove all unused words on 'update', 'delete'
    "Store,Word,obj_id":u1  // Compound index to find if Store+Word+obj_id exists (set intersection),
                            // this compound value is always true, or doesn't exist.
};

function $_____CLASS_____(){}

/** 
 * `eidb.idbx` IndexedDB extended feature class
 */ 
class idbx {
    
    #_____SUB_NAMESPACES_____(){}

    /**
     * CRUD functionalities
     */
    static crud;

    /**
     * Op history features
     */ 
    static op_hist;

    /**
     * FTS features
     */
    static fts;
    
    #_____PROPERTIES_____(){}

    /**
     * Index schema saved when open_av
     */ 
    static Indices = {};
    
    #_____METHODS_____(){}
    #_____Utils_____(){}

    /**
     * Check if is unused store (=is an existing store + is flagged as unused)
     * @private
     */
    static #is_unused_store(Db,Store_Name){
        if (localStorage.Unused_Stores==null || localStorage.Unused_Stores.trim().length==0)
            return false;

        // Not an actual store
        if (Db.Object_Store_Names.indexOf(Store_Name) == -1)
            return false;

        // Check flag
        let Unused_Stores = json2obj(localStorage.Unused_Stores);
        return Unused_Stores.indexOf(Store_Name)>=0;
    }

    /**
     * Fix unused store list, if lower calls to IndexedDB altered it inc. calls to idb.*
     */ 
    static #fix_unused_store_list(Db){
        if (localStorage.Unused_Stores==null || localStorage.Unused_Stores.trim().length==0)
            return false;

        var Store_Names = Db.Object_Store_Names;

        // Remove trash flags (ignored stores but actually don't exist)
        var Names      = json2obj(localStorage.Unused_Stores);
        var Keep_Names = [];

        for (let Name of Names)
            if (Store_Names.indexOf(Name) >= 0)
                Keep_Names.push(Name);

        // Set back to localStorage
        localStorage.Unused_Stores = obj2json(Keep_Names);
    }

    /**
     * Update unused store list
     * @private
     */
    static #update_unused_store_list(Op,Store_Name){
        if (Op=="add"){
            if (localStorage.Unused_Stores==null || localStorage.Unused_Stores.trim().length==0)
                localStorage.Unused_Stores = obj2json([Store_Name]);
            else{
                // Load
                let Unused_Stores = json2obj(localStorage.Unused_Stores);
                // Combine
                Unused_Stores = Array.from(new Set([...Unused_Stores,Store_Name]));
                // Save
                localStorage.Unused_Stores = obj2json(Unused_Stores);
            }
        }
        else 
        if (Op=="remove"){
            if (localStorage.Unused_Stores==null || localStorage.Unused_Stores.trim().length==0)
                localStorage.Unused_Stores = obj2json([]);
            else{
                // Load
                let Unused_Stores = json2obj(localStorage.Unused_Stores);
                
                // Remove
                let idx = Unused_Stores.indexOf(Store_Name);
                if (idx>=0) Unused_Stores.splice(idx,1);
                
                // Save
                localStorage.Unused_Stores = obj2json(Unused_Stores);
            }
        }
        // No other ops
    }

    /**
     * Index name to keypath
     * ```
     * foobar -> foobar
     * foo,bar -> ["foo","bar"]
     * ```
     */
    static indexname_to_keypath(Indexname){
        if (Indexname.indexOf(",") >= 0)
            return Indexname.split(",");

        return Indexname;    
    }

    /**
     * Keypath to index name
     * ```
     * ["foo","bar"] -> "foo,bar"
     * "foobar -> "foobar"
     * "foo,bar" -> "foo,bar"
     * ```
     */ 
    static keypath_to_indexname(Keypath){
        if (Keypath.constructor === Array)
            return Keypath.join(",");
        
        // String keypath
        return Keypath;
    }

    #_____Database_____(){}

    /** 
     * Check if db name exists
     */
    static async db_exists(Db_Name){
        var Db_Names = (await idb.databases(Db_Name)).map(Db=>Db.name);
        if (Db_Names.indexOf(Db_Name) == -1) return false;
        return true;
    }

    /**
     * Get current indices
     */
    static async get_cur_indices(Db_Name){
        if (!await thisclass.db_exists(Db_Name)) return {};
        var Db = await idb.open(Db_Name);

        // Check empty db, no stores
        var Indices = {};

        if (Db.Object_Store_Names.length == 0) {
            Db.close();
            return Indices;
        }

        // Get indices
        var T = Db.transaction(Db.Object_Store_Names,eidb.RO);

        for (let Store_Name of Db.Object_Store_Names){
            // Ignore unused store to avoid upgrade being triggered again and again
            if (idbx.#is_unused_store(Db,Store_Name))
                continue;

            // Make index schema
            let S               = T.object_store(Store_Name);
            Indices[Store_Name] = {};     

            for (let Index_Name of S.Index_Names){
                let I          = S.index(Index_Name);
                let Key_Path   = I.Key_Path;
                var Key_Name   = idbx.keypath_to_indexname(Key_Path);
                let unique     = I.unique;
                let multientry = I.multientry;
                let type;

                if (unique==false && multientry==false) type=1; // n1
                else
                if (unique==false && multientry==true)  type=2; // n2
                else
                if (unique==true  && multientry==false) type=3; // u1
                else
                if (unique==true  && multientry==true)  type=4; // u2
                else{}

                Indices[Store_Name][Key_Name] = type;
            }
        }

        Db.close();
        return Indices;
    }

    /**
     * Add more indices, including op hist & FTS to indices<br/>
     * Internal-use stores (private): _*, for example: _my_store<br/>
     * encrypted stores    (hashed):  #*, for example: #my_store
     */
    static add_more_indices(Indices){                
        return {...Indices,..._DEFAULT_INDICES};     
    }

    /**
     * Convert index schema to string to diff
     */
    static indices2str(Indices){
        var Arr = [];
        
        for (let Store_Name in Indices)
            for (let Index_Name in Indices[Store_Name]){
                let type = Indices[Store_Name][Index_Name];
                Arr.push(`${Store_Name}/${Index_Name}:${type};`);
            }

        Arr.sort();
        return Arr.join("");
    }

    /**
     * Get current db version
     */ 
    static async get_cur_db_ver(Db_Name){
        var Db  = await idb.open(Db_Name);
        var ver = Db.version;
        Db.close();
        return ver;
    }

    /**
     * Upgrade db
     */
    static async upgrade_db(Db_Name, Cur_Indices, New_Indices){
        if (await thisclass.db_exists(Db_Name)){
            var ver     = await idbx.get_cur_db_ver(Db_Name);
            var new_ver = ver+1;
        }
        else{
            var ver     = 0;
            var new_ver = ver+1;
        }
        log("[EI] idbx.upgrade_db: Upgrading to version",new_ver);

        // Open db with new version will trigger upgrade
        var Db = await idb.open(Db_Name, new_ver);

        if (Db instanceof Error){
            loge("[EI] idbx.upgrade_db: Failed to open db,", Db);
            return;
        }

        // Delete unused stores (and their indices)
        var Cur_Stores = Object.keys(Cur_Indices);
        var New_Stores = Object.keys(New_Indices);
        var Del_Stores = [];

        for (let Store_Name of Cur_Stores)
            if (New_Stores.indexOf(Store_Name) == -1)
                Del_Stores.push(Store_Name);

        for (let Store_Name of Del_Stores){
            log("[EI] idbx.upgrade_db: Found unused store:",Store_Name);
            // WARN: AVOID LOSING USERS' DATA, WON'T DELETE, COMMENTED OUT:
            // Db.delete_object_store(Store_Name); // Indices are deleted together

            // Mark unused store as kinda deleted, not to trigger upgrade again
            idbx.#update_unused_store_list("add",Store_Name);
        }
        
        // Create new stores (and new indices)   
        var Cre_Stores = [];

        for (let Store_Name of New_Stores)
            if (Cur_Stores.indexOf(Store_Name)==-1){                
                if (!idbx.#is_unused_store(Db,Store_Name))
                    Cre_Stores.push(Store_Name); // Not existing, create
                else{
                    // Existing, but current index schema ignored Store_Name, 
                    // make empty entry to create all new indices for Store_Name
                    Cur_Indices[Store_Name] = {};
                    // Remove from unused store list coz it's now in index schema:
                    idbx.#update_unused_store_list("remove",Store_Name);
                }
            }

        for (let Store_Name of Cre_Stores){
            log("[EI] idbx.upgrade_db: Creating new store:",Store_Name);
            let S = Db.create_object_store(Store_Name);

            for (let Index_Name in New_Indices[Store_Name]){
                let type          = New_Indices[Store_Name][Index_Name];
                let Index_Keypath = idbx.indexname_to_keypath(Index_Name);
                log("[EI] idbx.upgrade_db: Creating new index:",Store_Name,"/",Index_Name);
                S.create_index(Index_Name,Index_Keypath,type);
            }
        }

        // Now left only the same stores to uprade
        var Same_Stores = [];
        var All_Stores  = Array.from(new Set([...Cur_Stores,...New_Stores]));

        for (let Store_Name of All_Stores)
            if (Del_Stores.indexOf(Store_Name)==-1 && Cre_Stores.indexOf(Store_Name)==-1)
                Same_Stores.push(Store_Name);

        // Delete unused indices, create new indices, and update changed indices
        var T = Db.Transaction;

        for (let Store_Name of Same_Stores){
            let S             = T.object_store(Store_Name);
            let Cur_Idx_Names = Object.keys(Cur_Indices[Store_Name]);
            let New_Idx_Names = Object.keys(New_Indices[Store_Name]);
            let Del_Idx_Names = [];
            let Cre_Idx_Names = [];

            // Del unused
            for (let Idx_Name of Cur_Idx_Names)
                if (New_Idx_Names.indexOf(Idx_Name)==-1){
                    log("[EI] idbx.upgrade_db: Deleting unused index:",Store_Name,"/",Idx_Name);
                    S.delete_index(Idx_Name);
                    Del_Idx_Names.push(Idx_Name);
                }

            // Create new
            for (let Idx_Name of New_Idx_Names)
                if (Cur_Idx_Names.indexOf(Idx_Name)==-1){
                    let type        = New_Indices[Store_Name][Idx_Name];
                    let Idx_Keypath = idbx.indexname_to_keypath(Idx_Name);
                    log("[EI] idbx.upgrade_db: Creating new index:",Store_Name,"/",Idx_Name);
                    S.create_index(Idx_Name,Idx_Keypath,type);
                    Cre_Idx_Names.push(Idx_Name);
                }

            // Update those changed (del, re-create with new type)
            let Same_Idx_Names = [];
            let All_Idx_Names  = Array.from(new Set([...Cur_Idx_Names,...New_Idx_Names]));

            for (let Idx_Name of All_Idx_Names)
                if (Del_Idx_Names.indexOf(Idx_Name)==-1 && Cre_Idx_Names.indexOf(Idx_Name)==-1)
                    Same_Idx_Names.push(Idx_Name);

            for (let Idx_Name of Same_Idx_Names)
                if (New_Indices[Store_Name][Idx_Name] != Cur_Indices[Store_Name][Idx_Name]){
                    let type        = New_Indices[Store_Name][Idx_Name];
                    let Idx_Keypath = idbx.indexname_to_keypath(Idx_Name);
                    log("[EI] idbx.upgrade_db: Updating index to new type:",Store_Name,"/",Idx_Name+":"+type);
                    S.delete_index(Idx_Name);
                    S.create_index(Idx_Name,Idx_Keypath, type); // New type
                }    
        }         
            
        // Close the db connection with upgrade transaction
        Db.close();
    }

    /**
     * Open db with version set automatically (av, ie. auto-versioning)
     * @param  {String} Db_Name - Database name
     * @param  {Object} Indices - Index schema of database
     * @return {Array}  Error or null, and database object
     */
    static async open_av(Db_Name,Indices){
        if (Db_Name==null) { 
            loge("[EI] idbx.open_av: Db name cannot be null");
            return;
        }
        if (Indices==null){
            loge("[EI] idbx.open_av: Indices name cannot be null");
            return;
        }        

        // Add schema for operation history and full-text search
        Indices = idbx.add_more_indices(Indices);

        // All id is primary field of u1 type (unique, single value)
        for (let Store_Name in Indices)
            Indices[Store_Name].id = u1;

        // Store index schema for later reference, eg. obj_to_sobj
        idbx.Indices = Indices;    

        // Db names
        var Dbnames = (await idb.databases(Db_Name)).map(X => X.name);

        // Check if indices changed
        eidb._Db_Name = Db_Name; // Save for reopen()
        var New_Indices = Indices;

        if (Dbnames.indexOf(Db_Name) >= 0) // Db is existing
            var Cur_Indices = await idbx.get_cur_indices(Db_Name);
        else
            var Cur_Indices = {}; // Db not existing, empty index schema

        var Cur_Indices_Str = idbx.indices2str(Cur_Indices);
        var New_Indices_Str = idbx.indices2str(New_Indices);

        // No indices changed, use current db
        if (New_Indices_Str == Cur_Indices_Str)
            return await idb.open(Db_Name);

        // Indices changed, upgrade
        await idbx.upgrade_db(Db_Name, Cur_Indices, New_Indices); // Open+close inside

        // Open db
        var Db = await idb.open(Db_Name);

        // Remove trash flags
        idbx.#fix_unused_store_list(Db); // No db ops in here

        return Db;
    }

    /**
     * Re-open db with name set by idb.open or idbx.open_av
     */
    static async reopen(Dbname=null){
        if (Dbname==null)
            return await idb.open(eidb._Db_Name);

        return await idb.open(Dbname);
    }

    /**
     * Get number of db connections
     */ 
    static num_db_cons(){
        return eidb._num_db_cons;
    }

    /**
     * Set db name<br/>
     * Don't call this method, for testing purpose
     */
    static set_db(Name){
        eidb._Db_Name = Name;
    }

    #_____Store_____(){}

    /**
     * Get store property
     * TO-DO: Add error checking
     */
    static async get_prop(Store_Name,Prop_Name){
        if (eidb._Db_Name==null || eidb._Db_Name.trim().length==0){
            loge("[EI] idbx.get_prop: Call 'idb.open', 'idbx.open_av', or 'idbx.set_db' first");
            return;
        }

        var Db     = await idb.open(eidb._Db_Name);
        var T      = Db.transaction(Store_Name,eidb.RW);
        var S      = T.store1();
        var Result = S[Prop_Name];
        return Result;
    }

    /**
     * Do an operation
     * TO-DO: Add error checking
     */
    static async do_op(Store_Name,Op_Name,...Args){
        if (eidb._Db_Name==null || eidb._Db_Name.trim().length==0){
            loge("[EI] idbx.do_op: Call 'idb.open', 'idbx.open_av', or 'idbx.set_db' first");
            return;
        }

        var Db     = await idb.open(eidb._Db_Name);
        var T      = Db.transaction(Store_Name,eidb.RW);
        var S      = T.store1();
        var Result = await S[Op_Name](...Args);
        return Result;
    }

    /**
     * Delete object store
     * WARN: AVOID USING THIS, SPECIAL OPERATIONS ON DB ONLY.
     */ 
    static async del_obj_store(Db_Name,Store_Name){
        var cur_ver = await idbx.get_cur_db_ver(Db_Name);
        var new_ver = cur_ver+1;

        // Trigger upgrade
        var Db = await idb.open(Db_Name, new_ver);

        if (Db instanceof Error){
            loge(`[EI] idbx.del_obj_store: Failed to delete object store '${Store_Name}' `+
                 `in db '${Db_Name}', error:`,Db);
            return;
        }

        // Del the store
        await Db.delete_object_store(Store_Name);

        // Update unused store list if deleted store is in that list
        idbx.#update_unused_store_list("remove", Store_Name);

        // Close the upgraded db
        Db.close();
    }

    #_____CORE_____(){}

    /**
     * Init
     */ 
    static init(){
        idbx.crud    = crud;
        idbx.op_hist = op_hist;
        idbx.fts     = fts;

        idbx.crud   .init(); 
        idbx.op_hist.init(); 
        idbx.fts    .init(); 
    }
}

// Module export
const thisclass = idbx;
export default thisclass;
// EOF