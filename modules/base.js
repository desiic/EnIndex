// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

// Base functionality class
class base{
    
    // Create async/await lock
    static new_lock(){
        var Unlock, Lock=new Promise((Res,Rej)=>{ Unlock=Res; });
        return [Lock,Unlock];
    }
}

// Module export
export default base;
// EOF