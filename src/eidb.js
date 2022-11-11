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
import base      from "./eidb/base.js";
import idb       from "./eidb/idb.js";
import idbx      from "./eidb/idbx.js";
import factory   from "./eidb/idb/factory.js";
import key_range from "./eidb/idb/key-range.js";

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

/**
 * Main class of EnIndex library, can be used directly under global scope, 
 * that is `window.eidb` or just `eidb`. It contains mainly sub-namespaces
 * and static aliases to static methods.
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
     * Alias of `eidb.idbx.do_op` [See here](module-eidb_idbx-idbx.html#.do_op)
     */
    static do_op = idbx.do_op;

    /**
     * Alias of `eidb.idb.delete_database` [See here](module-eidb_idb-idb.html#.delete_database)
     */
    static delete_database = idb.delete_database;
}

/*
Range	            Code
All keys ≥ x	    IDBKeyRange.lowerBound (x)
All keys > x	    IDBKeyRange.lowerBound (x, true)
All keys ≤ y	    IDBKeyRange.upperBound (y)
All keys < y	    IDBKeyRange.upperBound (y, true)
All keys ≥ x && ≤ y	IDBKeyRange.bound (x, y)
All keys > x &&< y	IDBKeyRange.bound (x, y, true, true)
All keys > x && ≤ y	IDBKeyRange.bound (x, y, true, false)
All keys ≥ x &&< y	IDBKeyRange.bound (x, y, false, true)
The key = z	        IDBKeyRange.only (z)
*/
/**
 * Indicates that left value in index value range is included
 */
const WITH_LEFT = false;

/**
 * Indicates that right value in key range is included
 */
const WITH_RIGHT = false;

/**
 * Indicates that left value in key range is EXCLUDED
 */
const NO_LEFT = true;

/**
 * Indicates that right value in key range is EXCLUDED
 */
const NO_RIGHT = true;

/**
 * Key range (greater than or equal)
 */
const range_gte = (x)=>new key_range(IDBKeyRange.lowerBound(x));

/**
 * Key range (greater than)
 */
const range_gt = (x)=>new key_range(IDBKeyRange.lowerBound(x, true));

/**
 * Key range (less than or equal)
 */
const range_lte = (y)=>new key_range(IDBKeyRange.upperBound(y)); 

/**
 * Key range (less than)
 */
const range_lt = (y)=>new key_range(IDBKeyRange.upperBound(y, true)); 

/**
 * Key range between 2 values: [..], (..], [..), or (..)
 * @param {Any}     x   - Left value
 * @param {Any}     y   - Right value
 * @param {Boolean} exl - Indicates whether to exclude left value
 * @param {Boolean} exr - Indicates whether to exclude right value
 */
const range_between = (x,y,exl,exr)=>new key_range(IDBKeyRange.bound(x,y, exl,exr));

/**
 * Key range of exact only 1 value
 */
const value_is = (z)=>new key_range(IDBKeyRange.only(z));

// Bind to global scope
window.WITH_LEFT     = WITH_LEFT;
window.WITH_RIGHT    = WITH_RIGHT;
window.NO_LEFT       = NO_LEFT;
window.NO_RIGHT      = NO_RIGHT;
window.range_gte     = range_gte;
window.range_gt      = range_gt;
window.range_lte     = range_lte;
window.range_lt      = range_lt;
window.range_between = range_between;
window.value_is      = value_is;

// Global bindings, base functionalities
/** 
 * Create async/await lock, example:
 * ```
 * var [Lock,unlock] = new_lock();
 * ```
 */
/** @func new_lock */
const new_lock = base.new_lock;
window.new_lock = new_lock;

// Global bindings, others
/**
 * Read-only transaction mode
 */
var RO = eidb.RO;
window.RO = RO;

/**
 * Read-write transaction mode
 */
var RW = eidb.RW;
window.RW = RW;

// Global bindings, whole lib
// EnIndex library global object
window.eidb = eidb;

/**
 * Note
 * ----
 * 
 * ### All members & methods of this module are bound to global scope under `window` object.
 * 
 * Examples
 * --------
 * 
 * Open database with automatic versioning
 * ```
 * var [Err,Db] = eidb.open_av("my-db", Indices);
 * ```
 */

// WARNING: The 'Examples' block above should be right above this export
// to be used as module description by JSDoc.
// Module export, for submodules to use only, outer JS uses window.* above
export default eidb; 
// EOF