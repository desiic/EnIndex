/**
 * @module eidb/idb/key_range
 */

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

function $_____CLASS_____(){}

/**
 * IDBKeyRange wrapper class
 */
class key_range {
    self = null;

    /**
     * Constructor
     * @param {IDBKeyRange} Idb_Key_Range - An IDBKeyRange object
     */
    constructor(Idb_Key_Range){
        this.self = Idb_Key_Range;
    }
    
    #_____SETS_AND_GETS_____(){}

    /**
     * Get lower
     */ 
    get Lower(){
        return this.self.lower;
    }

    /**
     * Get lowerOpen
     */ 
    get Lower_Open(){
        return this.self.lowerOpen;
    }

    /**
     * Get upper
     */ 
    get Upper(){
        return this.self.upper;
    }

    /**
     * Get upperOpen
     */ 
    get Upper_Open(){
        return this.self.upperOpen;
    }

    #_____METHODS_____(){}

    /**
     * Check inclusion
     */ 
    includes(Range){
        try {
            return this.self.includes(Range.self);
        }
        catch (Dom_Exception){
            loge("[EI] key_range.includes: Error:",Dom_Exception);
            return Dom_Exception;
        }
    }
}

export default key_range;
// EOF