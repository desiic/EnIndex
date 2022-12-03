/**
 * @module eidb/storage/slocal
 */ 

// Modules
import utils from "../utils.js";

/**
 * localStorage manager
 */ 
class slocal {

    /**
     * Set object
     */ 
    static set(Key,Obj){
        var Json = utils.obj_to_json(Obj);
        localStorage[Key] = Json;
    }

    /**
     * Get object
     */ 
    static get(Key){
        var Json = localStorage[Key];
        return utils.json_to_obj_bd(Json);
    }
}

export default slocal;
// EOF