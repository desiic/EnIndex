/**
 * @module eidb/storage/slocal
 */ 

// Modules
import utils from "../utils.js";

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

/**
 * localStorage manager
 */ 
class slocal {

    /**
     * Set object
     */ 
    static set(Key,Obj){
        try {
            var Json = utils.obj_to_json(Obj);
            localStorage[Key] = Json;
        }
        catch(Err){
            loge("slocal.set: Error:",Err);
            return null;
        }
    }

    /**
     * Get object
     */ 
    static get(Key){
        try {
            var Json = localStorage[Key];
            return utils.json_to_obj_bd(Json);
        }
        catch(Err){
            loge("slocal.get: Error:",Err);
            return null;            
        }
    }
}

export default slocal;
// EOF