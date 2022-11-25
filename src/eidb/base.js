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

    /**
     * Stay idle for a number of milliseconds (similar to sleep but the thread
     * is actually still running, so it's not sleep)
     */ 
    static async stay_idle(ms){
        var Lock = new Promise((res,rej)=>{
            setTimeout(()=>{
                res();
            },ms);
        });
        await Lock;
    }
}

// Module export
export default base;
// EOF