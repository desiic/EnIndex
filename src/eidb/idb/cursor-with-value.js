/**
 * @module eidb/idb/cursor_with_value
 */

// Modules
import cursor from "../idb/cursor.js";

/**
 * IDBCursorWithValue wraper class
 */
class cursor_with_value extends cursor {
    self = null;

    /**
     * Constructor
     */
    constructor(Idb_Cursor_With_Value){
        this.self = Idb_Cursor_With_Value;
    }

    /**
     * _________________________________________________________________________
     */
    SETS_AND_GETS;

    /**
     * Get value
     */
    get Value(){
        return this.self.value;
    }
}

export default cursor_with_value;
// EOF