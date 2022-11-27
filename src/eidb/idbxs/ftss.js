/**
 * @module eidb/idbxs/ftss
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, idbxs.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// NOTE:
// OP HISTORY AND FTS RUN IN BACKGROUND, DON'T AWAIT,
// CALL `eidb.stay_idle` (or just `stay_idle`) TO DELAY FOR A WHILE 
// IF IN NEED OF OP HISTORY OR FTS RESULTS IMMEDIATELY.

// Modules
import fts     from "../idbx/fts.js";
import idbxs   from "../idbxs.js";
import wcrypto from "../wcrypto.js";
import utils   from "../utils.js";

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

/**
 * FTS secure
 */
class ftss {
    // COMMENTED OUT, THESE PROPS ARE IN REGULAR fts CLASS
    // static enabled    = false;
    // static score_rate = 2; // Mostly user won't enter search terms of 32+ words,
    //                        // score is capped by 2^32 in #score_objs method.
    /*
    FTS scoring example:
    Search terms (smaller sets first):  foo  bar  foobar  barfoo
    Score base from 1 with score_rate:  8    4    2       1
    These score values are multiplied by occurences coz the more occurences of
    important terms the better.
    */

    /**
     * Enable FTS, should run after `.s_open_av`
     */ 
    static enable_fts(){
        fts.enable_fts();
    }

    /**
     * Disable FTS, note: FTS is disabled by default
     */ 
    static disable_fts(){
        fts.disable_fts();
    }

    /**
     * String to unique words (all lowercase)
     */
    static str_to_unique_words(Str){
        // Unused
    }

    /**
     * Object to unique words (all lowercase), find words in all strings in object
     */
    static obj_to_unique_words(Obj){
        // Unused
    }

    /**
     * Check if object exists using an index, any store
     */ 
    static async obj_exists(Store,Index_Name,Value){
        // Unused
    }

    /**
     * Increase number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async increase_num_objs(Swords, Store_Name, Word){
        // Unused
    }

    /**
     * Decrease number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async decrease_num_objs(Swords, Store_Name, Word){
        // Unused
    }

    /**
     * Update FTS
     */ 
    static async update_fts(Op, Store_Name, id, Obj){
        // Unused
    }

    /**
     * Update FTS data, CRUD/C
     */ 
    static update_fts_c(Store_Name, id, Obj){
        fts.update_fts_c(Store_Name, id, Obj, _secure);
    }

    /**
     * Update FTS data, CRUD/R
     */ 
    static update_fts_r(Store_Name, id, Obj){
        // NO POINTS TO UPDATE FTS ON READ, NOTHING CHANGES.
    }

    /**
     * Update FTS data, CRUD/U
     */ 
    static update_fts_u(Store_Name, id, Obj){
        fts.update_fts_u(Store_Name, id, Obj, _secure);
    }

    /**
     * Update FTS data, CRUD/D
     */ 
    static update_fts_d(Store_Name, id, Obj){
        fts.update_fts_d(Store_Name, id, Obj, _secure);
    }

    /**
     * All objects containing a term
     */
    static async #term_to_objs(Sids, Store,Term, limit){
        // Unused
    }

    /**
     * Give objects scores
     */ 
    static #score_objs(Objs,Terms){
        // Unused
    }

    /**
     * Find objects by terms in a string
     * @return {Object} List of objects found, list of search terms, 
     *                  and list of excluded terms (terms not in FTS data)
     */ 
    static async find_many_by_terms(Store_Name, Terms_Str, limit=1000){
        if (idbxs.Skey==null) {
            loge("ftss.find_many_by_terms: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;

        // Find
        var Sres = await fts.find_many_by_terms(Store_Name, Terms_Str, limit, _secure);

        // Decrypt
        for (let i=0; i<Sres.Items.length; i++){
            let Sobj = Sres.Items[i].Object;
            let Json = await wcrypto.decrypt_aes_fiv(Sobj.Etds_Obj, idbxs.Skey);
            let Obj  = utils.json_to_obj_bd(Json);
            Obj.id   = Sobj.id;
            Sres.Items[i] = Obj;
        }

        for (let i=0; i<Sres.Search_Terms.length; i++)
            Sres.Search_Terms[i] = await wcrypto.decrypt_aes_fiv(Sres.Search_Terms[i], idbxs.Skey);
        for (let i=0; i<Sres.Excluded_Terms.length; i++)
            Sres.Excluded_Terms[i] = await wcrypto.decrypt_aes_fiv(Sres.Excluded_Terms[i], idbxs.Skey);    

        var Res = Sres; // Decrypted
        return Res;
    }

    /**
     * Init static stuff
     */ 
    static init(){
    }
}

export default ftss;
// EOF