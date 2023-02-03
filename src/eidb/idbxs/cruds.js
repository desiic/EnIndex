/**
 * @module eidb/idbxs/cruds
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, idbxs.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// Modules
import base    from "../base.js";
import crud    from "../idbx/crud.js";
import fts     from "../idbx/fts.js";
import idbxs   from "../idbxs.js";
import wcrypto from "../wcrypto.js";
import utils   from "../utils.js";

// Shorthands
const log      = console.log;
const logw     = console.warn;
const loge     = console.error;
const new_lock = base.new_lock;

/**
 * CRUD secure<br/>
 * WARN: FOR ENCRYPTED CRUD OPS: ALL Cond PASSED TO METHODS IN THIS CLASS ARE ALL DIRECT VALUES,
 *       CAN'T BE RANGES AS IN crud CLASS, SEE dobi.js, DOBI CAN BE RANGES.
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
        var id = await crud.insert_one(Store_Name,Sobj, _secure,Obj);
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
        var Ids = await crud.insert_many(Store_Name,Sobjs, _secure,Objs);
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
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
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
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
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
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
                Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Find
        var Sobj = await crud.find_one(Store_Name,Scond, _secure);
        if (Sobj==null) return null;

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
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
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
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
                Scond[Key] = await idbxs.value_to_svalue(Cond[Key]); // No compound index
        
        // Find
        // TO-DO: RECHECK, Cond MAY CONTAIN PARTIAL VALUE INSTEAD OF WHOLE FIELD VALUE
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

        // Make encrypted obj, each index field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.        
        var Schanges = await idbxs.obj_to_sobj_arb(Changes);        
        var Scond    = {};

        for (let Key in Cond)
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
                Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Apply changes to Etds_Obj
        var Sobj1 = await crud.find_one(Store_Name,Scond, _secure);
        var Json  = await wcrypto.decrypt_aes_fiv(Sobj1.Etds_Obj, idbxs.Skey);
        var Obj   = utils.json_to_obj_bd(Json);

        Obj  = {...Obj, ...Changes};        
        Json = utils.obj_to_json(Obj); 
        Schanges.Etds_Obj = (await wcrypto.encrypt_aes_fiv(Json, idbxs.Skey))[0];
        
        // Update
        var Sobj2 = await crud.update_one(Store_Name,Scond,Schanges, _secure,Obj);

        // Decrypt
        var Json = await wcrypto.decrypt_aes_fiv(Sobj2.Etds_Obj, idbxs.Skey);
        var Obj  = utils.json_to_obj_bd(Json);
        Obj.id   = Sobj2.id;

        return Obj;
    }

    /**
     * Update many, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD.<br/>
     * WARN: THIS SECURE OP IS SLOW DUE TO UPDATING MULTIPLE Etds_Obj(s)
     *       WHICH REQUIRES MULTIPLE crud.update_one, CAN'T CALL crud,update_many
     *       COZ EACH Changes CONTAINS A DIFFERENT Etds_Obj. TO AVOID MULTIPLE
     *       TRANSACTIONS IN update_one, THIS SECURE update_many UPDATES 
     *       DIRECTLY THRU' OBJECT STORE. 
     * @return {Object}
     */
    static async update_many(Store_Name,Cond,Changes, limit=Number.MAX_SAFE_INTEGER){
        if (idbxs.Skey==null) {
            loge("cruds.update_many: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;

        // Remove possible id in Changes
        var Temp = utils.deepcopy(Changes);
        delete Temp.id;
        Changes = Temp;
        
        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.        
        var Schanges     = await idbxs.obj_to_sobj_arb(Changes);
        var Schanges_Arr = []; // Each object has a separate Etds_Obj
        var Scond        = {};

        for (let Key in Cond)
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
                Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);

        // Apply changes to Etds_Obj        
        var Sobj1s        = await crud.find_many(Store_Name,Scond, _secure);
        var Original_Objs = [];

        for (let Sobj1 of Sobj1s){
            let Json = await wcrypto.decrypt_aes_fiv(Sobj1.Etds_Obj, idbxs.Skey);
            let Obj  = utils.json_to_obj_bd(Json);

            Obj  = {...Obj, ...Changes, ...{id:Sobj1.id}};
            Json = utils.obj_to_json(Obj); 
            Original_Objs.push(Obj);

            let Schanges_Item      = utils.deepcopy(Schanges);
            Schanges_Item.Etds_Obj = (await wcrypto.encrypt_aes_fiv(Json, idbxs.Skey))[0];
            Schanges_Arr.push(Schanges_Item);
        }
        
        // Update
        var Db            = await eidb.reopen();
        var T             = Db.transaction(Store_Name,RW);
        var S             = T.store1();
        var done          = 0;
        var Sobj2s        = [];
        var [Lock,unlock] = new_lock();

        for (let i=0; i<Sobj1s.length; i++){
            let Sobj1 = {...Sobj1s[i], ...Schanges_Arr[i]};
            let wait;

            S.put(Sobj1,null, wait=false,(Res)=>{
                if (Res instanceof Error){
                    loge("cruds.update_many: Error:",Res);
                    Sobj2s.push(null);
                }
                else 
                    Sobj2s.push(Sobj1);

                // FTS
                fts.update_fts_u(Store_Name, Original_Objs[i].id, Original_Objs[i]);    

                // Counter    
                done++;
                if (done==Sobj1s.length) unlock();
            });
        }
        await Lock;

        // Decrypt
        var Objs = [];

        for (let Sobj2 of Sobj2s){
            let Json = await wcrypto.decrypt_aes_fiv(Sobj2.Etds_Obj, idbxs.Skey);
            let Obj  = utils.json_to_obj_bd(Json);
            Obj.id   = Sobj2.id;
            Objs.push(Obj);
        }

        Db.close();
        return Objs;
    }

    /**
     * Upsert one, avoid using multiple conditions in Cond coz it's slow,
     * USE COMPOUND INDEX INSTEAD
     * @return {Number}
     */
    static async upsert_one(Store_Name,Cond,Changes){
        if (idbxs.Skey==null) {
            loge("cruds.upsert_one: Static key not set");
            return;
        }
        Store_Name = "#"+Store_Name;

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.        
        var Schanges = await idbxs.obj_to_sobj_arb(Changes);
        var Scond    = {};

        for (let Key in Cond)
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
                Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);

        // Apply changes to Etds_Obj
        var Sobj1 = await crud.find_one(Store_Name,Scond, _secure);
        var Json  = await wcrypto.decrypt_aes_fiv(Sobj1.Etds_Obj, idbxs.Skey);
        var Obj   = utils.json_to_obj_bd(Json);

        Obj  = {...Obj, ...Changes};
        Json = utils.obj_to_json(Obj); 
        Schanges.Etds_Obj = (await wcrypto.encrypt_aes_fiv(Json, idbxs.Skey))[0];
        
        // Upsert
        var id = await crud.upsert_one(Store_Name,Scond,Schanges, _secure,Obj);
        return id;
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Scond = {};

        for (let Key in Cond)
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
                Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Find
        var Sobj = await crud.find_one(Store_Name,Scond, _secure);
        if (Sobj==null) return null;

        // Decrypt
        var Json = await wcrypto.decrypt_aes_fiv(Sobj.Etds_Obj, idbxs.Skey);
        var Obj  = utils.json_to_obj_bd(Json);
        Obj.id   = Sobj.id;
        
        // Remove
        await crud.remove_one(Store_Name,Scond, _secure,Obj);
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

        // Make encrypted obj, each infex field is encrypted to find,
        // whole obj is encrypted to 'Etds_Obj' field to load all inc. non indexed fields.
        var Scond = {};

        for (let Key in Cond)
            if (Key=="id")
                Scond[Key] = Cond[Key];
            else
            if ((Cond[Key] instanceof Array) && Key.indexOf(",")>=0) // Compound index
                Scond[Key] = await idbxs.array_to_sarray(Cond[Key]);
            else
                Scond[Key] = await idbxs.value_to_svalue(Cond[Key]);
        
        // Find
        var Objs  = [];
        var Sobjs = await crud.find_many(Store_Name,Scond, _secure);
        if (Sobjs==null || Sobjs.length==0) return null;

        // Decrypt
        for (let Sobj of Sobjs){
            var Json = await wcrypto.decrypt_aes_fiv(Sobj.Etds_Obj, idbxs.Skey);
            var Obj  = utils.json_to_obj_bd(Json);
            Obj.id   = Sobj.id;
            Objs.push(Obj);
        }
        
        // Remove
        await crud.remove_many(Store_Name,Scond, _secure,Objs);
    }

    /**
     * Init static stuff
     */ 
    static init(){
    }
}

export default cruds;
// EOF