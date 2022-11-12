// Shorthands
var log = console.log;

// ES6 modules are loaded asynchronously, wait.
(function wait4modules(){
if (eidb==null) { setTimeout(wait4modules,0); return; }    

// Test values
const _Test_Indices = {
    my_store: { 
        foo:1, bar:2, foobar:u1, barfoo:u2, "foo.bar":1, "bar.foo":2         
    }
};

// Main
function main(){
    log("Testing...");
    eidb.open_av("my_db");
}

// Programme entry point
main();
})();
// EOF