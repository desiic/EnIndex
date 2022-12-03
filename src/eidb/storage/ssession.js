/**
 * @module eidb/storage/ssession
 */ 

// Modules
import utils from "../utils.js";

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

/**
 * sessionStorage manager
 */ 
class ssession {

    /**
     * Set object
     */ 
    static set(Key,Obj){
        try{
            var Json = utils.obj_to_json(Obj);
            sessionStorage[Key] = Json;
        }
        catch(Err){
            // loge("ssession.set: Error:",Err);
            return null;
        }
    }

    /**
     * Get object
     */ 
    static get(Key){
        try{
            var Json = sessionStorage[Key];
            return utils.json_to_obj_bd(Json);
        }
        catch(Err){
            // loge("ssession.get: Error:",Err);
            return null;
        }
    }
}

export default ssession;
// EOF