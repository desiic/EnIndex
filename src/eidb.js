/**
 * @module eidb
 */
// EnIndex
// Encrypted IndexedDB for JavaScript
// Convenient wrapper for IndexedDB APIs with encryption
// See: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

// Conventions
// ===========
// Naming rules:
// Rather similar to natural language, only my_primitive is maths
// Rather similar to C++ STL standard, only My_Compound differs
//   - my_namespace -- Generic nouns,    eg. app.ui.utils
//   - my_class     -- Generic nouns,    eg. technical_manager
//   - my_method    -- Verbs, aux verbs, eg. process_documents
//   - my_primitive -- Specific nouns,   eg. i, j, k, n (maths var with both lower and upper-case)
//   - My_Compound  -- Specific nouns,   eg. John_Doe   (maths var with both lower and upper-case)
//   - MY_INSTANCE  -- Numbers, digits,  eg. MAX_PRICE
// Other guides:
//   - Line <80 chars, max 120 chars
//   - Max 100 lines per function
//   - Max 100 functions per file
//   - Try to reduce lines but more comments

// Modules
import base    from "./eidb/base.js";
import idb     from "./eidb/idb.js";
import idbx    from "./eidb/idbx.js";
import factory from "./eidb/idb/factory.js";

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

/**
 * Main class of EnIndex library, can be used directly under global scope, 
 * that is `window.eidb` or just `eidb`.
 */
class eidb {

    /**
     * _________________________________________________________________________
     */
    SUB_NAMESPACES;

    /**
     * Sub-namespace, IndexedDB wrapper
     */
    static idb = idb;

    /**
     * Sub-namespace, IndexedDB extended features
     */
    static idbx = idbx;

    /**
     * _________________________________________________________________________
     */
    CONSTANTS;

    /**
     * Read-only mode for creating transaction
     */
    static RO = "readonly";

    /**
     * Read-write mode for creating transaction
     */
    static RW = "readwrite";

    /**
     * _________________________________________________________________________
     */
    PROPERTIES;

    /**
     * Global idb_factory
     */
    static Factory = new factory(window.indexedDB);

    /**
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Alias of `eidb.idb.databases` [See here](module-eidb_idb-idb.html#.databases)
     */
    static databases = idb.databases;

    /**
     * Alias of `eidb.idb.open` [See here](module-eidb_idb-idb.html#.open)
     * ```
     * // Example
     * var [Err,Result] = await eidb.open("my-db-name")
     * ```
     */
    static open = idb.open;

    /**
     * Alias of `eidb.idbx.open_av` [See here](module-eidb_idbx-idbx.html#.open_av)
     */
    static open_av = idbx.open_av;

    /**
     * Alias of `eidb.idb.delete_database` [See here](module-eidb_idb-idb.html#.delete_database)
     */
    static delete_database = idb.delete_database;
}

/**
 * Examples
 * --------
 * 
 * Open database with automatic versioning
 * ```
 * var [Err,Db] = idbx.open_av("my-db", Indices);
 * ```
 */

// Global bindings, base functionalities
window.new_lock = base.new_lock;

// Global bindings, whole lib
window.eidb = eidb;
window.RO   = eidb.RO;
window.RW   = eidb.RW;

// Module export, for submodules to use only, outer JS uses window.* above
export default eidb; 
// EOF