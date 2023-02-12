/**
 * @module eidb/idbxs
 */

// Modules
import base     from "./base.js";
import utils    from "./utils.js";
import wcrypto  from "./wcrypto.js";
import idb      from "./idb.js";
import idbx     from "./idbx.js";
import cruds    from "./idbxs/cruds.js";
import op_hists from "./idbxs/op-hists.js";
import ftss     from "./idbxs/ftss.js";

// Shorthands
const log      = console.log;
const logw     = console.warn;
const loge     = console.error;
const new_lock = base.new_lock;

// Constants
var GLOBAL_DEFAULT_META = {
    Store:            "_global", // Always _global
    Etde_Skey:        null,      // Set by app
    Etde_Skey_Iv:     null,      // Set by app
    Etdr_Recovery:    null,      // Ciphertext of Enckey & Authkeypair
    Etdr_Recovery_Iv: null       // Iv of recovery ciphertext
};

/**
 * Extended IndexedDB secure functionalities<br/>
 * NOTE: ACCESSIBLE THRU eidb.idbxs.* OR eidb.sec.*, 
 *       RECOMMENDED TO USE eidb.sec.*<br/>
 * 
 * KEY USAGE NOTE:
 * ```
 * E2EE with asymmetric keys:
 *   - Encryption: Public key,   Decryption: Private key
 *   - Sign:       Private key,  Verify:     Public key
 *   - Options:    RSA (Web Crypto: Can't derive from password without Web Crypto support or randfunc)
 *                 EC  (Web Crypto: Derivable from password, but can't encrypt)
 *                 See: https://diafygi.github.io/webcrypto-examples
 * Solution:
 *   - Encryption: Symmetric key,  Decryption: Symmetric key  (AES-GCM 256)
 *   - Sign:       Private key,    Verify:     Public key     (EC P-256)
 * ```
 * 
 * Variable prefixes:
 * ```
 * - Etde_: Encrypted by encryption key
 * - Etda_: Encrypted by authentication private key
 * - Etds_: Encrypted by static key
 * - Etdr_: Encrypted by recovery key
 * ``` 
 */ 
class idbxs { // Aka sec         

    /**
     * _________________________________________________________________________
     */
    SUB_NAMESPACES;

    static cruds;
    static op_hists;
    static ftss;

    /**
     * _________________________________________________________________________
     */
    CONSTANTS;

    static ITERATIONS = 100000; // For key derivatiion

    /**
     * _________________________________________________________________________
     */
    PROPERTIES;

    static Ekey     = null; // Encryption key
    static Akeypair = null; // Authentication key pair {privateKey:, publicKey:}
    static Skey     = null; // Static key (save once at db creation, or on total re-encryption)
    static Rkey     = null; // Recovery key (UNUSED, use separate variable)

    /*
     * _________________________________________________________________________
     */
    METHODS;

    /**
     * Open db with version set automatically (av, ie. auto-versioning)
     * @param  {String} Db_Name - Database name
     * @param  {Object} Indices - Index schema of database
     * @return {Array}  Error or null, and database object
     */
    static async open_av(Db_Name,Indices){
        // Check _secure marking in every store
        var Store_Names = Object.keys(Indices);

        for (let Store_Name of Store_Names){
            if (Indices[Store_Name]._secure == null) continue;

            // Remove marking 
            delete Indices[Store_Name]._secure;

            // Prefix store name with #
            Indices["#"+Store_Name] = {...Indices[Store_Name]};
            delete Indices[Store_Name];
        }

        // Open db
        return await idbx.open_av(Db_Name,Indices);        
    }

    /**
     * Turn value into secure value (encrypted by static key)
     * @param  {String|Number} Value - A value
     * @return {String}        Base64 ciphertext
     */ 
    static async value_to_svalue(Value){
        var Text;

        if ((Value instanceof Object) && !(Value instanceof Date))
            Text = utils.obj_to_json(Value);
        else{
            if (Value instanceof Date)
                Text = Value.toISOString();
            else
                Text = Value.toString();
        }

        var Ct_Iv = await wcrypto.encrypt_aes_fiv(Text, idbxs.Skey);
        return Ct_Iv[0];
    }

