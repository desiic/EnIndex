/**
 * @module eidb/idbxs/cruds
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, idbxs.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// Modules
import crud    from "../idbx/crud.js";
import wcrypto from "../wcrypto.js";
import idbxs   from "../idbxs.js";

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

/**
 * CRUD secure
 */
class cruds {

    /**
     * Insert one
     * @return {Number} Id of the new obj
     */
    static async insert_one(Store_Name,Obj){
        if (idbxs.Skey==null) {
            loge("cruds.insert_one: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Sobj = await idbxs.obj_to_sobj(Store_Name,Obj);
        
        // Insert
        var id = await crud.insert_one(Store_Name,Sobj, _secure);
        return id;
    }

    /**
     * Insert many
     * @return {Array} List of inserted object ids
     */
    static async insert_many(Store_Name,Objs){
        if (idbxs.Skey==null) {
            loge("cruds.insert_many: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Get object by 1 condition only
     */
    static async get_1stcond_obj(Store,Cond){ // Cond can't be empty {}
        if (idbxs.Skey==null) {
            loge("cruds.get_1stcond_obj: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Get objects by 1 condition only
     */
    static async get_1stcond_objs(Store,Cond){ // Cond can't be empty {}
        if (idbxs.Skey==null) {
            loge("cruds.get_1stcond_objs: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for id list.
     */ 
    static async intersect_cond(Store,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.intersect_cond: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for object list.
     */ 
    static async intersect_cond_getobjs(Store,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.intersect_cond_getobjs: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Check existence of obj<br/>
     * Avoid multiple conds in Cond, use compound index.<br/>
     * Note: Read but no fetching data, no op history
     * @return {Boolean}
     */
    static async exists(Store_Name,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.exists: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Count<br/>
     * Avoid multiple conds in Cond, use compound index<br/>
     * Note: Read but no fetching data, no op history
     * @return {Number}
     */
    static async count(Store_Name,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.count: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Count all<br/>
     * Note: Read but no fetching data, no op history
     * @return {Number}
     */
    static async count_all(Store_Name){
        if (idbxs.Skey==null) {
            loge("cruds.count_all: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Find one, avoid using multiple conditions in Cond coz it's slow
     * @return {Object}
     */
    static async find_one(Store_Name,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.find_one: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Find many, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD.
     * @return {Object}
     */
    static async find_many(Store_Name,Cond, limit=Number.MAX_SAFE_INTEGER){
        if (idbxs.Skey==null) {
            loge("cruds.find_many: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Find all
     * @return {Array}
     */
    static async find_all(Store_Name){
        if (idbxs.Skey==null) {
            loge("cruds.find_all: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Get value at prop path
     */ 
    static get_proppath_value(Obj,Path){
        if (idbxs.Skey==null) {
            loge("cruds.get_proppath_value: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Check if object matches condition
     */ 
    static obj_matches_cond(Obj,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.obj_matches_cond: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Filter (value contain, for exact match: use find, find_many)
     */ 
    static async filter(Store_Name,Cond, limit=Number.MAX_SAFE_INTEGER){
        if (idbxs.Skey==null) {
            loge("cruds.filter: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Update one, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD.
     * @return {Object}
     */
    static async update_one(Store_Name,Cond,Changes){
        if (idbxs.Skey==null) {
            loge("cruds.update_one: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Update many, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD.
     * @return {Object}
     */
    static async update_many(Store_Name,Cond,Changes, limit=Number.MAX_SAFE_INTEGER){
        if (idbxs.Skey==null) {
            loge("cruds.update_many: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Upsert one, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD
     * @return {Object}
     */
    static async upsert_one(Store_Name,Cond,Changes){
        if (idbxs.Skey==null) {
            loge("cruds.upsert_one: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Remove one, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD
     * @return {null}
     */
    static async remove_one(Store_Name,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.remove_one: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }

    /**
     * Remove many, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD
     * @return {null}
     */
    static async remove_many(Store_Name,Cond){
        if (idbxs.Skey==null) {
            loge("cruds.remove_many: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;
    }
}

export default cruds;
// EOF