/**
 * @module eidb/wcrypto
 */ 

// Modules
import * as ecc from "./ecc.js";

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

// Constants
const BIT_LEN = 256;

/**
 * Crypto class<br/>
 * NOTE: Web Crypto always return ArrayBuffer but receive Uint8Array params.
 *       ALL ARE DEFAULTED TO 256-BIT IN THIS MODULE (EXCEPT RSA).
 */
class wcrypto {

    /**
     * _________________________________________________________________________
     */
    static EXTERNAL_LIBS(){}

    /**
     * Make ECDSA public key from private key
     * NOTE: THIS IS USING Elliptic LIB, NOT WEB CRYPTO.
     * @param  {String} Priv_Hex - Private key (number d) 
     * @return {Array}  Public key point (2 numbers x,y)
     */ 
    static get_pubkey_point(Priv_Hex){
        // Create curve
        var Curve = elliptic.ec("p256");
        // Get private key
        var Privkey = Curve.keyFromPrivate(Priv_Hex);
        // Get public key
        var Pubkey = Privkey.getPublic();

        // Return EC public key as 2 numbers
        // WARN: Not Pubkey.x, .y, they are different values compared to getX(), getY().
        // .toString(16) is built-in to get hex.
        var Xhex = Pubkey.getX().toString(16);
        var Yhex = Pubkey.getY().toString(16);
        while (Xhex.length<64) Xhex="0"+Xhex;
        while (Yhex.length<64) Yhex="0"+Yhex;

        return [Xhex, Yhex];
    }

    /**
     * _________________________________________________________________________
     */
    static BASE_FUNCS(){}

    /**
     * Random values (unsigned)
     */ 
    static get_random_values_unsigned(bits,count){ // 8, 16, 32, 64
        if (bits!=8 && bits!=16 && bits!=32 && bits!=64){
            loge("wcrypto.get_random_values_unsigned: Bits must be 8, 16, 32, or 64");
            return;
        }

        if (bits==8)  var Arr=new Uint8Array(count);
        if (bits==16) var Arr=new Uint16Array(count);
        if (bits==32) var Arr=new Uint32Array(count);
        if (bits==64) var Arr=new BigUint64Array(count);

        window.crypto.getRandomValues(Arr);
        return Arr;
    }

    /**
     * Random values (signed)
     */ 
    static get_random_values_signed(bits,count){ // 8, 16, 32, 64
        if (bits!=8 && bits!=16 && bits!=32 && bits!=64){
            loge("wcrypto.get_random_values_signed: Bits must be 8, 16, 32, or 64");
            return;
        }

        if (bits==8)  var Arr=new Int8Array(count);
        if (bits==16) var Arr=new Int16Array(count);
        if (bits==32) var Arr=new Int32Array(count);
        if (bits==64) var Arr=new BigInt64Array(count);

        window.crypto.getRandomValues(Arr);
        return Arr;
    }

    /**
     * Random 16-byte IV
     */ 
    static random_iv(){
        // 16 bytes
        return wcrypto.get_random_values_unsigned(8, 16);
    }

    /**
     * Random UUID
     */
    static random_uuid(){
        return window.crypto.randomUUID();
    }

    /**
     * Random UUID extended (256 bits, no dashes)
     */
    static random_uuidx(){
        var Left  = window.crypto.randomUUID();
        var Right = window.crypto.randomUUID();
        return (Left+Right).replaceAll("-","");
    }

    /**
     * _________________________________________________________________________
     */
    static UTILS(){}

    /**
     * Base64URL to Base64
     */
    static base64url_to_base64(Str){
        return Str.replaceAll("-","+").replaceAll("_","/");
    }

    /**
     * Base64 to Base64URL
     */
    static base64_to_base64url(Str){
        return Str.replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
    }

    /**
     * UTF8 to bytes (Uint8Array)
     */ 
    static utf8_to_bytes(Text){
        return new TextEncoder().encode(Text);
    }

    /**
     * Bytes (Uint8Array) to UTF8
     */ 
    static bytes_to_utf8(Bytes){
        return new TextDecoder("utf-8").decode(Bytes);
    }

    /**
     * ArrayBuffer to Uint8Array (bytes)
     */
    static buff_to_bytes(Buffer){
        return new Uint8Array(Buffer);
    }

