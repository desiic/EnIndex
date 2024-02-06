// Shorthands
var log  = console.log;
var logw = console.warn;

function $_____UTILS_____(){}

// ES6 modules are loaded asynchronously, wait.
(function wait4modules(){
if (window.eidb==null) { setTimeout(wait4modules,0); return; }    

// Test values
var _Test_Indices = {
    my_store: { 
        foo:1, bar:2, foobar:u1, barfoo:u2, "foo.bar":1, "bar.foo":2,
        "foo,bar":1 // Compound index, remember compound indices can't be 2, or u2
    },
    my_secure_store: {
        _secure, foo:1, "bar.blah":1
    }
};

function $_____ALL_TESTS_____(){}

// Main
async function main(){
    eidb.init();
    log("Testing...");
    log("Recommended to reopen db again and again for operations to avoid upgrade being blocked.");

    logw("Test db open"); // ---------------------------------------------------
    // var Db = await eidb.open_av("my_db", _Test_Indices); // Regular open
    var Db = await eidb.s_open_av("my_db", _Test_Indices);  // Secure open (facilitates encryption)
    log("Db:",Db);
    Db.close();

    logw("Test db reopen"); // -------------------------------------------------
    Db = await eidb.reopen();
    log("Reopened db:",Db);
    Db.close();

    logw("Test CRUD ops"); // --------------------------------------------------
    logw("Test CREATE");
    var Sname = "my_store";
    log("Inserted id: ", await eidb.insert_one(Sname,{foo:"bar",bar:"foo",r:Math.random()}));
    log("Inserted ids:", await eidb.insert_many(Sname,[{foo:"bar"},{bar:"foo",a:"b"}]));

    logw("Test READ");
    var Sname = "my_store";
    log("Exists:   ", await eidb.exists(Sname,{bar:"foo",foo:"bar"}));
    log("Count:    ", await eidb.count (Sname,{bar:"foo",foo:"bar"}));
    log("Find one: ", await eidb.find_one(Sname,{bar:"foo",foo:"bar"}));
    log("Find many:", await eidb.find_many(Sname,{bar:"foo",foo:"bar"}));
    log("Find all: ", (await eidb.find_all(Sname)).length, "items");
    log("Filter:   ", await eidb.filter(Sname,{foo:"bar",id:1}));

    logw("Test UPDATE");
    var Sname = "my_store";
    log("Update one:  ", await eidb.update_one(Sname,{foo:"bar",bar:"foo"}, {foo3:"bar3"}));
    log("Update many: ", await eidb.update_many(Sname,{foo:"bar",bar:"foo"}, {foox:"barx"}));
    log("Upsert (one):", await eidb.upsert_one(Sname,{foo:"bar",bar:"foo"}, {fooxy:"barxy"}));

    logw("Test DELETE");
    var Sname = "my_store";
    log("Count all:  ", await eidb.count_all(Sname));
    log("Remove one: ", await eidb.remove_one(Sname,{foo:"bar",bar:"foo"}));
    log("Count all:  ", await eidb.count_all(Sname));
    log("Remove many:", await eidb.remove_many(Sname,{foo:"bar",bar:"foo"}));
    log("Count:      ", await eidb.count_all(Sname));

    logw("Test op history"); // ------------------------------------------------
    log("Num connections:  ",eidb.num_db_cons())
    await eidb.enable_op_hist();
    log("Op-history status:",eidb.get_op_hist_status());
    // await eidb.clear_op_hist();
    
    var Sname = "my_store";
    await eidb.insert_one(Sname,{foo:"foo bar foobar barfoo"});

    await stay_idle(1000); // Op hist works in background, wait a second after insert
    var Hist = await eidb.get_op_hist("my_store",10); // Only 1, cleared above
    log("Op-history CRUD/C:", Hist.Recent_Creates);

    logw("Test full-text search"); // ------------------------------------------
    var Db = await eidb.reopen(); // Clear fts_words, fts_ids stores first to test
    var T  = Db.transaction(["my_store","fts_words","fts_ids",
                             "#my_secure_store","#fts_words","#fts_ids"],RW);
    await T.object_store("my_store").clear();
    await T.object_store("fts_words").clear();
    await T.object_store("fts_ids").clear();
    await T.object_store("#my_secure_store").clear();
    await T.object_store("#fts_words").clear();
    await T.object_store("#fts_ids").clear();
    Db.close();

    eidb.enable_fts(); // Should be right after open_av in production
    // eidb.s_enable_fts(); // The same
    await eidb.insert_one(Sname,{foo:"foo bar foobar barfoox"});
    await eidb.insert_one(Sname,{foo:"foo foobar"});
    await eidb.update_one(Sname,{foo:"foo foobar"}, {foo:"foo abcxyz"});
    await eidb.remove_one(Sname,{foo:"foo abcxyz"});
    await eidb.insert_one(Sname,{foo:"foo foo foo foo abcxyz"});
    
    await stay_idle(1000); // FTS works in background, wait a second after insert
    var Sname  = "my_store";
    var Result = await eidb.find_many_by_terms(Sname,"xxx fff");
    log("FTS result:",Result);
    var Result = await eidb.find_many_by_terms(Sname,"foo fff");
    log("FTS result:",Result);
    var Result = await eidb.find_many_by_terms(Sname,"foo foobar fff");
    log("FTS result:",Result);    

    logw("Test sec module"); //-------------------------------------------------
    eidb.sec.ITERATIONS = 1000; // Default: 100,000; here using smaller value for fast testing
    var Ek,Aks,Sk;
    log("Key chain:     ",[Ek,Aks]=await eidb.sec.get_key_chain("foobar","foobarspassword"));
    log("Static key:    ",Sk=await eidb.sec.get_new_static_key("foobar"));
    log("Recovery info: ",{Ciphertext,Iv,Recovery_Key}=await eidb.sec.gen_recovery_info(Ek,Aks));
    var Rtext,Rkey;
    log("Recovery text: ",Rtext=await eidb.sec.key_to_text(Recovery_Key));
    log("Back to key:   ",Rkey=await eidb.sec.text_to_key(Rtext));
    log("Recovered keys:",await eidb.sec.recover_key_chain(Ciphertext,Iv,Rkey));

    logw("Test CRUD ops (secure)"); // -----------------------------------------    
    var Username = "user";
    var Pw       = "123456";
    [Ek,Aks] = await eidb.sec.get_key_chain(Username, Pw);    
    eidb.sec.set_ea_keys(Ek,Aks);

    var Sk = await eidb.sec.get_new_static_key(Username); // Only once on db creation
    await eidb.sec.save_static_key(Sk);                   // Only once on db creation
    Sk = await eidb.sec.load_static_key();
    await eidb.do_op("_meta", _clear); // Clear to test with any username/pw below
                                       // otherwise static key isn't decryptable.

    await eidb.sec.prepare_keys(Username,Pw); // Put in eidb.sec to use
    log("Ekey:     ", eidb.sec.Ekey);
    log("Akeypair: ", eidb.sec.Akeypair);
    log("Skey:     ", eidb.sec.Skey);
    var Ek  = eidb.sec.Ekey; 
    var Aks = eidb.sec.Akeypair;
    var {Ciphertext,Iv,Recovery_Key}=await eidb.sec.gen_recovery_info(Ek,Aks)
    var Text;
    log("Recovery: ", Text=await eidb.sec.key_to_text(Recovery_Key)); // Give to user
    await eidb.sec.save_recovery_info(Ciphertext,Iv);    
    var Rk = await eidb.sec.text_to_key(Text);
    log("Reco-load:", await eidb.sec.recover_and_set_keys(Rk));

    logw("Test CREATE (secure)");
    var id = await eidb.s_insert_one("my_secure_store",{foo:999, bar:{ blah:999 }});
    log("Inserted id: ",id);
    var Ids = await eidb.s_insert_many("my_secure_store",[{foo:"bar"},{bar:"foo"}]);
    log("Inserted ids:",Ids);

    logw("Test READ (secure)");
    log("Exists:   ",await eidb.s_exists("my_secure_store", {foo:"bar"}));
    log("Count:    ",await eidb.s_count("my_secure_store", {foo:999}));
    log("Count all:",await eidb.s_count_all("my_secure_store"));
    log("Find one: ",await eidb.s_find_one("my_secure_store", {foo:999}));
    log("Find many:",await eidb.s_find_many("my_secure_store", {foo:999}));
    log("Find all: ",await eidb.s_find_all("my_secure_store"));
    log("Filter:   ",await eidb.s_filter("my_secure_store", {foo:999}));

    logw("Test UPDATE (secure)");
    await eidb.s_update_one("my_secure_store", {foo:999}, {foo:111,bar:{blah:new Date()}});
    log("Update one:  ",await eidb.s_find_one("my_secure_store", {foo:111}));
    await eidb.s_update_many("my_secure_store", {foo:111}, {foo:999,bar:{blah:new Date()}});
    log("Update many: ",await eidb.s_find_many("my_secure_store", {foo:999}));
    await eidb.s_upsert_one("my_secure_store", {foo:999}, {foo:111,bar:{blah:new Date()}});
    log("Upsert one:  ",await eidb.s_find_one("my_secure_store", {foo:111}));

    logw("Test DELETE (secure)");
    await eidb.s_remove_one("my_secure_store", {foo:111});
    log("Remove one:  ",await eidb.s_find_one("my_secure_store", {foo:111}));
    await eidb.s_remove_many("my_secure_store", {foo:"barx"});    
    log("Remove many: ",await eidb.s_find_many("my_secure_store", {foo:"bar"}));    

    logw("Test op history (secure)"); // ---------------------------------------
    log("The same as regular op_hist");

    logw("Test full-text search (secure)"); // ---------------------------------
    await eidb.s_insert_one("my_secure_store",{foo:"bar"});
    log("Num words:",await eidb.s_count_all("fts_words"));
    log("FTS find: ",await eidb.s_find_many_by_terms("my_secure_store","bar blahblah"));

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