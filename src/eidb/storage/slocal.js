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
     * Get all keys
     */ 
    static keys(){
        return Object.keys(localStorage);
    }

    /**
     * Set object
     */ 
    static set(Key,Obj){
        try {
            var Json = utils.obj_to_json(Obj);
            localStorage[Key] = Json;
        }
        catch(Err){
            // loge("[EI] slocal.set: Error:",Err);
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
            // loge("[EI] slocal.get: Error:",Err);
            return null;            
        }
    }

    /**
     * Clear
     */ 
    static clear(Key){
        delete localStorage[Key];
    }
}

const thisclass = slocal;
export default thisclass;
// EOF