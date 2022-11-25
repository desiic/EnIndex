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

/**
 * FTS secure
 */
class ftss {
    static enabled    = false;
    static score_rate = 2; // Mostly user won't enter search terms of 32+ words,
                           // score is capped by 2^32 in #score_objs method.
    /*
    FTS scoring example:
    Search terms (smaller sets first):  foo  bar  foobar  barfoo
    Score base from 1 with score_rate:  8    4    2       1
    These score values are multiplied by occurences coz the more occurences of
    important terms the better.
    */

    /**
     * Enable FTS, should run after `.open_av`
     */ 
    static enable_fts(){
    }

    /**
     * Disable FTS, note: FTS is disabled by default
     */ 
    static disable_fts(){
    }

    /**
     * String to unique words (all lowercase)
     */
    static str_to_unique_words(Str){
    }

    /**
     * Object to unique words (all lowercase), find words in all strings in object
     */
    static obj_to_unique_words(Obj){
    }

    /**
     * Check if object exists using an index, any store
     */ 
    static async obj_exists(Store,Index_Name,Value){
    }

    /**
     * Increase number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async increase_num_objs(Swords, Store_Name, Word){
    }

    /**
     * Decrease number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async decrease_num_objs(Swords, Store_Name, Word){
    }

    /**
     * Update FTS
     */ 
    static async update_fts(Op, Store_Name, id, Obj){
    }

    /**
     * Update FTS data, CRUD/C
     */ 
    static update_fts_c(Store_Name, id, Obj){
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
    }

    /**
     * Update FTS data, CRUD/D
     */ 
    static update_fts_d(Store_Name, id, Obj){
    }

    /**
     * All objects containing a term
     */
    static async #term_to_objs(Sids, Store,Term, limit){
    }

    /**
     * Give objects scores
     */ 
    static #score_objs(Objs,Terms){
    }

    /**
     * Find objects by terms in a string
     * @return {Object} List of objects found, list of search terms, 
     *                  and list of excluded terms (terms not in FTS data)
     */ 
    static async find_many_by_terms(Store_Name, Terms_Str, limit=1000){
    }
}

export default ftss;
// EOF