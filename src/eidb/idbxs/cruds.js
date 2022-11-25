/**
 * @module eidb/idbxs/cruds
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, idbxs.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

/**
 * CRUD secure
 */
class cruds {

    /**
     * Insert one
     * @return {Number} Id of the new obj
     */
    static async insert_one(Store_Name,Obj){
    }

    /**
     * Insert many
     * @return {Array} List of inserted object ids
     */
    static async insert_many(Store_Name,Objs){
    }

    /**
     * Get object by 1 condition only
     */
    static async get_1stcond_obj(Store,Cond){ // Cond can't be empty {}
    }

    /**
     * Get objects by 1 condition only
     */
    static async get_1stcond_objs(Store,Cond){ // Cond can't be empty {}
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for id list.
     */ 
    static async intersect_cond(Store,Cond){
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for object list.
     */ 
    static async intersect_cond_getobjs(Store,Cond){
    }

    /**
     * Check existence of obj<br/>
     * Avoid multiple conds in Cond, use compound index.<br/>
     * Note: Read but no fetching data, no op history
     * @return {Boolean}
     */
    static async exists(Store_Name,Cond){
    }

    /**
     * Count<br/>
     * Avoid multiple conds in Cond, use compound index<br/>
     * Note: Read but no fetching data, no op history
     * @return {Number}
     */
    static async count(Store_Name,Cond){
    }

    /**
     * Count all<br/>
     * Note: Read but no fetching data, no op history
     * @return {Number}
     */
    static async count_all(Store_Name){
    }

    /**
     * Find one, avoid using multiple conditions in Cond coz it's slow
     * @return {Object}
     */
    static async find_one(Store_Name,Cond){
    }

    /**
     * Find many, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD.
     * @return {Object}
     */
    static async find_many(Store_Name,Cond, limit=Number.MAX_SAFE_INTEGER){
    }

    /**
     * Find all
     * @return {Array}
     */
    static async find_all(Store_Name){
    }

    /**
     * Get value at prop path
     */ 
    static get_proppath_value(Obj,Path){
    }

    /**
     * Check if object matches condition
     */ 
    static obj_matches_cond(Obj,Cond){
    }

    /**
     * Filter (value contain, for exact match: use find, find_many)
     */ 
    static async filter(Store_Name,Cond, limit=Number.MAX_SAFE_INTEGER){
    }

    /**
     * Update one, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD.
     * @return {Object}
     */
    static async update_one(Store_Name,Cond,Changes){
    }

    /**
     * Update many, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD.
     * @return {Object}
     */
    static async update_many(Store_Name,Cond,Changes, limit=Number.MAX_SAFE_INTEGER){
    }

    /**
     * Upsert one, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD
     * @return {Object}
     */
    static async upsert_one(Store_Name,Cond,Changes){
    }

    /**
     * Remove one, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD
     * @return {null}
     */
    static async remove_one(Store_Name,Cond){
    }

    /**
     * Remove many, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD
     * @return {null}
     */
    static async remove_many(Store_Name,Cond){
    }
}

export default cruds;
// EOF