    /**
     * Uint8Array (bytes) to ArrayBuffer<br/>
     * WARN: SOME SIZE PROBLEM ACCESSING .buffer 
     */ 
    static bytes_to_buff(Bytes){
        return Bytes.buffer;
    }

    /**
     * ArrayBuffer to hex, ref: https://stackoverflow.com/a/40031979/5581893
     */
    static buff_to_hex(Buffer) {
        return [...new Uint8Array(Buffer)].
            map(v => v.toString(16).padStart(2,"0")).
            join("");
    }

    /**
     * Hex to buff<br/>
     * WARN: SOME SIZE PROBLEM ACCESSING .buffer 
     */ 
    static hex_to_buff(Hex){
        return wcrypto.hex_to_bytes(Hex).buffer;
    }

    /**
     * Uint8Array to hex, ref: https://stackoverflow.com/a/40031979/5581893
     * Another option: https://stackoverflow.com/a/34356351/5581893
     */
    static bytes_to_hex(Bytes) {
        return [...Bytes].
            map(v => v.toString(16).padStart(2,"0")).
            join("");
    }

    /**
     * Hex to bytes
     */ 
    static hex_to_bytes(Hex){
        var Bytes = new Uint8Array(Hex.length/2);

        for (let i=0; i<Bytes.byteLength; i++)
            Bytes[i] = parseInt(Hex.substring(i*2, i*2+2), 16);

        return Bytes;
    }

    /**
     * ArrayBuffer to base64, ref: https://stackoverflow.com/a/9458996/5581893
     */
    static buff_to_base64(Buffer){        
        var Bytes     = new Uint8Array(Buffer);
        var len       = Bytes.byteLength;
        var Bytes_Str = ""; // Bytes in form of string

        for (var i=0; i<len; i++) 
            Bytes_Str += String.fromCharCode(Bytes[i]);

        return window.btoa(Bytes_Str); // Bytes string to ASCII base64
    }

    /**
     * Base64 to buffer<br/>
     * WARN: SOME SIZE PROBLEM ACCESSING .buffer 
     */
     static base64_to_buff(Base64){
        var Bytes_Str = window.atob(Base64); // ASCII base64 to bytes string
        var Bytes     = new Uint8Array(Bytes_Str.length);
        
        for (let i=0; i<Bytes.byteLength; i++)
            Bytes[i] = Bytes_Str.charCodeAt(i);

        return Bytes.buffer;
    }

    /**
     * Uint8Array to base64
     */
    static bytes_to_base64(Bytes){
        var len       = Bytes.byteLength;
        var Bytes_Str = ""; // Bytes in form of string

        for (let i=0; i<len; i++) 
            Bytes_Str += String.fromCharCode(Bytes[i]);

        return window.btoa(Bytes_Str); // Bytes string to ASCII base64
    }    

    /**
     * Base64 to bytes
     */
    static base64_to_bytes(Base64){
        var Bytes_Str = window.atob(Base64); // ASCII base64 to bytes string
        var Bytes     = new Uint8Array(Bytes_Str.length);
        
        for (let i=0; i<Bytes.byteLength; i++)
            Bytes[i] = Bytes_Str.charCodeAt(i);

        return Bytes;
    }

    /**
     * Base64 to hex
     */
    static base64_to_hex(Base64){
        return wcrypto.bytes_to_hex(wcrypto.base64_to_bytes(Base64));
    }

    /**
     * Hex to base64
     */ 
    static hex_to_base64(Hex){
        return wcrypto.bytes_to_base64(wcrypto.hex_to_bytes(Hex));
    }

    /**
     * Base64URL to hex
     */
    static base64url_to_hex(Base64){
        Base64 = wcrypto.base64url_to_base64(Base64);
        return wcrypto.bytes_to_hex(wcrypto.base64_to_bytes(Base64));
    }

    /**
     * Hex to base64URL
     */ 
    static hex_to_base64url(Hex){
        var Base64 = wcrypto.bytes_to_base64(wcrypto.hex_to_bytes(Hex));
        return wcrypto.base64_to_base64url(Base64);
    }

    /**
     * _________________________________________________________________________
     */
    static SUBTLE(){}

    /**
     * Digest to SHA1
     */
    static async digest_sha1(Text){
        var Bytes = wcrypto.utf8_to_bytes(Text);
        var Buff  = await window.crypto.subtle.digest("SHA-1",Bytes);
        return this.buff_to_hex(Buff);
    } 

