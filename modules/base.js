// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

// async/await 
function new_lock(){
    var Unlock, Lock=new Promise((Res,Rej)=>{ Unlock=Res; });
    return [Lock,Unlock];
}
// EOF