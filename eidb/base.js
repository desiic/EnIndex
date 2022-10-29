/**
 * @module eidb/base
 */
// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

/** 
 * `eidb.base` Base functionality class
 */
class base{

    /**
     * Create async/await lock
     */
    static new_lock(){
        var unlock, Lock=new Promise((res,rej)=>{ unlock=res; });
        return [Lock, unlock];
    }
}

// Module export
export default base;
// EOF