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
//   - my_primitive -- Specific nouns,   eg. i, j, k, n (specific nouns, but maths)
//   - My_Compound  -- Specific nouns,   eg. John_Doe
//   - MY_INSTANCE  -- Numbers, digits,  eg. MAX_PRICE
// Other guides:
//   - Line <80 chars, max 120 chars
//   - Max 100 lines per function
//   - Max 100 functions per file
//   - Try to reduce lines but more comments

// Modules
import base  from "./eidb/base.js";
import idb   from "./eidb/idb.js";
import idbx  from "./eidb/idbx.js";

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

/**
 * Create new async/await lock, can be called directly under global scope,
 * that is `window.new_lock()` or just `new_lock()`
 */
function new_lock(...Args){
    return base.new_lock(...Args);
}

/**
 * Main class of EnIndex library, can be used directly under global scope, 
 * that is `window.eidb` or just `eidb`
 */
class eidb {

    /**
     * Sub-namespace, IndexedDB wrapper
     */
    static idb = idb;

    /**
     * Sub-namespace, IndexedDB extended features
     */
    static idbx = idbx;

    /**
     * Alias of `eidb.idb.open` [See here](module-eidb_idb-idb.html#.open)
     */
    static open = idb.open;

    /**
     * Alias of `eidb.idbx.open_av`
     */
    static open_av = idbx.open_av;
}

// Global bindings, base functionalities
window.new_lock = new_lock;

// Global bindings, whole lib
window.eidb = eidb;
// EOF