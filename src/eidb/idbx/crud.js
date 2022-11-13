/**
 * @module eidb/idbx/crud
 */

// Modules
import base from "../base.js";

// Shorthands
var log      = console.log;
var logw     = console.warn;
var loge     = console.error;
var new_lock = base.new_lock;
var json2obj = JSON.parse;
var obj2json = JSON.stringify;

/**
 * CRUD op class
 */
class crud {

    /**
     * Insert one
     * @return {Number} Id of the new obj
     */
    static async insert_one(Store,Obj){
        return await Store.add(Obj);
    }

    /**
     * Insert many
     * @return {Array} List of inserted object ids
     */
    static async insert_many(Store,Objs){
        var Ids           = [];
        var [Lock,unlock] = new_lock();
        if (Objs==null || Objs.length==0) return [];
        
        // Add all objects till all added
        for (let Obj of Objs){
            let Req = Store.self.add(Obj); // MUST BE 'let' HERE, EACH Req IS DIFFERENT.

            Req.onerror = (Ev)=>{
                loge("crud.insert_many: Failed to add object, error:",Ev.target.error);
                Ids.push(null);
                if (Ids.length == Objs.length) unlock();
            };
            Req.onsuccess = (Ev)=>{
                Ids.push(Ev.target.result);
                if (Ids.length == Objs.length) unlock();
            };            
        }

        await Lock;
        return Ids;
    }

    /**
     * Get object by 1 condition only
     */
    static async get_1stcond_obj(Store,Cond){ // Cond can't be empty {}
        var Keys  = Object.keys(Cond);
        var Index = Store.index(Keys[0]);

        if (Index instanceof Error){
            loge("crud.get_1stcond_obj: Failed to get index, "+
                 "add this index to schema:",Store.Name,"/",Keys[0]);
            return null;
        }

        var Range = value_is(Cond[Keys[0]]);
        return await Index.get(Range);
    }

    /**
     * Get objects by 1 condition only
     */
    static async get_1stcond_objs(Store,Cond){ // Cond can't be empty {}
        var Keys  = Object.keys(Cond);
        var Index = Store.index(Keys[0]);

        if (Index instanceof Error){
            loge("crud.get_1stcond_obj: Failed to get index, "+
                 "add this index to schema:",Store.Name,"/",Keys[0]);
            return null;
        }

        var Range = value_is(Cond[Keys[0]]);
        return await Index.get_all(Range);
    }

