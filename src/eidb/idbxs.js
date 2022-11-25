/**
 * @module eidb/idbxs
 */

// Modules
import base     from "./base.js";
import wcrypto  from "./wcrypto.js";
import cruds    from "./idbxs/cruds.js";
import op_hists from "./idbxs/op-hists.js";
import ftss     from "./idbxs/ftss.js";

// Shorthands
const log      = console.log;
const logw     = console.warn;
const loge     = console.error;
const new_lock = base.new_lock;

/**
 * Extended IndexedDB secure functionalities<br/>
 * NOTE: ACCESSIBLE THRU eidb.idbxs.* OR eidb.sec.*, 
 *       RECOMMENDED TO USE eidb.sec.*<br/>
 * ```
 * Variable prefixes:
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

    static cruds    = cruds;
    static op_hists = op_hists;
    static ftss     = ftss;

    /**
     * _________________________________________________________________________
     */
    CONSTANTS;

    static ITERATIONS = 100000;

    /**
     * _________________________________________________________________________
     */
    PROPERTIES;

    static Ekey     = null; // Encryption key
    static Akeypair = null; // Authentication key pair {privateKey:, publicKey:}
    static Skey     = null; // Static key (set once at db creation, or on total re-encryption)
    static Rkey     = null; // Recovery key (unused, use separate variable)

    /**
     * Set keys to be used by secure ops
     */ 
    static set_ea_keys(Ekey,Akeypair){
        idbxs.Ekey     = Ekey;
        idbxs.Akeypair = Akeypair;
    }

    /**
     * Set static key in db, only after setting static key, all other secure
     * ops with read or write can be performed.
     */ 
    static set_static_key(Skey){
        if (idbxs.Ekey==null || idbxs.Akeypair==null){
            loge("idbxs.set_static_key: Encryption key and auth key pair must exist first, call set_ea_keys");
            return;
        }

        // Generate static key
        ???

        // Encrypt static key
        // 

        // Save encrypted static key to db
        // 
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
        
        log(`Creating key chain, ${idbxs.ITERATIONS} iterations`);
        var start                  = performance.now();
        var Salt                   = await wcrypto.digest_sha256(Username);
        var [Enc_Key,Auth_Keypair] = await wcrypto.password2keys(Password,Salt,idbxs.ITERATIONS);
        var fin                    = performance.now();
        log(`Key chain made in ${(fin-start)/1000} seconds`);

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
     * - Etdr_Re_Iv<br/>
     * - Etdr_Re_Ciphertext
     * @return {Object} 3 items: Recovery key (AES-GCM), ciphertext of (Enc_Key,Auth_Keypair),
     *                  and IV (hex) used to create the ciphertext.
     */
    static async gen_recovery_info(Enc_Key,Auth_Keypair){
        var Token  = {Recovery_Key:null, Iv:null, Ciphertext:null};
        
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
        Iv = wcrypto.bytes_to_hex(Iv);

        return {Recovery_Key:Re_Key, Ciphertext:Ciphertext, Iv:Iv};
    }

    /**
     * Recover back Enc_Key, Auth_Keypair from recovery key, iv, and ciphertext
     */ 
    static async recover_key_chain(Ciphertext, Iv, Recovery_Key){ // Iv is in hex
        var Iv   = wcrypto.hex_to_bytes(Iv);
        var Text = await wcrypto.decrypt_aes(Ciphertext, Iv, Recovery_Key);

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
                loge("idbxs.text_to_key: Invalid word:",Word);
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
}

export default idbxs;
// EOF