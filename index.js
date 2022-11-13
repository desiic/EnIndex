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

    logw("Test CREATE");
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Id:",await eidb.insert_one(S,{foo:"bar",bar:"foo",r:Math.random()}));
    log("Ids:",await eidb.insert_many(S,[{foo:"bar"},{bar:"foo",a:"b"}]));
    Db.close();

    logw("Test READ");
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Exists:",await eidb.exists(S,{bar:"foo",foo:"bar"}));
    log("Count:", await eidb.count (S,{bar:"foo",foo:"bar"}));
    log("Find1:", await eidb.find_one(S,{bar:"foo",foo:"bar"}));
    log("Find+:", await eidb.find_many(S,{bar:"foo",foo:"bar"}));
    log("Find*:", (await eidb.find_all(S)).length );
    log("Filter:",await eidb.filter(S,{foo:"bar",id:1}));
    Db.close();

    logw("Test UPDATE");
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Up1:", await eidb.update_one(S,{foo:"bar",bar:"foo"}, {foo3:"bar3"}));
    log("Up+:", await eidb.update_many(S,{foo:"bar",bar:"foo"}, {foox:"barx"}));
    log("Ups:", await eidb.upsert_one(S,{foo:"bar",bar:"foo"}, {fooxy:"barxy"}));
    Db.close();

    logw("Test DELETE");
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Count:", await eidb.count_all(S));
    log("Del1:", await eidb.remove_one(S,{foo:"bar",bar:"foo"}));
    log("Count:", await eidb.count_all(S));
    log("Del+:", await eidb.remove_many(S,{foo:"bar",bar:"foo"}));
    log("Count:", await eidb.count_all(S));
    Db.close();

    logw("Test Web Crypto");
    log("Rand unsigned:",eidb.wcrypto.get_random_values_unsigned(16,10));
    log("Rand signed:",eidb.wcrypto.get_random_values_signed(16,10));
    log("Rand UUID:",eidb.wcrypto.random_uuid());
    var K  = await eidb.wcrypto.generate_key_aes();    
    var [Etd,Iv] = await eidb.wcrypto.encrypt_aes("foổbẫr",K);
    var Dtd = await eidb.wcrypto.decrypt_aes(Etd,Iv,K);
    log("AES GCM key:",K);
    log("Encrypted foổbẫr:",Etd);
    log("Decrypted:",Dtd);
    var Pw = "123456";
    var Hash = await eidb.wcrypto.digest_sha256(Pw);
    var K = await eidb.wcrypto.import_key_raw(Hash);
    log("Pw:",Pw,"-- Key:",K);
}

// Programme entry point
main();
})();
// EOF