    /**
     * Turn values into secure values (encrypted by static key)
     * @param  {Array} Values - Multiple values
     * @return {Array}          Base64 ciphertexts
     */ 
    static async array_to_sarray(Values){
        var Results = [];

        for (let Value of Values)
            Results.push(await thisclass.value_to_svalue(Value));

        return Results;
    }

    /**
     * WARN: THIS IS FULL OBJECT TO SAVE
     * Turn regular object into secure object to save encrypted<br/>
     * NOTICE: THE OUTPUT SECURE OBJECT CONTAINS ONLY ENCRYPTED PROPERTIES
     *         THOSE ARE INDEXED, THE REST OF PROPERTIES ARE IN .Etds_Obj
     */ 
    static async obj_to_sobj(Store_Name,Obj){
        if (idbxs.Skey==null) {
            loge("[EI] idbxs.obj_to_sobj: Static key not set");
            return;
        }

        // Get index name list
        var Idx_Names = Object.keys(idbx.Indices[Store_Name]);
            Idx_Names = Idx_Names.filter(X => X!="id");

        // Create encrypted values
        let Props = []; 

        if (Obj.id != null)
            var Sobj = {id: Obj.id};
        else
            var Sobj = {};

        for (let Idx_Name of Idx_Names){
            let is_compound = Idx_Name.indexOf(",")>=0;

            // Compound index
            if (is_compound){
                let Paths = Idx_Name.split(",");

                for (let Path of Paths) 
                    Props.push({
                        Path:  Path,
                        Value: utils.prop_get(Obj,Path)
                    });
            }
            else{ // Regular index
                Props.push({
                    Path:  Idx_Name,
                    Value: utils.prop_get(Obj,Idx_Name)
                });
            }

            // Encrypt
            for (let i=0; i<Props.length; i++){
                let Text;

                if ((Props[i].Value instanceof Object) && !(Props[i].Value instanceof Date))
                    Text = utils.obj_to_json(Props[i].Value);
                else{
                    if (Props[i].Value instanceof Date)
                        Text = Props[i].Value.toISOString();
                    else
                        Text = Props[i].Value.toString();
                }

                let Ct_Iv       = await wcrypto.encrypt_aes_fiv(Text, idbxs.Skey);
                Props[i].Svalue = Ct_Iv[0]; // Ignore fixed IV value
            }
        }

        // Put encrypted properties to secure obj
        for (let Prop of Props){
            let Path   = Prop.Path;
            let Svalue = Prop.Svalue;
            Sobj       = utils.prop_set(Sobj,Path,Svalue);
        }

        // Add Etds_Obj (object encrypted by static key)        
        var Str       = utils.obj_to_json(Obj);
        var Ct_Iv     = await wcrypto.encrypt_aes_fiv(Str, idbxs.Skey);
        Sobj.Etds_Obj = Ct_Iv[0]; // Ignore fixed IV value

        return Sobj;
    }

    // Shallow arbitrary obj to secure object
    static async obj_to_sobj_arb(Obj){
        var Sobj = {};

        for (let Field in Obj){
            let Text;

            if ((Obj[Field] instanceof Object) && !(Obj[Field] instanceof Date))
                Text = utils.obj_to_json(Obj[Field]);
            else{    
                if (Obj[Field] instanceof Date)
                    Text = Obj[Field].toISOString();
                else                
                    Text = Obj[Field].toString();
            }

            Sobj[Field] = (await wcrypto.encrypt_aes_fiv(Text, idbxs.Skey))[0];
        }

        return Sobj;
    }

