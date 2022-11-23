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
     * Check if object exists using an index, any store
     */ 
    static async obj_exists(Store,Index_Name,Value){
        var Index = Store.index(Index_Name);
        var Key   = await Index.get_key(value_is(Value));
        return Key!=null;
    }

    /**
     * Increase number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async increase_num_objs(Swords, Store_Name, Word){
        var Entry = await Swords.index("Store,Word").get(value_is([Store_Name,Word]));
        Entry.num_obj_ids += 1;
        await Swords.put(Entry);
    }

    /**
     * Decrease number of object counter for a word<br/>
     * Requirement: Pair Store_Name & Word must be already in fts_words store
     */ 
    static async decrease_num_objs(Swords, Store_Name, Word, dec_count=1){
        var Entry = await Swords.index("Store,Word").get(value_is([Store_Name,Word]));

        if (Entry.num_obj_ids >= dec_count)
            Entry.num_obj_ids -= dec_count;

        await Swords.put(Entry);
    }

    /**
     * Update FTS
     */ 
    static async update_fts(Op, Store_Name, id, Obj){
        var Db = await idbx.reopen();
        var T  = Db.transaction(["fts_words", "fts_ids"],RW);

        // Word data store
        var Swords = T.object_store("fts_words"); 
        // Id data store
        var Sids   = T.object_store("fts_ids");  

        // Get unique words from Obj
        var Words           = fts.obj_to_unique_words(Obj);
        var update_deldone  = false;
        var Update_Delwords = [];        
        var delete_deldone  = false;
        var Delete_Delwords = [];

        // Update FTS data for words already in db
        for (let Word of Words){
            let word_exists = await fts.obj_exists(Swords, "Store,Word", [Store_Name,Word]);            

            if (!word_exists) 
                await Swords.add({ Store:Store_Name, Word:Word, num_obj_ids:0 });            

            // Op 'create'
            if (Op=="create"){                
                // Tuple (store,word,id) is new (coz store is never with id before)
                await Sids.add({ Store:Store_Name, Word:Word, obj_id:id });
                await fts.increase_num_objs(Swords, Store_Name, Word);
            }
            else
            
            // Op 'update'
            if (Op=="update"){ ???check
                // Store is always with id, check wordid pair
                let wordid_exists = await fts.obj_exists(Sids, "Store,Word,obj_id", [Store_Name,Word,id]);    

                // New word
                if (!wordid_exists){
                    await Sids.add({ Store:Store_Name, Word:Word, obj_id:id });
                    await fts.increase_num_objs(Swords, Store_Name, Word);
                }
                
                // Remove words no longer in object by Store_Name/id
                if (!update_deldone){ // Del once only
                    await Sids.index("Store,obj_id").open_cursor(
                            value_is([Store_Name,id]),"next",Cursor=>{
                        if (Words.indexOf(Cursor.value.Word) == -1){
                            Update_Delwords.push(Cursor.value.Word);
                            Cursor.delete();
                        }
                    });
                    update_deldone = true;
                }

                if (Update_Delwords.indexOf(Word) >= 0)
                    await fts.decrease_num_objs(Swords, Store_Name, Word);
            }

            // Op 'delete
            else{
                // Tuple (store,*,id) is no longer existing (coz store is no more with id)
                if (!delete_deldone){ // Del once only
                    await Sids.index("Store,obj_id").open_cursor(
                            value_is([Store_Name,id]),"next",Cursor=>{
                        if (Words.indexOf(Cursor.value.Word) == -1){
                            Delete_Delwords.push(Cursor.value.Word);
                            Cursor.delete();
                        }
                    });
                    delete_deldone = true;
                }

                if (Delete_Delwords.indexOf(Word) >= 0)
                    await fts.decrease_num_objs(Swords, Store_Name, Word);
            }
        }

        Db.close();
    }

    /**
     * Update FTS data, CRUD/C
     */ 
    static update_fts_c(Store_Name, id, Obj){
        if (!fts.enabled) return;

        // Run in background, no await
        fts.update_fts("create", Store_Name, id, Obj);
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
        if (!fts.enabled) return;

        // Run in background, no await
        fts.update_fts("update", Store_Name, id, Obj);
    }

    /**
     * Update FTS data, CRUD/D
     */ 
    static update_fts_d(Store_Name, id, Obj){
        if (!fts.enabled) return;

        // Run in background, no await
        fts.update_fts("delete", Store_Name, id, Obj);
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