/**
 * @module eidb/idbxs/cruds
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, idbxs.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// Modules
import crud    from "../idbx/crud.js";
import idbxs   from "../idbxs.js";
import wcrypto from "../wcrypto.js";
import utils   from "../utils.js";

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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Sobjs = [];

        for (let Obj of Objs)
            Sobjs.push( await idbxs.obj_to_sobj(Store_Name,Obj) );
        
        // Insert
        var Ids = await crud.insert_many(Store_Name,Sobjs, _secure);
        return Ids;
    }

    /**
     * Get object by 1 condition only
     */
    static async get_1stcond_obj(Store,Cond){ // Cond can't be empty {}
        // Unused
    }

    /**
     * Get objects by 1 condition only
     */
    static async get_1stcond_objs(Store,Cond){ // Cond can't be empty {}
        // Unused
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for id list.
     */ 
    static async intersect_cond(Store,Cond){
        // Unused
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for object list.
     */ 
    static async intersect_cond_getobjs(Store,Cond){
        // Unused
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Scond = {};

        for (let Key in Cond)
            Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Check
        var res = await crud.exists(Store_Name,Scond, _secure);
        return res;
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Scond = {};

        for (let Key in Cond)
            Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Count
        var res = await crud.count(Store_Name,Scond, _secure);
        return res;
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

        return await crud.count_all(Store_Name, _secure);
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Scond = {};

        for (let Key in Cond)
            Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Find
        var Sobj = await crud.find_one(Store_Name,Scond, _secure);

        // Decrypt
        var Json = await wcrypto.decrypt_aes_fiv(Sobj.Etds_Obj, idbxs.Skey);
        var Obj  = utils.json_to_obj_bd(Json);
        Obj.id   = Sobj.id;

        return Obj;
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Scond = {};

        for (let Key in Cond)
            Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Find
        var Sobjs = await crud.find_many(Store_Name,Scond, limit,_secure);

        // Decrypt
        var Objs = [];

        for (let Sobj of Sobjs){
            var Json = await wcrypto.decrypt_aes_fiv(Sobj.Etds_Obj, idbxs.Skey);
            var Obj  = utils.json_to_obj_bd(Json);
            Obj.id   = Sobj.id;
            Objs.push(Obj);
        }

        return Objs;
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

        // Find
        var Sobjs = await crud.find_all(Store_Name, _secure);

        // Decrypt
        var Objs = [];

        for (let Sobj of Sobjs){
            var Json = await wcrypto.decrypt_aes_fiv(Sobj.Etds_Obj, idbxs.Skey);
            if (Json==null) continue;

            var Obj = utils.json_to_obj_bd(Json);
            Obj.id  = Sobj.id;
            Objs.push(Obj);
        }

        return Objs;
    }

    /**
     * Get value at prop path
     */ 
    static get_proppath_value(Obj,Path){
        // Unused
    }

    /**
     * Check if object matches condition
     */ 
    static obj_matches_cond(Obj,Cond){
        // Unused
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Scond = {};

        for (let Key in Cond)
            Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Find
        var Sobjs = await crud.filter(Store_Name,Scond, limit,_secure);

        // Decrypt
        var Objs = [];

        for (let Sobj of Sobjs){
            var Json = await wcrypto.decrypt_aes_fiv(Sobj.Etds_Obj, idbxs.Skey);
            var Obj  = utils.json_to_obj_bd(Json);
            Obj.id   = Sobj.id;
            Objs.push(Obj);
        }

        return Objs;
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.        
        var Schanges = await idbxs.obj_to_sobj_full(Changes);
        var Scond    = {};

        for (let Key in Cond)
            Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);

        // Apply changes to Etds_Obj
        var Sobj1 = await crud.find_one(Store_Name,Scond, _secure);
        var Obj   = await wcrypto.decrypt_aes_fiv(Sobj1.Etds_Obj, idbxs.Skey);
        Obj       = {...Obj, ...Changes};
        var Json  = await utils.obj_to_json(Obj);        
        ???
        log("in db obj",Obj)
        log("apply",Json)
        Schanges.Etds_Obj = (await wcrypto.encrypt_aes_fiv(Json, idbxs.Skey))[0];
        
        // Update
        log("b4",await crud.find_one(Store_Name,Scond, _secure) );
        var Sobj2 = await crud.update_one(Store_Name,Scond,Schanges, _secure);      
        log("cond",Scond)
        log("changes",Schanges)
        log("af",Sobj2)  

        // Decrypt
        var Json = await wcrypto.decrypt_aes_fiv(Sobj2.Etds_Obj, idbxs.Skey);
        log("json",Json)
        var Obj  = utils.json_to_obj_bd(Json);
        Obj.id   = Sobj2.id;
        log("obj",Obj)

        return Obj;
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

    /**
     * Init static stuff
     */ 
    static init(){
    }
}

export default cruds;
// EOF