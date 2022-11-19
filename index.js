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

    logw("Test db open"); // ---------------------------------------------------
    var Db = await eidb.open_av("my_db", _Test_Indices);
    log("Db:",Db);
    Db.close();

    logw("Test db reopen"); // -------------------------------------------------
    Db = await eidb.reopen();
    log("Reopened db:",Db);
    Db.close();

    logw("Test CREATE"); // ----------------------------------------------------
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Inserted id: ", await eidb.insert_one(S,{foo:"bar",bar:"foo",r:Math.random()}));
    log("Inserted ids:", await eidb.insert_many(S,[{foo:"bar"},{bar:"foo",a:"b"}]));
    Db.close();

    logw("Test READ"); // ------------------------------------------------------
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Exists:   ", await eidb.exists(S,{bar:"foo",foo:"bar"}));
    log("Count:    ", await eidb.count (S,{bar:"foo",foo:"bar"}));
    log("Find one: ", await eidb.find_one(S,{bar:"foo",foo:"bar"}));
    log("Find many:", await eidb.find_many(S,{bar:"foo",foo:"bar"}));
    log("Find all: ", (await eidb.find_all(S)).length, "items");
    log("Filter:   ", await eidb.filter(S,{foo:"bar",id:1}));
    Db.close();

    logw("Test UPDATE"); // ----------------------------------------------------
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Update one:  ", await eidb.update_one(S,{foo:"bar",bar:"foo"}, {foo3:"bar3"}));
    log("Update many: ", await eidb.update_many(S,{foo:"bar",bar:"foo"}, {foox:"barx"}));
    log("Upsert (one):", await eidb.upsert_one(S,{foo:"bar",bar:"foo"}, {fooxy:"barxy"}));
    Db.close();

    logw("Test DELETE"); // ----------------------------------------------------
    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    log("Count all:  ", await eidb.count_all(S));
    log("Remove one: ", await eidb.remove_one(S,{foo:"bar",bar:"foo"}));
    log("Count all:  ", await eidb.count_all(S));
    log("Remove many:", await eidb.remove_many(S,{foo:"bar",bar:"foo"}));
    log("Count:      ", await eidb.count_all(S));
    Db.close();

    logw("Test history/FTS"); // -----------------------------------------------
    log("Num connections:  ",eidb.num_db_cons())
    await eidb.enable_op_hist();
    log("Op-history status:",eidb.get_op_hist_status());
    // await eidb.clear_op_hist();

    Db = await eidb.reopen();
    var T = Db.transaction("my_store",RW);
    var S = T.store1();
    await eidb.insert_one(S,{foo:"bar"});

    await stay_idle(1000); // Op hist works in background, wait a second after insert
    var Hist = await eidb.get_op_hist("my_store",10); // Only 1, cleared above
    log("Op-history CRUD/C:", Hist.Recent_Creates);
    Db.close();

    logw("Test CRUD ops (secure)"); // -----------------------------------------    
    // ...

    logw("Test history/FTS (secure)"); // --------------------------------------    
    // ...
    return;

    logw("Test Web Crypto"); // ------------------------------------------------
    logw("Randomisation");
    log("Rand unsigned:",eidb.wcrypto.get_random_values_unsigned(16,10));
    log("Rand signed:  ",eidb.wcrypto.get_random_values_signed(16,10));
    log("Rand UUID:    ",eidb.wcrypto.random_uuid());
    log("Rand UUIDx:   ",eidb.wcrypto.random_uuidx());

    logw("AES encrypt/decrypt");
    var K        = await eidb.wcrypto.generate_key_aes();    
    var [Etd,Iv] = await eidb.wcrypto.encrypt_aes("foổbẫr",K);
    var Dtd      = await eidb.wcrypto.decrypt_aes(Etd,Iv,K);
    log("AES-GCM key:     ",K);
    log("Encrypted foổbẫr:",Etd);
    log("Decrypted:       ",Dtd);

    logw("AES derive key");
    var Pw   = "123456";
    var Hash = await eidb.wcrypto.digest_sha256(Pw);
    var K    = await eidb.wcrypto.import_key_aes_raw("abcdef"+Hash.substring(6)); // Any 32byte hex
    log("Pw:",Pw,"--> 1-iter key:  ",K);
    var Bk = await eidb.wcrypto.import_key_pb_raw(Pw);
    log("Pw:",Pw,"--> Pw-based key:",Bk);
    var Dk = await eidb.wcrypto.derive_key_pb2aes(Pw,"foobar",1000);
    log("1000-iter key:      ",Dk);
    log("1000-iter key (hex):",await eidb.wcrypto.export_key_hex(Dk));

    logw("RSA keys");
    log("RSA keys enc/dec:",await eidb.wcrypto.generate_keys_rsa_ed());
    log("RSA keys sig/ver:",await eidb.wcrypto.generate_keys_rsa_sv());

    logw("ECDSA derive keys");
    var Ek, Ak;
    log("Derived bits:",await eidb.wcrypto.derive_bits_pb(Pw,"foobar",1000));
    log("Pw to keys:  ",[Ek,Aks]=await eidb.wcrypto.password2keys(Pw,"foobar",1000));
    log("Enc key:     ",await eidb.wcrypto.export_key_hex(Ek));
    log("Auth Privkey:",await eidb.wcrypto.export_key_jwk(Aks.privateKey));
    log("Auth Pubkey: ",await eidb.wcrypto.export_key_jwk(Aks.publicKey));
    log("Static key:  ",await eidb.wcrypto.make_static_key("foobar",1000));
}

// Programme entry point
main();
})();
// EOF