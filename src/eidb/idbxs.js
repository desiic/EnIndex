/**
 * @module eidb/idbxs
 */

/**
 * Extended IndexedDB secure functionalities<br/>
 * NOTE: ACCESSIBLE THRU eidb.idbxs.* OR eidb.sec.*
 */ 
class idbxs {

    /**
     * Get new static key (AES-GCM 256)<br/>
     * Static key concept: Use static key to encrypt data, use Enc_Key to 
     * encrypt static key; Enc_Key is changed when password is changed, but
     * static key stays the same to avoid decrypt/re-encrypt all data.
     * Static key can be changed to, but only in really necessary cases.
     */ 
    static async get_new_static_key(){
    }

    /**
     * Get key chain from password<br/>
     * Use Enc_Key for encryption/decryption, send Auth_Keypair.publicKey to 
     * server for registration, use Auth_Keypair.privateKey to sign authentication
     * message from server and let server verify.
     * @return {Object} {Enc_Key,Auth_Keypair} Enc_Key is AES key, Auth_Keypair
     *                  is EC key pair.
     */ 
    static async get_key_chain(Password){
    }
}

export default idbxs;
// EOF