/**
 * @module eidb/idbx/fts
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, opss.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// NOTE:
// OP HISTORY AND FTS RUN IN BACKGROUND, DON'T AWAIT,
// CALL `eidb.stay_idle` (or just `stay_idle`) TO DELAY FOR A WHILE 
// IF IN NEED OF OP HISTORY OR FTS RESULTS IMMEDIATELY.

// Modules
import utils from "../utils.js";
import idbx  from "../idbx.js";

/**
 * FTS manager class
 */
class fts {
    static enabled = false;

    /**
     * Enable FTS, should run after `.open_av`
     */ 
    static enable_fts(){
        fts.enabled = true;
    }

    /**
     * Disable FTS, note: FTS is disabled by default
     */ 
    static disable_fts(){
        fts.enabled = false;
    }

    /**
     * Object to unique words (all lowercase), find words in all strings in object
     */
    static obj_to_unique_words(Obj){
        var Str = utils.obj_to_valuestr(Obj).toLowerCase();

        // Allow only alphanumeric, -, _, spaces
        Str = Str.replace(/[^0-9A-Za-z_\-]/g, "\x20");

        // Turn space gaps into single spaces
        Str = Str.replace(/[\s]{2,}/g, "\x20").trim();

        // Keep unique words only
        var Words = Str.split("\x20");
        return Array.from(new Set(Words));
    }

    /**
     * Check if object exists using an index
     */ 
    static async obj_exists(Store,Index_Name,Value){
        var Index = Store.index(Index_Name);
        var Key   = await Index.get_key(value_is(Value));
        return Key!=null;
    }

    /**
     * Update FTS data, CRUD/C
     */ 
    static async update_fts_c(Store_Name, id, Obj){
        var Db = await idbx.reopen();
        var T  = Db.transaction(["fts_counts", "fts_sets", "fts_pairs"],RW);

        // To get first id set which has fewest ids, see idbx.add_more_indices
        var Scounts = T.object_store("fts_counts"); 
        // To get first id set quick at 1 op, see idbx.add_more_indices
        var Ssets   = T.object_store("fts_sets");   
        // To check if id is related to a word, see idbx.add_more_indices
        var Spairs  = T.object_store("fts_pairs");  

        // Get unique words from Obj
        var Words = fts.obj_to_unique_words(Obj);

        // Create FTS data for words not yet in db
        for (let Word of Words){
            if (await obj_exists(Scounts, "Word", Word)) continue;

            await Scounts.add({ Store:Store_Name, Word:Word, num_obj_ids:1 });
            await Ssets.  add({ Store:Store_Name, Word:Word, Obj_Ids:[id]  });
            await Spairs. add({ Store:Store_Name, Word:Word, obj_id:id     });
        }

        // Now all words are existing
        ???

        Db.close();
    }

    /**
     * Update FTS data, CRUD/R
     */ 
    static async update_fts_r(Store_Name, id, Obj){
        // NO POINTS TO UPDATE FTS ON READ, NOTHING CHANGES.
    }

    /**
     * Update FTS data, CRUD/U
     */ 
    static async update_fts_u(Store_Name, id, Obj){
    }

    /**
     * Update FTS data, CRUD/D
     */ 
    static async update_fts_d(Store_Name, id, Obj){
    }

    /**
     * Find objects by terms in a string
     */ 
    static async find_many_by_terms(Store_Name, Terms_Str){
        if (fts.enabled == false)
            logw("fts.find_many_by_terms: FTS is disabled, there might be results but no changes.");

        var Db = await eidb.reopen();
        var T  = Db.transaction(Store_Name,RO);
        var S  = T.store1();

        // Got store, next
        // ???

        Db.close();
    }
}

export default fts;
// EOF