    /**
     * Digest to SHA256
     */
    static async digest_sha256(Text){
        var Bytes = wcrypto.utf8_to_bytes(Text);
        var Buff  = await window.crypto.subtle.digest("SHA-256",Bytes);
        return this.buff_to_hex(Buff);
    }

    /**
     * Generate key<br/>
     * AES only, options are AES-CBC (block), AES-CTR (counter), AES-GCM (enhanced counter);
     * AES-GCM is better, used in TLS 1.2 https://stackoverflow.com/a/22958889/5581893
     */ 
    static async generate_key_aes(){
        var Aes_Gcm = {name:"AES-GCM", length:BIT_LEN};
        var Algorithm,extractable;
        var Usages = ["encrypt","decrypt"]; 
                      // "sign","verify","deriveBits","deriveKey","wrapKey","unwrapKey"

        return await window.crypto.subtle.generateKey(
            Algorithm   = Aes_Gcm,
            extractable = true,
            Usages
        );
    }

    /**
     * Generate key AES-KW (key wrapping)
     */ 
    static async generate_key_aes_kw(){
        var Aes_Gcm = {name:"AES-KW", length:BIT_LEN};
        var Algorithm,extractable;
        var Usages = ["wrapKey","unwrapKey"]; 
                      // "encrypt","decrypt","sign","verify","deriveBits","deriveKey"

        return await window.crypto.subtle.generateKey(
            Algorithm   = Aes_Gcm,
            extractable = true,
            Usages
        );
    }

    /**
     * Generate key RSA for encryption/decryption<br/>
     * RSA algos: RSASSA-PKCS1-v1_5 (first), RSA-OAEP, RSA-PSS (latest)
     * Ref: https://medium.com/asecuritysite-when-bob-met-alice/so-what-are-rsa-pcks-1-5-rsa-oaep-and-rsa-pss-and-why-is-it-important-to-pick-the-right-one-e639992fba09
     */ 
    static async generate_keys_rsa_ed(){ // ed: Encrypt/Decrypt
        // Modulus length: OpenSSL, GitHub, Mozilla: https://expeditedsecurity.com/blog/measuring-ssl-rsa-keys
        // Pub exponent: // https://developer.mozilla.org/en-US/docs/Web/API/RsaHashedKeyGenParams
        var Algo = {
            name:           "RSA-OAEP",
            modulusLength:  2048, 
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), 
            hash:           "SHA-256"
        };
        var extractable;
        /*
        Web Crypto API features availability:
        https://diafygi.github.io/webcrypto-examples/
        ===================================================================
                            Encrypt+Decrypt   Sign+Verify   Enc+Dec+Sig+Ver
        RSASSA-PKCS1-v1_5          -             Yes               -
        RSA-OAEP                  Yes             -                -
        RSA-PSS                    -             Yes               -
        ===================================================================
        */
        var Usages = ["encrypt","decrypt"];
                      // "sign","verify","deriveBits","deriveKey","wrapKey","unwrapKey"

