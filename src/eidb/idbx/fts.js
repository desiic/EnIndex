/**
 * @module eidb/idbx/fts
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
import eidb    from "../../eidb.js";
import idbx    from "../idbx.js";
import idbxs   from "../idbxs.js";
import wcrypto from "../wcrypto.js";
import utils   from "../utils.js";

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

function $_____CLASS_____(){}

/**
 * FTS manager class
 */
class fts {
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

    #_____SETTINGS_____(){}

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

    #_____UTILS_____(){}

    /**
     * String to unique words (all lowercase)
     */
    static str_to_unique_words(Str){
        var Str = Str.toLowerCase();

        // Allow only alphanumeric, -, _, spaces
        Str = Str.replace(/[^0-9A-Za-z_\-]/g, "\x20");

        // Turn space gaps into single spaces
        Str = Str.replace(/[\s]{2,}/g, "\x20").trim();

        // Keep unique words only
        var Words = Str.split("\x20");
        return Array.from(new Set(Words));
    }

    /**
     * Object to unique words (all lowercase), find words in all strings in object
     */
    static obj_to_unique_words(Obj){
        var Str = utils.obj_to_valuestr(Obj)
        return fts.str_to_unique_words(Str);
    }

    /**
     * Check if object exists using an index, any store
     */ 
    static async obj_exists(Store,Index_Name,Value){
        var Index = Store.index(Index_Name);
        var Key   = await Index.get_key(eidb.value_is(Value));
        return Key!=null;
    }

    /**
     * Increase number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async increase_num_objs(Swords, Store_Name, Word){
        var Entry = await Swords.index("Store,Word").get(eidb.value_is([Store_Name,Word]));
        Entry.num_obj_ids++;
        await Swords.put(Entry);
    }

    /**
     * Decrease number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async decrease_num_objs(Swords, Store_Name, Word){
        var Entry = await Swords.index("Store,Word").get(eidb.value_is([Store_Name,Word]));

        if (Entry.num_obj_ids > 0)
            Entry.num_obj_ids--;

        if (Entry.num_obj_ids > 0)
            await Swords.put(Entry);
        else
            await Swords.delete(eidb.value_is(Entry.id));
    }

    #_____UPDATE_____(){}

    /**
     * Update FTS
     */ 
    static async update_fts(Op, Store_Name, id, Obj, secure=false){
        if (["create","update","delete"].indexOf(Op) == -1){
            loge("[EI] fts.update_fts: Bad operation:",Op);
            return;
        }
        if (secure){
            var Word_Store = "#fts_words";
            var Id_Store   = "#fts_ids";
        }
        else{
            var Word_Store = "fts_words";
            var Id_Store   = "fts_ids";
        }

        // Get unique words from Obj
        var Words = fts.obj_to_unique_words(Obj);

        if (secure){
            for (let i=0; i<Words.length; i++){
                let Sword = (await wcrypto.encrypt_aes_fiv(Words[i], idbxs.Skey))[0];
                Words[i]  = Sword;
            }
        }

        // Open stores
        var Db = await idbx.reopen();
        var T  = Db.transaction([Word_Store, Id_Store],eidb.RW);
        // Word data store
        var Swords = T.object_store(Word_Store); 
        // Id data store
        var Sids   = T.object_store(Id_Store);

        // Update FTS data for words already in db
        // Considering the existence of tuple (store,word,id)
        for (let Word of Words){
            let word_exists = await fts.obj_exists(Swords, "Store,Word", [Store_Name,Word]);            

            if (!word_exists) 
                await Swords.add({ Store:Store_Name, Word:Word, num_obj_ids:0 });            

            // Op 'create'
            if (Op=="create"){                
                // (store,word) existing + new id --> new (store,word,id)
                await Sids.add({ Store:Store_Name, Word:Word, obj_id:id });
                await fts.increase_num_objs(Swords, Store_Name, Word);
            }
            else
            
            // Op 'update', (store,id) is existing, check Word
            if (Op=="update"){
                let wordid_pair_exists = await fts.obj_exists(Sids, "Store,Word,obj_id", 
                                               [Store_Name,Word,id]);

                // Case 1: New word in Obj
                if (!wordid_pair_exists){
                    await Sids.add({ Store:Store_Name, Word:Word, obj_id:id });
                    await fts.increase_num_objs(Swords, Store_Name, Word);
                }

                // Case 2: Word stays the same in Obj
                else{
                    // Do nothing
                }

                // Case 3: Word removed from Obj
                // Special case dependent on existing words in FTS data, 
                // see 'More update' after this loop
            }

            // Op 'delete
            else{
                // (store,word) existing, id is inexistent --> del (store,word,id)
                await Sids.index("Store,Word,obj_id").delete(eidb.value_is([Store_Name,Word,id]));
                await fts.decrease_num_objs(Swords, Store_Name, Word);
            }
        }

        // More update:
        // Load words matching (store,id) in FTS data for 'update' case
        var Existing_Words = await Sids.index("Store,obj_id").get_all(eidb.value_is([Store_Name,id]));
            Existing_Words = Existing_Words.map(X => X.Word);
        var Removed_Words  = Existing_Words.filter(W => Words.indexOf(W)==-1);    

        // Remove (store,* of Removed_Words,id)
        for (let Word of Removed_Words){
            await Sids.index("Store,Word,obj_id").delete(eidb.value_is([Store_Name,Word,id]));
            await fts.decrease_num_objs(Swords, Store_Name, Word);
        }

        // Close db con, done    
        Db.close();
    }

