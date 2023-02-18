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
     * Get all keys
     */ 
    static keys(){
        return Object.keys(sessionStorage);
    }

    /**
     * Set object
     */ 
    static set(Key,Obj){
        try{
            var Json = utils.obj_to_json(Obj);
            sessionStorage[Key] = Json;
        }
        catch(Err){
            // loge("[EI] ssession.set: Error:",Err);
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
            // loge("[EI] ssession.get: Error:",Err);
            return null;
        }
    }

    /**
     * Clear
     */ 
    static clear(Key){
        delete sessionStorage[Key];
    }
}

export default ssession;
// EOF