    /**
     * UNUSED!
     * WARN: THIS IS ARBITRARY OBJECT, EG. CHANGES
     * Object to secure object, all depths<br/>
     * Can't utilise JSON.parse object travel, its reviver is synchronous
     * while encryption is async. Doing recursion.
     */
    static async #obj_to_sobj_arb_rec(Obj){
        if (Obj==null) return null;

        // Leaf values
        if (!(Obj instanceof Object))
            return (await wcrypto.encrypt_aes_fiv(Obj, idbxs.Skey))[0];

        // Date object
        if (Obj instanceof Date)
            return (await wcrypto.encrypt_aes_fiv(Obj.toISOString(), idbxs.Skey))[0];

        // Regular object
        for (let Key in Obj) // 'for in' gives Key for both Object & Array
            Obj[Key] = await idbxs.#obj_to_sobj_arb_rec(Obj[Key]);

        return Obj;
    }

    /**
     * UNUSED!
     * Object to secure object, all depths<br/>
     * Can't utilise JSON.parse object travel, its reviver is synchronous
     * while encryption is async. Doing recursion.
     */
    static async obj_to_sobj_arb_rec(Obj){
        var Clone = JSON.parse(JSON.stringify(Obj)); // Avoid changing Obj itself
        return await idbxs.#obj_to_sobj_arb_rec(Clone);
    }

    /**
     * Set enc/dec keys to be used by secure ops
     */ 
    static set_ea_keys(Ekey,Akeypair){
        idbxs.Ekey     = Ekey;
        idbxs.Akeypair = Akeypair;
    }

    /**
     * Set static key
     */
    static set_static_key(Skey){
        idbxs.Skey = Skey;
    }

    /**
     * Ensure global metadata (ensure, and change no whole saving)
     */ 
    static async ensure_global_meta(Metastore){
        var Meta = await idbxs.load_global_meta(Metastore);

        if (Meta==null)
            await Metastore.add(GLOBAL_DEFAULT_META);
    }

    /**
     * Load global metadata (no whole saving of global meta)
     */ 
    static async load_global_meta(Metastore){
        var Orig_Param = Metastore;

        if (Metastore==null){
            // Open db
            var Db    = await eidb.reopen();
            var T     = Db.transaction("_meta",RO);
            var S     = T.store1();
            Metastore = S;
        }

        // Load and return
        var Res = await Metastore.index("Store").get(value_is("_global"));
        if (Orig_Param==null) Db.close();
        return Res;
    }

    /**
     * Update global meta
     */ 
    static async update_global_meta(Metastore, Changes){
        var Orig_Param = Metastore;

        if (Metastore==null){
            // Open db
            var Db    = await eidb.reopen();
            var T     = Db.transaction("_meta",RW);
            var S     = T.store1();
            Metastore = S;
        }

        // Load
        var Meta = await idbxs.load_global_meta(Metastore);

        // Update
        Meta = {...Meta, ...Changes};
        await Metastore.put(Meta);

        // Close db if opened
        if (Orig_Param==null) Db.close();
    }

    /**
     * Set static key in db metadata, only after setting static key, all other secure
     * ops with read or write can be performed.<br/>
     * WARN: CALL ONLY ONCE AFTER DB CREATION OR AFTER RE-ENCRYPTING ALL DATA
     *       WITH NEW STATIC KEY.
     * @param {Object}  Skey    - Static key to save to db
     * @param {Boolean} enforce - Indicates whether to force setting a static key which
     *                            may FATALLY result in failure of decryption 
     *                            of all data. Defaulted to false.
     */ 
    static async save_static_key(Skey, enforce=false){
        if (idbxs.Ekey==null || idbxs.Akeypair==null){
            loge("[EI] idbxs.set_static_key: Encryption key and auth key pair must exist first, call set_ea_keys");
            return;
        }

        // Encrypt static key
        var Skey_Hex = await wcrypto.export_key_hex(Skey);
        var Temp     = await wcrypto.encrypt_aes(Skey_Hex, idbxs.Ekey);
        var [Etde_Skey,Etde_Skey_Iv] = Temp;        

        // Load metadata
        var Db   = await eidb.reopen();
        var T    = Db.transaction("_meta",RW);
        var S    = T.store1();
        var Meta = await S.index("Store").get(value_is("_global")); // Store null is global meta

        if (Meta == null){ // No global metadata, create
            idbxs.ensure_global_meta(S);
            Meta = await S.index("Store").get(value_is("_global")); // Load
        }

        // Static key exists and no enfore, return
        if (Meta.Etde_Skey!=null && enforce==false){
            logw("[EI] idbxs.set_static_key: Static key exists, no enforcing");
            Db.close();
            return;
        }

        // Static key exists or no, but enforcing, just overwrite
        // Save encrypted static key to db
        Meta.Etde_Skey    = Etde_Skey;
        Meta.Etde_Skey_Iv = Etde_Skey_Iv;
        S.put(Meta);
        Db.close();
    }

    /**
     * Get static key from db metadata
     */ 
    static async load_static_key(){
        if (idbxs.Ekey==null || idbxs.Akeypair==null){
            loge("[EI] idbxs.get_static_key: Encryption key and auth key pair must exist first, call set_ea_keys");
            return;
        }

        // Get metadata
        var Db   = await eidb.reopen();
        var T    = Db.transaction("_meta",RW);
        var S    = T.store1();
        var Meta = await S.index("Store").get(value_is("_global"));

        // Get encrypted static key
        if (Meta == null){
            logw("[EI] idbxs.get_static_key: Global metadata not set");
            await idbxs.ensure_global_meta(S);
            Db.close();
            return;
        }
        if (Meta.Etde_Skey == null){
            logw("[EI] idbxs.get_static_key: No static key in global metadata");
            Db.close();
            return;
        }
        var Etde_Skey    = Meta.Etde_Skey;
        var Etde_Skey_Iv = Meta.Etde_Skey_Iv;

        // Decrypt to get static key
        var Skey_Hex = await wcrypto.decrypt_aes(Etde_Skey, Etde_Skey_Iv, idbxs.Ekey);
        var Skey     = await wcrypto.import_key_aes_raw(Skey_Hex);

        Db.close();
        return Skey;
    }

    /**
     * ACCESS START, USE THIS:
     * Prepare keys for secure ops<br/>
     * App dev: Use try/catch to check if Username and Password are okay, 
     *          use loop to enter again and again if necessary.
     */ 
    static async prepare_keys(Username,Password){
        // Try keys in slocal
        var Ekey_Hex     = slocal.get("Ekey_Hex");
        var Akeypriv_Jwk = slocal.get("Akeypriv_Jwk");
        var Akeypub_Jwk  = slocal.get("Akeypub_Jwk");
        var keys_ok      = false;

        if (Ekey_Hex!=null && Akeypriv_Jwk!=null && Akeypub_Jwk!=null){
            var Ekey     = await wcrypto.import_key_aes_raw(Ekey_Hex);
            var Akeypriv = await wcrypto.import_key_ec_jwk(Akeypriv_Jwk);
            var Akeypub  = await wcrypto.import_key_ec_jwk(Akeypub_Jwk);
            var Akeypair = {privateKey:Akeypriv, publicKey:Akeypub};
            idbxs.set_ea_keys(Ekey,Akeypair);

            try {
                // Static key
                log("[EI] Trying stored keys...");
                var Skey = await idbxs.load_static_key();
                if (Skey==null) keys_ok=false;
                else            keys_ok=true;
            }
            catch(Err){/*false*/}
        }

        // Try Username and Password
        if (!keys_ok){
            // Enc/dec keys
            var [Ekey,Akeypair] = await idbxs.get_key_chain(Username,Password);
            idbxs.set_ea_keys(Ekey,Akeypair);
            var Akeypriv = Akeypair.privateKey;
            var Akeypub  = Akeypair.publicKey;

            // Static key
            // Bad Username&Password will fail here
            log("[EI] Trying keys from username and password...");
            var Skey = await idbxs.load_static_key();
        }

        // First ever call goes here
        if (Skey==null){
            logw("[EI] idbxs.prepare_keys: No static key, creating one...");
            Skey = await idbxs.get_new_static_key(Username);
            let enforce;
            await idbxs.save_static_key(Skey, enforce=true);
        }
        idbxs.set_static_key(Skey);

        // All okay, save keys to slocal
        slocal.set("Ekey_Hex",     await wcrypto.export_key_hex(Ekey));
        slocal.set("Akeypriv_Jwk", await wcrypto.export_key_jwk(Akeypriv));
        slocal.set("Akeypub_Jwk",  await wcrypto.export_key_jwk(Akeypub));
    }

    /**
     * ACCESS LOCK, USE THIS:
     * Lock out access by clearing keys from slocal
     */ 
    static clear_keys(){
        slocal.clear("Ekey_Hex");
        slocal.clear("Akeypriv_Jwk");
        slocal.clear("Akeypub_Jwk");
    }

    /**
     * Set username and password (user for chaning username or password, or both at once)
     */ 
    static async set_user_and_pw(Username,Password){
        // Get current static key
        var Skey = await idbxs.load_static_key();
        if (Skey==null) return new Error("failed-to-load-static-key");
        idbxs.set_static_key(Skey);

        // NEW Enc/dec keys
        var [Ekey,Akeypair] = await idbxs.get_key_chain(Username,Password);
        idbxs.set_ea_keys(Ekey,Akeypair);

        // Save back static key encrypted with new Ekey
        let enforce;
        await idbxs.save_static_key(Skey, enforce=true);
    }

    /**
     * Get key chain from password<br/>
     * Use Enc_Key for encryption/decryption, send Auth_Keypair.publicKey to 
     * server for registration, use Auth_Keypair.privateKey to sign authentication
     * message from server and let server verify.
     * @param  {String} Username - Used to make salt
     * @param  {String} Password - Used to derive keys with salt, left and right spaces will be trimmed.
     * @return {Object} {Enc_Key,Auth_Keypair} Enc_Key is AES key, Auth_Keypair
     *                  is EC key pair.
     */ 
    static async get_key_chain(Username,Password){
        Username = Username.trim();
        Password = Password.trim();
        
        log(`[EI] Creating key chain, ${idbxs.ITERATIONS} iterations`);
        var start                  = performance.now();
        var Salt                   = await wcrypto.digest_sha256(Username);
        var [Enc_Key,Auth_Keypair] = await wcrypto.password2keys(Password,Salt,idbxs.ITERATIONS);
        var fin                    = performance.now();
        log(`[EI] Key chain made in ${(fin-start)/1000} seconds`);

        return [Enc_Key,Auth_Keypair];
    }

    /**
     * Get new random static key (AES-GCM 256)<br/>
     * Static key concept: Use static key to encrypt data, use Enc_Key to 
     * encrypt static key; Enc_Key is changed when password is changed, but
     * static key stays the same to avoid decrypt/re-encrypt all data.
     * Static key can be changed to, but only in really necessary cases.
     */ 
    static async get_new_static_key(Username){
        Username = Username.trim();
        var Salt = await wcrypto.digest_sha256(Username);
        var Key  = await wcrypto.make_static_key(Salt,1000);     
        return Key;
    }

    /**
     * Get recovery info for key chain (3 keys); call this method to get new
     * recovery info when user has the old recovery key leaked.
     * Use recovery key to get back Enc_Key, Auth_Keypair, to set new 
     * password but it's not designed to get back the forgotten password.
     * Give user the Recovery Key (256bits), store (Iv,Ciphertext) in db:<br/>
     * - Etdr_Recovery<br/>
     * - Etdr_Recovery_Iv
     * @return {Object} 3 items: Recovery key (AES-GCM), ciphertext of (Enc_Key,Auth_Keypair),
     *                  and IV (hex) used to create the ciphertext.
     */
    static async gen_recovery_info(Enc_Key,Auth_Keypair){        
        // Make recovery key
        var Re_Key = await wcrypto.generate_key_aes();

        // Text to contain Enc_Key, Auth_Keypair with random IV to make ciphertext
        var Hex  = await wcrypto.export_key_hex(Enc_Key);
        var Jwk  = await wcrypto.export_key_jwk(Auth_Keypair.privateKey);
        var Dhex = wcrypto.base64url_to_hex(Jwk.d);
        var Xhex = wcrypto.base64url_to_hex(Jwk.x);
        var Yhex = wcrypto.base64url_to_hex(Jwk.y);
        var Text = `${Hex}::${Dhex}::${Xhex}::${Yhex}`;
        
        // Make ciphertext
        var [Ciphertext,Iv] = await wcrypto.encrypt_aes(Text, Re_Key);

        return {Ciphertext:Ciphertext, Iv:Iv, Recovery_Key:Re_Key};
    }

    /**
     * Save recovery info
     */ 
    static async save_recovery_info(Ciphertext, Iv){
        var Db   = await eidb.reopen();
        var T    = Db.transaction("_meta",RW);
        var S    = T.store1();

        // Update meta
        var Changes = { Etdr_Recovery:Ciphertext, Etdr_Recovery_Iv:Iv };
        await idbxs.update_global_meta(S, Changes);

        Db.close();
    }

    /**
     * Recover back Enc_Key, Auth_Keypair from recovery key, iv, and ciphertext
     */ 
    static async recover_key_chain(Ciphertext, Iv, Recovery_Key){ // Iv is in hex
        var Text = await wcrypto.decrypt_aes(Ciphertext, Iv, Recovery_Key);
        if (Text==null) return null;

        // Enc_Key, and dxy of auth keys
        var [Ekeyhex,Dhex,Xhex,Yhex] = Text.split("::");
        var Ekey = await wcrypto.import_key_aes_raw(Ekeyhex);

        // Auth keys
        var Keypair  = await wcrypto.generate_keys_ec_sv();
        var Jwk_Priv = await wcrypto.export_key_jwk(Keypair.privateKey);
        var Jwk_Pub  = await wcrypto.export_key_jwk(Keypair.publicKey);

        // Replace dxy in auth keys
        Jwk_Priv.d = wcrypto.hex_to_base64url(Dhex);
        Jwk_Priv.x = wcrypto.hex_to_base64url(Xhex);
        Jwk_Priv.y = wcrypto.hex_to_base64url(Yhex);
        Jwk_Pub. x = wcrypto.hex_to_base64url(Xhex);
        Jwk_Pub. y = wcrypto.hex_to_base64url(Yhex);

        // Turn JWKs back to keys
        var Akeypair = {};
        Akeypair.privateKey = await wcrypto.import_key_ec_jwk(Jwk_Priv);
        Akeypair.publicKey  = await wcrypto.import_key_ec_jwk(Jwk_Pub);

        return [Ekey,Akeypair];
    }

    /**
     * Recover enc/auth keys and set keys to use
     */ 
    static async recover_and_set_keys(Recovery_Key){
        if (!(Recovery_Key instanceof CryptoKey)){
            loge("[EI] idbxs.recover_and_set_keys: First param is not CryptoKey");
            return;
        }

        // Open db
        var Db = await eidb.reopen();
        var T  = Db.transaction("_meta",RO);
        var S  = T.store1();

        // Load recovery ciphertext and iv
        var Meta = await idbxs.load_global_meta(S);

        if (Meta==null){
            loge("[EI] idbxs.recover_and_set_keys: Bad global metadata:",Meta);
            Db.close();
            return;
        }

        var Etdr_Recovery    = Meta.Etdr_Recovery;
        var Etdr_Recovery_Iv = Meta.Etdr_Recovery_Iv;

        if (Etdr_Recovery==null || Etdr_Recovery_Iv==null){
            loge("[EI] idbxs.recovery_and_set_keys: No or bad recovery data in global metadata");
            Db.close();
            return;
        }
        
        // Try to use recovery key to decrypt metadata to get enc/auth keys
        // pass recover_key_chain means the recovery key matches recovery cipher text
        // and IV in metadata.
        var [Ek,Aks] = await idbxs.recover_key_chain(Etdr_Recovery, Etdr_Recovery_Iv, Recovery_Key);
        
        if (Ek==null || Aks==null || (!(Ek instanceof CryptoKey)) || 
                (!(Aks.privateKey instanceof CryptoKey)) || (!(Aks.publicKey instanceof CryptoKey))){
            loge("[EI] idbxs.recovery_and_set_keys: Failed to recover keys, found:",Ek,Aks);
            Db.close();
            return;
        }

        // Decrypt metadata to get static key
        var Etde_Skey    = Meta.Etde_Skey;
        var Etde_Skey_Iv = Meta.Etde_Skey_Iv;
        var Sk_Hex       = await wcrypto.decrypt_aes(Etde_Skey, Etde_Skey_Iv, Ek);

        if (Sk_Hex==null){
            loge("[EI] idbxs.recovery_and_set_keys: Failed to decrypt for static key");
            Db.close();
            return;
        }
        var Sk = await wcrypto.import_key_aes_raw(Sk_Hex);

        // Set keys to use
        idbxs.set_ea_keys(Ek,Aks);
        idbxs.set_static_key(Sk);
        Db.close();
        return [Ek,Aks];
    }

    /**
     * A micro dictionary of 256 words<br/>
     * WARN: THIS DICT ALGO SHOULD STAY UNCHANGED, NAMED EnIndex Micro Dictionary.
     */ 
    static get_micro_dict(){
        var Vowels     = ["a","e","i","o","u","y"]; // 6
        var Consonants = ["b","c","d","f","g","h","j","k","l","m","n","p","q","r","s","t","v","w","x","z"]; // 20
        var Sylls1     = []; // Syllable with consonant first
        var Sylls2     = []; // Syllable with vowel first

        // Just a strategy for making words
        for (let c of Consonants)
            for (let v of Vowels)
                Sylls1.push(c+v); // 120 items

        for (let v of Vowels)
            for (let c of Consonants)            
                Sylls2.push(v+c); // 120 items

        // Get some unique words
        var Dict = [];
        var max  = Sylls1.length-1; // =Sylls2.length-1, to avoid index out of bound

        for (let i=0; i<120; i++){ // 120 unique words
            if (i%8 == 0) Dict.push(Sylls1[i]);
            else          
            if (i%8 == 1) Dict.push(Sylls2[i]);
            else
            if (i%8 == 2) Dict.push(Sylls1[i]+Sylls1[max-i]);
            else
            if (i%8 == 3) Dict.push(Sylls1[i]+Sylls2[i]);
            else
            if (i%8 == 4) Dict.push(Sylls2[i]+Sylls1[i]);
            else
            if (i%8 == 5) Dict.push(Sylls2[i]+Sylls2[max-i]);
            else
            if (i%8 == 6) Dict.push(Sylls1[i]+Sylls2[i]+Sylls2[max-i]);
            else
            if (i%8 == 7) Dict.push(Sylls2[i]+Sylls1[i]+Sylls1[max-i]);
        }
        Dict = Array.from(new Set(Dict)).sort();

        // Reverse to get more words, 120 -> (not 240) 234; 22 words more
        var Dict2 = [];

        for (let Word of Dict){
            Dict2.push(Word);
            Dict2.push(Word.split("").reverse().join(""));
        }
        Dict2 = Array.from(new Set(Dict2)).sort();

        // Add 22 more words (long)
        var Dict3 = [...Dict2];
        var more  = 256 - Dict2.length; // == 22

        for (let i=0; i<more; i++){
            let j = Math.floor(Dict2.length/more * i);
            Dict3.push(Dict2[j]+Dict2[j+1]);
        }
        Dict3 = Array.from(new Set(Dict3)).sort();

        return Dict3;
    }

    /**
     * Add random dots to string
     */ 
    static #add_random_dots(Str,num){
        for (let i=0; i<num; i++){
            let Matches = [...Str.matchAll(/[\s]+/g)].map(X=>X.index);
            let j       = Math.floor(Math.random() * Matches.length);
            let k       = Matches[j];
            
            // Replace a space as dot
            let Chars = Str.split("");
            Chars[k]  = ".";
            Str       = Chars.join("");
        }

        return Str;
    }

    /**
     * Add random commas
     */ 
    static #add_random_commas(Str,num){
        for (let i=0; i<num; i++){
            let Matches = [...Str.matchAll(/[\s]+/g)].map(X=>X.index);
            let j       = Math.floor(Math.random() * Matches.length);
            let k       = Matches[j];
            
            // Replace a space as dot
            let Chars = Str.split("");
            Chars[k]  = ",";
            Str       = Chars.join("");
        }

        return Str;
    }

    /**
     * Format sentence, letter casing, spaces
     */ 
    static #format_sentences(Str){
        Str = Str.replaceAll(",", ",\x20");

        // First letters of sentences
        var Sens = Str.split(".");

        for (let i=0; i<Sens.length; i++)
            Sens[i] = Sens[i].charAt(0).toUpperCase() + Sens[i].substring(1);

        Str = Sens.join(".\x20");

        // Tail dot
        Str += ".";
        return Str;
    }

    /**
     * Convert an AES 256 key to recovery text with strange words
     */ 
    static async key_to_text(Aes_Key){
        var Hex   = await wcrypto.export_key_hex(Aes_Key);
        var Dict  = idbxs.get_micro_dict();
        var Bytes = wcrypto.hex_to_bytes(Hex);
        var Words = [];
        
        for (let i=0; i<Bytes.byteLength; i++)
            Words.push(Dict[Bytes[i]]);

        var Text = Words.join("\x20");
            Text = idbxs.#add_random_dots(Text,4);
            Text = idbxs.#add_random_commas(Text,8);
            Text = idbxs.#format_sentences(Text);
        return Text;
    }

    /**
     * Recovery text to key (AES-GCM 256)
     */ 
    static async text_to_key(Text){        
        // Tidy up text
        Text = Text.toLowerCase().replaceAll(/[^a-z]+/g,"\x20");
        Text = Text.trim();
        Text = Text.replaceAll(/[\s]{2,}/g, "\x20");
        
        // Check word validity
        var Words = Text.split("\x20");
        var Dict  = idbxs.get_micro_dict();
        var Bytes = new Uint8Array(32);

        for (let Word of Words)
            if (Dict.indexOf(Word) == -1){
                loge("[EI] idbxs.text_to_key: Invalid word:",Word);
                return;
            }

        // Turn words into bytes
        for (let i=0; i<Words.length; i++){
            let Word = Words[i];
            let j    = Dict.indexOf(Word);
            Bytes[i] = j;
        }

        // Turn bytes into hex and get key
        var Hex = wcrypto.bytes_to_hex(Bytes);
        return await wcrypto.import_key_aes_raw(Hex);
    }

    /**
     * Init
     */ 
    static init(){
        idbxs.cruds    = cruds;
        idbxs.op_hists = op_hists;
        idbxs.ftss     = ftss;

        idbxs.cruds    .init();
        idbxs.op_hists .init();
        idbxs.ftss     .init();
    }
}

const thisclass = idbxs;
export default thisclass;
// EOF