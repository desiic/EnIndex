// Shorthands
var log  = console.log;
var logw = console.warn;

// ES6 modules are loaded asynchronously, wait.
(function wait4modules(){
if (window.eidb==null) { setTimeout(wait4modules,0); return; }    

// Test values
var _Test_Indices = {
    my_store: { 
        foo:1, bar:2, foobar:u1, barfoo:u2, "foo.bar":1, "bar.foo":2         
    }
};

// Main
async function main(){
    log("Testing...");
    log("Recommended to reopen db again and again for operations to avoid upgrade being blocked.");

    logw("Test db open");
    var Db = await eidb.open_av("my_db", _Test_Indices);
    log("Db:",Db);
    Db.close();

    logw("Test db reopen");
    Db = await eidb.reopen();
    log("Reopened db:",Db);
    Db.close();

    logw("Test get objs");
    Db = await eidb.reopen();
    var T = Db.transaction("my_store");
    var S = T.store1();
    log("Objects:",await S.get_all());
    Db.close();
}

// Programme entry point
main();
})();
// EOF