    /**
     * Intersect arrays
     */ 
    static intersect_arrs(Arrays){
        // Ref: https://stackoverflow.com/a/51874332/5581893
        // Note: Id_Arrays.length MUST BE >0
        return Arrays.reduce((t,a) => t.filter(b => a.includes(b)));
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for id list.
     */ 
    static async intersect_cond(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return [];

        // Multiple conditions, intersect       
        var Id_Arrays = [];

        for (let Key of Keys){
            let Index = Store.index(Key);

            if (Index instanceof Error){
                loge("crud.get_1stcond_obj: Failed to get index, "+
                     "add this index to schema:",Store.Name,"/",Key);
                return null;
            }

            let Range = value_is(Cond[Key]);
            let Objs  = await Index.get_all(Range);
            let Ids   = Objs.map(Obj=>Obj.id);
            Id_Arrays.push(Ids);
        }
        
        return crud.intersect_arrs(Id_Arrays);
    }

    /**
     * Intersect conditions (key values) to get ids, eg. Cond {foo:"a", bar:"b"},
     * key foo gives multiple items of value 'a', key bar gives multiple items
     * of value 'b', intersect these 2 for object list.
     */ 
     static async intersect_cond_getobjs(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return [];

        // Multiple conditions, intersect       
        var Id_Arrays = [];
        var Id2Objs   = {};

        for (let Key of Keys){
            let Index = Store.index(Key);

            if (Index instanceof Error){
                loge("crud.get_1stcond_obj: Failed to get index, "+
                     "add this index to schema:",Store.Name,"/",Key);
                return null;
            }

            let Range = value_is(Cond[Key]);
            let Objs  = await Index.get_all(Range);

            let Ids = Objs.map(Obj=>{
                Id2Objs[Obj.id] = Obj;
                return Obj.id;
            });

            Id_Arrays.push(Ids);
        }
        
        var Id_Intersection = crud.intersect_arrs(Id_Arrays);
        return Id_Intersection.map(id => Id2Objs[id]);
    }

    /**
     * Check existence of obj
     * @return {Boolean}
     */
    static async exists(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return [];

        // Single cond
        if (Keys.length==1){
            let Obj = await crud.get_1stcond_obj(Store,Cond);
            return Obj!=null;
        }

        // Multiple conds
        var Ids = await crud.intersect_cond(Store,Cond);
        return Ids.length>0;
    }

    /**
     * Count
     * @return {Number}
     */
    static async count(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        if (Keys.length==1){
            let Objs = await crud.get_1stcond_objs(Store,Cond);
            return Objs.length;
        }

        // Multiple conds
        var Ids = await crud.intersect_cond(Store,Cond);
        return Ids.length;
    }

    /**
     * Count all
     * @return {Number}
     */
    static async count_all(Store){
        return await Store.count();
    }

    /**
     * Find one
     * @return {Object}
     */
    static async find_one(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        if (Keys.length==1){
            let Obj = await crud.get_1stcond_obj(Store,Cond);
            return Obj;
        }

        // Multiple conds
        var Ids = await crud.intersect_cond(Store,Cond);
        if (Ids.length==0) return null;

        return await Store.get(value_is(Ids[0]));
    }

    /**
     * Find many
     * @return {Object}
     */
    static async find_many(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        if (Keys.length==1){
            let Objs = await crud.get_1stcond_objs(Store,Cond);
            return Objs;
        }

        // Multiple conds
        var Ids = await crud.intersect_cond(Store,Cond);
        if (Ids==null || Ids.length==0) return [];

        var Objs          = [];
        var [Lock,unlock] = new_lock();

        for (let id of Ids){
            let Req = Store.self.get(value_is(id).self)

            Req.onerror = (Ev)=>{
                Objs.push(null);
                if (Objs.length == Ids.length) unlock();
            };
            Req.onsuccess = (Ev)=>{
                Objs.push(Ev.target.result);
                if (Objs.length == Ids.length) unlock();
            };
        }
        
        await Lock;
        return Objs;
    }

    /**
     * Find all
     * @return {Array}
     */
    static async find_all(Store){
        return await Store.get_all();
    }

    /**
     * Get value at prop path
     */ 
    static get_proppath_value(Obj,Path){
        var Tokens = Path.split(".");
        var Value  = Obj;

        for (let Token of Tokens)
            if (Value[Token] != null)
                Value = Value[Token];     
            else 
                return null;

        return Value;
    }

    /**
     * Check if object matches condition
     */ 
    static obj_matches_cond(Obj,Cond){
        for (let Key in Cond){
            let Value     = Cond[Key];
            let Obj_Value = crud.get_proppath_value(Obj,Key);

            if (Obj_Value==null)
                return false;
            if (obj2json(Obj_Value).indexOf(Value) == -1)
                return false;
        }

        return true;
    }

    /**
     * Filter (value contain, for exact match: use find, find_many)
     */ 
    static async filter(Store,Cond){
        var Objs = [];

        await Store.open_cursor(range_gte(0),"next",Cursor=>{
            var Value = Cursor.value;

            if (crud.obj_matches_cond(Value,Cond))
                Objs.push(Value);
        });

        return Objs;
    }

    /**
     * Update one
     * @return {Object}
     */
    static async update_one(Store,Cond,Changes){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        if (Keys.length==1){
            let Obj = await crud.get_1stcond_obj(Store,Cond);
            if (Obj==null) return null;

            Obj = {...Obj,...Changes};
            Store.put(Obj);
            return Obj;
        }

        // Multiple conds
        var Ids = await crud.intersect_cond(Store,Cond);
        if (Ids==null)     return null;
        if (Ids.length==0) return null;

        var Obj = await Store.get(value_is(Ids[0]));
        if (Obj==null) return null;

        Obj = {...Obj,...Changes};
        Store.put(Obj);
        return Obj;
    }

    /**
     * Update many
     * @return {Object}
     */
    static async update_many(Store,Cond,Changes){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        if (Keys.length==1){
            var Objs = await crud.get_1stcond_objs(Store,Cond);
            if (Objs==null)     return null;
            if (Objs.length==0) return [];
        }
        // Multiple conds
        else{        
            var Objs = await crud.intersect_cond_getobjs(Store,Cond);
            if (Objs==null)     return null;
            if (Objs.length==0) return [];
        }

        // Update
        let Updated_Objs  = [];
        let [Lock,unlock] = new_lock();

        for (let Obj of Objs){
            let Replacement = {...Obj,...Changes};
            let Req         = Store.self.put(Replacement);
            
            Req.onerror = (Ev)=>{
                loge("crud.update_many: Failed to update object:",Obj);
                Updated_Objs.push(null);
                if (Updated_Objs.length == Objs.length) unlock();
            };
            Req.onsuccess = (Ev)=>{
                Updated_Objs.push(Replacement);
                if (Updated_Objs.length == Objs.length) unlock();
            }
        }

        await Lock;
        return Updated_Objs;
    }

    /**
     * Upsert one
     * @return {Object}
     */
    static async upsert_one(Store,Cond,Changes){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        if (Keys.length==1){
            let Obj = await crud.get_1stcond_obj(Store,Cond);

            // Insert
            if (Obj==null){
                return await Store.add(Changes);
            };

            // Update
            Obj = {...Obj,...Changes};
            Store.put(Obj);
            return Obj;
        }

        // Multiple conds
        var Ids = await crud.intersect_cond(Store,Cond);
        if (Ids==null)     return null;
        if (Ids.length==0) return null;

        // Insert
        var Obj = await Store.get(value_is(Ids[0]));

        if (Obj==null){
            return await Store.add(Changes);
        };

        // Update
        Obj = {...Obj,...Changes};
        Store.put(Obj);
        return Obj;
    }

    /**
     * Remove one
     * @return {null}
     */
     static async remove_one(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        if (Keys.length==1){
            let Obj = await crud.get_1stcond_obj(Store,Cond);
            if (Obj==null) return null;
            return await Store.delete(value_is(Obj.id));
        }

        // Multiple conds
        var Ids = await crud.intersect_cond(Store,Cond);
        if (Ids==null)     return null;
        if (Ids.length==0) return null;

        return await Store.delete(value_is(Ids[0]));
    }

    /**
     * Remove many
     * @return {null}
     */
    static async remove_many(Store,Cond){
        var Keys = Object.keys(Cond);
        if (Keys.length==0) return null;

        // Single cond
        var Ids = [];

        if (Keys.length==1){
            let Objs = await crud.get_1stcond_objs(Store,Cond);
            if (Objs==null || Objs.length==0) return null;
            Ids = Objs.map(Obj=>Obj.id);
        }
        else{
            // Multiple conds
            var Ids = await crud.intersect_cond(Store,Cond);
            if (Ids==null || Ids.length==0) return null;
        }

        var [Lock,unlock] = new_lock();
        var count         = 0;

        for (let id of Ids){
            let Req = Store.self.delete(value_is(id).self);

            Req.onerror = (Ev)=>{
                count++;
                if (count == Ids.length) unlock();
            };
            Req.onsuccess = (Ev)=>{
                count++;
                if (count == Ids.length) unlock();
            };
        }
        
        await Lock;
        return null;
    }
}

export default crud;
// EOF