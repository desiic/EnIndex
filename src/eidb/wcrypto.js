/**
 * @module eidb/wcrypto
 */ 

// Shorthands
var log  = console.log;
var logw = console.warn;
var loge = console.error;

/**
 * Crypto class
 */
class wcrypto {

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
     * _________________________________________________________________________
     */
    static UTILS(){}

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
     * ArrayBuffer to hex, ref: https://stackoverflow.com/a/40031979/5581893
     */
    static buff_to_hex(Buffer) {
        return [...new Uint8Array(Buffer)].
            map(v => v.toString(16).padStart(2,"0")).
            join("");
    }

    /**
     * Hex to buff
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
     * Base64 to buffer
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
     * _________________________________________________________________________
     */
    static SUBTLE(){}

    /**
     * Decrypt AES
     */
    static async decrypt_aes(Ciphertext, Iv, Key){
        var Bytes = wcrypto.base64_to_bytes(Ciphertext);
        var Algo  = {name:"AES-GCM", iv:Iv};
        var Buff  = await window.crypto.subtle.decrypt(Algo,Key,Bytes);
        var Text  = wcrypto.bytes_to_utf8(new Uint8Array(Buff));

        return Text;
    }

    /**
     * Decrypt RSA
     */
    static decrypt_rsa(){
    }

    /**
     * Derive bits
     */
    static derive_bits(){
    }

    /**
     * Derive key from password (password-based)
     */
    static async derive_key_pb(){
        var Algo = {name:"PBKDF2", hash:"SHA-256"}; // Password-based key derivation format 2
        //TO-DO 
    }

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
     * Encrypt with AES key (GCM)
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
     * Encrypt with RSA key
     */ 
    static async encrypt_rsa(){
    }

    /**
     * Export key
     */
    static export_key(){
    }

    /**
     * Generate key<br/>
     * AES only, options are AES-CBC (block), AES-CTR (counter), AES-GCM (enhanced counter);
     * AES-GCM is better, used in TLS 1.2 https://stackoverflow.com/a/22958889/5581893
     */ 
    static async generate_key_aes(){
        var Aes_Gcm = {name:"AES-GCM", length:256};
        var Algorithm,extractable;
        var Usages = ["encrypt","decrypt"]; // ,"sign","verify","deriveKey",
                      // "deriveBits","wrapKey","unwrapKey"];

        return await window.crypto.subtle.generateKey(
            Algorithm   = Aes_Gcm,
            extractable = true,
            Usages
        );
    }

    /**
     * Generate key AES-KW (key wrapping)
     */ 
    static generate_key_aes_kw(){
    }

    /**
     * Generate key RSA
     */ 
    static generate_keys_rsa(){
    }

    /**
     * Import key
     */ 
    static async import_key_raw(Hex){
        if (Hex.length != 64) { // AES 256-bit
            loge("wcrypto.import_key_raw: Hex of key must be of length 64 chars");
            return null;
        }

        var extractable;
        var Bytes = wcrypto.hex_to_bytes(Hex);
        var Key   = await window.crypto.subtle.importKey(
                        "raw",Bytes,{name:"AES-GCM"},extractable=true,
                        ["encrypt","decrypt"]);
        return Key;
    }

    /**
     * Sign
     */ 
    static sign(){
    }

    /**
     * Unwrap key
     */ 
    static unwrap_key(){
    }

    /**
     * Verify
     */ 
    static verify(){
    }

    /**
     * Wrap key
     */
    static wrap_key(){
    }

    /**
     * _________________________________________________________________________
     */
    static EXTENDED(){} 
}

export default wcrypto;
// EOF