    /**
     * Update FTS data, CRUD/C
     */ 
    static update_fts_c(Store_Name, id, Obj, secure=false){
        if (!fts.enabled) return;

        // Run in background, no await
        fts.update_fts("create", Store_Name, id, Obj, secure);
    }

    /**
     * Update FTS data, CRUD/R
     */ 
    static update_fts_r(Store_Name, id, Obj, secure=false){
        // NO POINTS TO UPDATE FTS ON READ, NOTHING CHANGES.
    }

    /**
     * Update FTS data, CRUD/U
     */ 
    static update_fts_u(Store_Name, id, Obj, secure=false){
        if (!fts.enabled) return;

        // Run in background, no await
        fts.update_fts("update", Store_Name, id, Obj, secure);
    }

    /**
     * Update FTS data, CRUD/D
     */ 
    static update_fts_d(Store_Name, id, Obj, secure=false){
        if (!fts.enabled) return;

        // Run in background, no await
        fts.update_fts("delete", Store_Name, id, Obj, secure);
    }

    #_____SEARCH_____(){}

    /**
     * All objects containing a term
     */
    static async #term_to_objs(Sids, Store,Term, limit){
        var Store_Name = Store.Name;

        // Get ids
        var Ids = [];

        await Sids.index("Store,Word").open_cursor(
                eidb.value_is([Store_Name,Term]),"next",Cursor=>{
            Ids.push(Cursor.value.obj_id);
            if (Ids.length >= limit) return eidb._stop;
        });

        // Get objects from ids
        var Objs = [];

