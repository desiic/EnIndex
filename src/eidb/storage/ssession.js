/**
 * @module eidb/storage/ssession
 */ 

// Modules
import utils from "../utils.js";

/**
 * sessionStorage manager
 */ 
class ssession {

    /**
     * Set object
     */ 
    static set(Key,Obj){
        var Json = utils.obj_to_json(Obj);
        sessionStorage[Key] = Json;
    }

    /**
     * Get object
     */ 
    static get(Key){
        var Json = sessionStorage[Key];
        return utils.json_to_obj_bd(Json);
    }
}

export default ssession;
// EOF