        return await window.crypto.subtle.generateKey(
                     Algo, extractable=true, Usages);
    }

    /**
     * Generate key RSA for sign/verify<br/>
     * RSA algos: RSASSA-PKCS1-v1_5 (first), RSA-OAEP, RSA-PSS (latest)
     * Ref: https://medium.com/asecuritysite-when-bob-met-alice/so-what-are-rsa-pcks-1-5-rsa-oaep-and-rsa-pss-and-why-is-it-important-to-pick-the-right-one-e639992fba09
     */ 
    static async generate_keys_rsa_sv(){ // sv: Sign/Verify
        // Modulus length: OpenSSL, GitHub, Mozilla: https://expeditedsecurity.com/blog/measuring-ssl-rsa-keys
        // Pub exponent: // https://developer.mozilla.org/en-US/docs/Web/API/RsaHashedKeyGenParams
        var Algo = {
            name:           "RSA-PSS",
            modulusLength:  2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash:           "SHA-256"
        };
        var extractable;
        /*
        Web Crypto API features availability:
        https://diafygi.github.io/webcrypto-examples/
        ===================================================================
                            Encrypt+Decrypt   Sign+Verify   Enc+Dec+Sig+Ver
        RSASSA-PKCS1-v1_5          -             Yes               -
        RSA-OAEP                  Yes             -                -
        RSA-PSS                    -             Yes               -
        ===================================================================
        */
        var Usages = ["sign","verify"]; 
                      // "encrypt","decrypt","deriveBits","deriveKey","wrapKey","unwrapKey"

        return await window.crypto.subtle.generateKey(
                     Algo, extractable=true, Usages);
    }

    /**
     * Generate key EC (elliptic curve) for encryption/decryption<br/>
     * Web Crypto ECDSA can only sign, Web Crypto ECDH can't en/decrypt or sign/verify<br/>
     * A solution is at this reference:
     * https://jameshfisher.com/2017/11/03/web-cryptography-api-asymmetric-encryption-example/
     * NOTE: NOT IMPLEMENTED, SENDER MAY LEAK HIS/HER OWN PRIVATE KEY AND THE MESSAGE 
     *       IS NO LONGER ONLY-RECEIVER-CAN-READ.
     */ 
    static async generate_keys_ec_ed(){ // ed: Encryption/Decryption
        /*
        // 2 EC (ECDH) key pairs:
        const aliceKeyPair = await genKeyPair();
        const bobKeyPair   = await genKeyPair();
        // The same AES key:
        const aliceSecret  = await deriveKey(aliceKeyPair.privateKey, bobKeyPair.publicKey  );
        const bobSecret    = await deriveKey(  bobKeyPair.privateKey, aliceKeyPair.publicKey);
        // JSON web key:
        console.log((await exportKey(aliceSecret)).k === (await exportKey(bobSecret)).k);
        */
    }

    /**
     * Generate key EC (elliptic curve, ECDSA) for sign/verify
     */
    static async generate_keys_ec_sv(){ // sv: Sign/Verify
        var Algo = {
            name:       "ECDSA",
            namedCurve: "P-256" // 256 is common
        };
        var extractable;
        var Usages = ["sign","verify"]; 
                      // "encrypt","decrypt","deriveBits","deriveKey","wrapKey","unwrapKey"

        return await window.crypto.subtle.generateKey(
                     Algo, extractable=true, Usages);
    }

    /**
     * Import key from password for derivation
     */ 
    static async import_key_pb_raw(Password){
        var extractable;
        var Bytes  = wcrypto.utf8_to_bytes(Password);
        var Usages = ["deriveBits","deriveKey"];  
                      // "encrypt","decrypt","sign","verify","wrapKey","unwrapKey"

        // PBKDF2 keys must set extractable=false                      
        var Key = await window.crypto.subtle.
                  importKey("raw",Bytes,{name:"PBKDF2"},extractable=false,Usages);
        return Key;
    }

    /**
     * Import AES (GCM) key for en/decryption
     */ 
    static async import_key_aes_raw(Hex){
        if (Hex.length != BIT_LEN/8 * 2) { // AES 256-bit
            loge("wcrypto.import_key_raw: Hex of key must be of length 64 chars");
            return null;
        }

        var extractable;
        var Bytes  = wcrypto.hex_to_bytes(Hex);
        var Usages = ["encrypt","decrypt"]; 
                      // "sign","verify","deriveBits","deriveKey","wrapKey","unwrapKey"

        var Key = await window.crypto.subtle.
                  importKey("raw",Bytes,{name:"AES-GCM"},extractable=true,Usages);
        return Key;
    }

    /**
     * Import RSA key from JWK for sign/verify<br/>
     * Rsa_Algo: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
     */
    static async import_key_rsa_jwk(Jwk_Obj, Rsa_Algo="RSA-PSS"){ // Rsa_Algo: String        
        var Algo = {name:Rsa_Algo, hash:"SHA-256"};
        
        if (Rsa_Algo=="RSA-OAEP")
            var Usages = ["encrypt","decrypt"];
        else
            var Usages = ["sign","verify"];

        var extractable;
        return await window.crypto.subtle.importKey("jwk",Jwk_Obj,Algo,
                     extractable=true,Usages);
    }

    /**
     * Import EC key from JWK for sign/verify<br/>
     * Ec_Algo: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
     */ 
    static async import_key_ec_jwk(Jwk_Obj, Ec_Algo="ECDSA"){ // Ec_Algo: String
        var Algo = {name:Ec_Algo, namedCurve:"P-256"};

        if (Jwk_Obj.d != null)
            var Usages = ["sign"]; // Private key
        else
            var Usages = ["verify"]; // Public key

        var extractable;
        return await window.crypto.subtle.importKey("jwk",Jwk_Obj,Algo,
                     extractable=true,Usages);
    }

    /**
     * Export AES key to hex
     */
    static async export_key_hex(Key){
        return wcrypto.buff_to_hex(await window.crypto.subtle.exportKey("raw",Key));
    }

    /**
     * Export RSA|EC key to JWK
     */
    static async export_key_jwk(Key){
        var Obj = await window.crypto.subtle.exportKey("jwk",Key);
        return Obj;
    }

    /**
     * Derive bits from password
     */
    static async derive_bits_pb(Password,Salt,iterations, bit_count=BIT_LEN){
        var Base_Key = await wcrypto.import_key_pb_raw(Password);        

        // Create key from base key (which contains password)
        var Algo = {
            name:       "PBKDF2",  // Base key is
            hash:       "SHA-256", // Base key is
            salt:       wcrypto.utf8_to_bytes(Salt),
            iterations: iterations
        }; 

        var Bits = await window.crypto.subtle.deriveBits(Algo,Base_Key,bit_count);
        return wcrypto.buff_to_hex(Bits);
    }

    /**
     * Derive AES key from password (password-based) for en/decrypt<br/>
     * Ref: https://github.com/infotechinc/password-based-key-derivation-in-browser/blob/master/pbkdf2.js
     */
    static async derive_key_pb2aes(Password,Salt,iterations){
        var Base_Key = await wcrypto.import_key_pb_raw(Password);        

        // Create key from base key (which contains password)
        var Algo = {
            name:       "PBKDF2", // Password-based key derivation format 2 
            hash:       "SHA-256",
            salt:       wcrypto.utf8_to_bytes(Salt),
            iterations: iterations
        }; 
        var extractable;
        var Usages = ["encrypt","decrypt"]; 
                      // "sign","verify","deriveBits","deriveKey","wrapKey","unwrapKey"

        var Key = await window.crypto.subtle.deriveKey(Algo,Base_Key,
                      {name:"AES-GCM",length:BIT_LEN},extractable=true,Usages);
        return Key;
    }

    /**
     * Derive RSA key pair from password, for en/decrypt | sign/verify<br/>
     * OPTION:<br/>
     * - When Web Crypto support deriving to asymmetric keys, only symmetric now.
     * - Or when Web Crypto support custom randfunc for using when generating key
     * - Or use a reliable library to derive (RSA -> JWK -> alter (lib) -> import)
     */ 
    static async derive_keys_pb2rsa(Password,Salt,iterations){
        // TO-DO: NOT URGENT.
    }

    /**
     * Derive EC key pair from password, for sign/verify<br/>
     * WARN:<br/>
     * THIS IS A WORK-AROUND METHOD TO DERIVE EC KEYS FROM PASSWORD
     * COZ WEB CRYPTO API ONLY DERIVE TO HMAC OR AES. IT'S POSSIBLE TO PROVIDE
     * RANDFUNC TO RSA OR EC GENERATOR TO DERIVE BUT SUCH FEATURE ISN'T IN WEB CRYPTO YET.
     * 
     * Elliptic curve: y² = x³ + ax + b
     * Theory:         https://cryptobook.nakov.com/asymmetric-key-ciphers/elliptic-curve-cryptography-ecc
     * Maths:          https://en.wikipedia.org/wiki/Modular_arithmetic
     * P-256 curve:    https://neuromancer.sk/std/nist/P-256
     * 
     * Maths:
     * ```
     * y² = x³ + ax + b (mod p)  <=>  y² - (x³ + ax + b) = tp
     * ```
     * 
     * Procedure:<br/>
     * ECSA -> JWK -> alter -> import<br/>
     * Pubkey = Privkey * G, Note: This is Elliptic Curve scalar multiplication,
     * see: https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_multiplication
     * 
     * EC maths (secp256k1) in pure JavaScript:<br/>
     * https://paulmillr.com/posts/noble-secp256k1-fast-ecc/
     * 
     * Notation:<br/>
     * d:   Decryption key (private key)
     * x,y: Encryption key (public key)
     */
    static async derive_keys_pb2ec(Password,Salt,iterations){
        // Constants from the P-256 link in doc block above, key size: 256 bits
        var p =  BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"); // Prime
        var a =  BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"); // Param
        var b =  BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"); // Param
        var G = [BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"), // Base point
                 BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")];
        var n =  BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"); // Curve order (max d+1)
        var h =  BigInt("0x01"); // Cofactor        

        // Bitcoin curve (secp256k1, aka K256) not working with P-256,
        // keep the constants above to work with code in file ecc.js
        // after altering it to work with P-256. 2 code lines right below here
        // are commented out.
        /*
        ecc.set_curve(p,n,G[0],G[1]);
        var Pubkey = ecc.get_pubkey_point(G, d);  
        */

        // (1) Get random ECDSA keypair ==========
        // Generate EC key pair by Web Crypto to be compatible with Web Crypto 
        // for sign and verify only
        var Keypair = await wcrypto.generate_keys_ec_sv();

        // Convert to JWK to alter
        var Jwk_Priv = await wcrypto.export_key_jwk(Keypair.privateKey);
        var Jwk_Pub  = await wcrypto.export_key_jwk(Keypair.publicKey);

        // (2) Derive private & public key ==========
        // Hash to get EC private key d (decryption key)
        var d = Password+Salt;

        for (let i=0; i<iterations; i++)
            d = await wcrypto.digest_sha256(d);

        // Use lib to make public key, point(x,y)
        var [x,y] = wcrypto.get_pubkey_point(d);

        // (3) Put private & public key into JWKs ==========
        // Convert d, x, y to base64url format to put back to JWK object
        d = wcrypto.hex_to_base64url(d);
        x = wcrypto.hex_to_base64url(x);
        y = wcrypto.hex_to_base64url(y);

        Jwk_Priv.d = d; 
        Jwk_Priv.x = x;
        Jwk_Priv.y = y;
        Jwk_Pub. x = x;
        Jwk_Pub. y = y;

        // (4) Convert JWKs back to keys ==========
        var Privkey = await wcrypto.import_key_ec_jwk(Jwk_Priv,"ECDSA");
        var Pubkey  = await wcrypto.import_key_ec_jwk(Jwk_Pub, "ECDSA");

        // (5) Make derived ECDSA keypair ==========
        var Derived_Keypair = {privateKey:Privkey, publicKey:Pubkey};
        return Derived_Keypair;
    }

    /**
     * Encrypt with AES key (GCM) to base64
     */ 
    static async encrypt_aes(Text, Key){
        var Bytes      = wcrypto.utf8_to_bytes(Text); // Always UTF-8 to bytes
        var Iv         = wcrypto.random_iv();
        var Algo       = {name:"AES-GCM", iv:Iv};
        var Cipherbuff = await window.crypto.subtle.encrypt(Algo,Key,Bytes); // ArrayBuffer
        var Ciphertext = wcrypto.buff_to_base64(Cipherbuff);

        return [Ciphertext, Iv];
    }

    /**
     * Encrypt with RSA key to base64
     */ 
    static async encrypt_rsa(Text, Key){
        var Bytes      = wcrypto.utf8_to_bytes(Text); // Always UTF-8 to bytes
        var Algo       = {name:"RSA-OAEP"};
        var Cipherbuff = await window.crypto.subtle.encrypt(Algo,Key,Bytes); // ArrayBuffer
        var Ciphertext = wcrypto.buff_to_base64(Cipherbuff);

        return Ciphertext;
    }

    /**
     * Decrypt (AES) from base64
     */
    static async decrypt_aes(Ciphertext, Iv, Key){
        var Bytes = wcrypto.base64_to_bytes(Ciphertext);
        var Algo  = {name:"AES-GCM", iv:Iv};
        var Buff  = await window.crypto.subtle.decrypt(Algo,Key,Bytes);
        var Text  = wcrypto.bytes_to_utf8(new Uint8Array(Buff));

        return Text;
    }

    /**
     * Decrypt (RSA) from base64
     */
    static async decrypt_rsa(Ciphertext){
        var Bytes = wcrypto.base64_to_bytes(Ciphertext);
        var Algo  = {name:"RSA-OAEP"};
        var Buff  = await window.crypto.subtle.decrypt(Algo,Key,Bytes);
        var Text  = wcrypto.bytes_to_utf8(new Uint8Array(Buff));

        return Text;
    }

    /**
     * Sign and get a signature (a hash in hex) using RSA-PSS or ECDSA private key
     * @param  {String} Text    - UTF8 text
     * @param  {Object} Privkey - A private key
     * @return {String} Hash string
     */ 
    static async sign(Text, Privkey){
        if (Privkey.algorithm.name=="RSA-PSS")
            var Algo = {name:"RSA-PSS", saltLength:BIT_LEN}; // RSA defaulted to SHA-256 in this module.
        else
            var Algo = {name:"ECDSA", hash:"SHA-256"};
            
        var Bytes = wcrypto.utf8_to_bytes(Text);
        var Buff  = await window.crypto.subtle.sign(Algo,Privkey,Bytes);
        return wcrypto.buff_to_hex(Buff);
    }

    /**
     * Verify cipher text (base64) using RSA-PSS or ECDSA public key
     * @param  {String}  Text      - Any text
     * @param  {String}  Signature - The signature hash obtained after signing in hex string
     * @param  {Object}  Pubkey    - A public key matching the priv key used when sign
     * @return {Boolean} true if the signature is ok, false otherwise
     */ 
    static async verify(Text, Signature, Pubkey){
        if (Pubkey.algorithm.name=="RSA-PSS")
            var Algo = {name:"RSA-PSS", saltLength:BIT_LEN}; // RSA defaulted to SHA-256 in this module.
        else
            var Algo = {name:"ECDSA", hash:"SHA-256"};

        var Text_Bytes = wcrypto.utf8_to_bytes(Text);
        var Sig_Bytes  = wcrypto.hex_to_bytes(Signature);
        return await window.crypto.subtle.verify(Algo,Pubkey,Sig_Bytes,Text_Bytes);
    }

    /**
     * Wrap key
     */
    static async wrap_key(){
        // TO-DO
    }

    /**
     * Unwrap key
     */ 
    static async unwrap_key(){
        // TO-DO
    }

    /**
     * _________________________________________________________________________
     */
    static EXTENDED(){} 

    /**
     * Split string into 2
     */
    static split_into_2(Str){
        var mid    = Math.floor(Str.length / 2);
        var Trunk1 = Str.substring(0,mid);
        var Trunk2 = Str.substring(mid);
        return [Trunk1,Trunk2];
    }

    /**
     * Get encryption key and auth key from password<br/>
     * Encryption first, first bit trunk is more important as it's also the 
     * derived bits with half number of bits, and users encrypt data on 
     * client side first before registration with server.
     * 
     * HMAC isn't secure enough as there's an agreed secret and may leak from server side:<br/>
     * https://stackoverflow.com/a/18693622/5581893
     * 
     * Options for E2EE keys: AES+RSApair, AES+ECpair<br/>
     * However, Web Crypto doesn't provide derivation method to RSA or EC;
     * quite time taking to create RSA pair with pure JS especially the modules and primes;
     * EC pair will be created instead since any interger below EC:n can be key.
     * 
     * This method creates AES key + EC keys, instead of AES key + HMAC key.
     * User keeps priv key, send pub key to server for registration.<br/>
     * Ref: https://stackoverflow.com/a/20484325/5581893
     * @return {Array} 1 AES-GCM 256-bit key for encryption key, 1 EC 256-bit key pair 
     *                 for authentication (upon handshake server should send some text 
     *                 for client to sign).
     */
    static async password2keys(Password,Salt,iterations){
        var Bits_Str        = await wcrypto.derive_bits_pb(Password,Salt,iterations,2*BIT_LEN);
        var [Trunk1,Trunk2] = wcrypto.split_into_2(Bits_Str); // 2 x 256 bits
        var Enc_Key         = await wcrypto.derive_key_pb2aes(Trunk1,Salt,iterations); // AES 256-bit key
        var Auth_Keys       = await wcrypto.derive_keys_pb2ec(Trunk2,Salt,iterations); // EC 256-bit keypair
        return [Enc_Key,Auth_Keys];
    }

    /**
     * Get static key (for data encryption to avoid decrypt+re-encryption when 
     * password changes); static key is encrypted by enc key by password2keys.
     * Static key should be saved encrypted in `metadata` object store.
     * @return {Object} AES-GCM 256-bit key
     */
    static async make_static_key(Salt,iterations){
        var Rand = wcrypto.random_uuidx(); // 256 bits
        return await wcrypto.derive_key_pb2aes(Rand,Salt,iterations); // AES 256-bit
    }
}

export default wcrypto;
// EOF