        for (let id of Ids){
            let Obj = await Store.get(eidb.value_is(id));

            if (Obj!=null) Objs.push(Obj);
            else           logw("[EI] fts.#term_to_objs: Found bad id:",id);
        }
        return Objs;
    }    

    /**
     * Give objects scores
     */ 
    static #score_objs(Objs,Terms){
        var Items      = [];
        var Term2Score = {};
        var score      = 1;

        // Make base score for terms (more important terms first)
        for (let i=Terms.length-1; i>=0; i--){
            Term2Score[Terms[i]] = score;

            if (score < Number.MAX_SAFE_INTEGER/fts.score_rate) 
                score *= fts.score_rate;
        }

        // Calculate score for objects
        for (let Obj of Objs){
            let Item  = {Object:Obj, score:0};
            let Str   = utils.obj_to_valuestr(Obj).toLowerCase();            
            let score = 0;

            // Score for object is sum of score for terms with respect to object
            for (let Term of Terms){
                let Term2      = utils.escape_for_regex(Term);
                let term_score = Term2Score[Term];
                let count      = (Str.match(new RegExp(Term2,"g")) || []).length; // Always>0
                score         += term_score * count;
            }

            Item.score = score;
            Items.push(Item);
        }

        // Bigger score first
        return Items.sort((A,B) => B.score-A.score);
    }

    /**
     * Find objects by terms in a string
     * @return {Object} List of objects found, list of search terms, 
     *                  and list of excluded terms (terms not in FTS data)
     */ 
    static async find_many_by_terms(Store_Name, Terms_Str, limit=1000, secure=false){
        if (fts.enabled == false)
            logw("[EI] fts.find_many_by_terms: FTS is disabled, there might be results but no changes.");
        if (secure){
            var Word_Store = "#fts_words";
            var Id_Store   = "#fts_ids";
        }
        else{
            var Word_Store = "fts_words";
            var Id_Store   = "fts_ids";
        }    

        // Get terms
        var Terms = fts.str_to_unique_words(Terms_Str); // All lower-case words

        if (secure){
            for (let i=0; i<Terms.length; i++)
                Terms[i] = (await wcrypto.encrypt_aes_fiv(Terms[i], idbxs.Skey))[0];
        }

        // Get stores
        var Db     = await eidb.reopen();
        var T      = Db.transaction([Word_Store,Id_Store,Store_Name],eidb.RO);
        var Swords = T.object_store(Word_Store);
        var Sids   = T.object_store(Id_Store);
        var Store  = T.object_store(Store_Name);
        
        // Get id set sizes of all terms
        var Notfound_Terms = [];
        var Search_Sets    = []; // Sets of terms to search        

        for (let Term of Terms){
            let Obj = await Swords.index("Store,Word").get(eidb.value_is([Store_Name,Term]));
            
            // No such term in FTS data
            if (Obj==null){
                Notfound_Terms.push(Term);
                continue;
            }

            // Term exists
            let Item = {Term:Term, exists:true, size:Obj.num_obj_ids};
            Search_Sets.push(Item);
        }

        // Special case, all terms not in FTS data
        var Note = "More specific terms are listed first in Search_Terms; "+
                   "higher score items are listed first.";

        if (Search_Sets.length==0)
            return {
                Items:[], Search_Terms:[], Excluded_Terms:Notfound_Terms,
                Note:Note
            };

        // Special case, only 1 term:
        if (Search_Sets.length==1){
            let Term        = Search_Sets[0].Term;
            let Objs        = await fts.#term_to_objs(Sids, Store,Term, limit);
            let Scored_Objs = fts.#score_objs(Objs,[Term]);
            return {
                Items:Scored_Objs, Search_Terms:[Term], Excluded_Terms:Notfound_Terms,
                Note:Note
            };
        }
        
        // Sort Search_Sets ascending to start intersecting from smallest set size,
        // direct intersection with all the rest of sets at once instead of one by one thru'
        // intermediate intersection.
        Search_Sets      = Search_Sets.sort((A,B) => A.size-B.size);
        var Search_Terms = Search_Sets.map(X=>X.Term);
        
        // Iterate thru' first set with a cursor
        var Term1       = Search_Sets[0].Term;
        var Other_Terms = Search_Sets.slice(1).map(X=>X.Term); 
        var Ids         = [];

        await Sids.index("Store,Word").open_cursor(
                eidb.value_is([Store_Name,Term1]),"next",async Cursor=>{
            var id           = Cursor.value.obj_id;
            var id_is_in_all = true;

            // Check if id is in all other terms
            for (let Term of Other_Terms){ // Other sets
                if (await Sids.index("Store,Word,obj_id").count(eidb.value_is([Store_Name,Term,id])) == 0){                    
                    id_is_in_all = false;
                    break;
                }
            }

            if (id_is_in_all) Ids.push(id);
        });

        // Convert ids to objs
        var Objs = [];

        for (let id of Ids){
            let Obj = await Store.get(eidb.value_is(id));

            if (Obj!=null) Objs.push(Obj);
            else           logw("[EI] fts.find_many_by_terms: Found bad id:",id);
        }
        var Scored_Objs = fts.#score_objs(Objs,Search_Terms);    

        // Close db con and return 
        Db.close();
        return {
            Items:Scored_Objs, Search_Terms:Search_Terms, Excluded_Terms:Notfound_Terms,
            Note:Note
        };
    }

    #_____CORE_____(){}

    /**
     * Init
     */ 
    static init(){
    }
}

export default fts;
// EOF