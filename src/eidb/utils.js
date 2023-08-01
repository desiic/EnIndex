/**
 * @module eidb/utils
 */ 

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

/**
 * Utility class
 */
class utils {

    /**
     * Intersect arrays (used for intersecting id arrays in CRUD)
     * TO-DO: THIS reduce=>filter=>includes METHOD IS SUPER NEAT BUT THE WORST
     *        CASE IS N^2, NOT URGENT BUT TO CHANGE TO N*LOG(N) IF
     *        ALL ARRAYS COULD BE ALREADY PREPARED AS TREES, 
     *        EG. KEY 'ABC' -> TREE PATH 'A/B/C' IN OBJECTS.
     */ 
    static intersect_arrs(Arrays){
        // Ref: https://stackoverflow.com/a/51874332/5581893
        // Note: Id_Arrays.length MUST BE >0
        return Arrays.reduce((t,a) => t.filter(b => a.includes(b)));
    }

    /**
     * Object to string of words, used by FTS<br/>
     * This returns a string with extra space at end
     */ 
    static #obj_to_valuestr(Obj){ // Recursion
        if (typeof Obj == "string") return Obj;
        if (Obj.constructor != Object) return "";

        // Iterate thru' fields
        var Str = "";

        for (let Field in Obj){
            let Value = Obj[Field];
            if (Value==null) continue;

            // Value is array
            if (Value instanceof Array){
                for (let V of Value)
                    Str += utils.obj_to_valuestr(V)+" ";
              
                continue;
            }
            // Value is not raw Object            
            if (Value.constructor != Object){
                if (typeof Value == "string")
                    Str += Value+" ";

                continue;
            }

            // Value is raw Object {...}
            Str += utils.obj_to_valuestr(Value);
        }        

        return Str;
    } 

    /**
     * Object to string of words, used by FTS<br/>
     * This returns a string WITHOUT extra space at end
     */ 
    static obj_to_valuestr(Obj){
        var Str = utils.#obj_to_valuestr(Obj);
        return Str.trim();
    }

    /**
     * Object (including binary values) to JSON string<br/>
     * WARN: binary values will be come empty {}
     */ 
    static obj_to_json(Obj){
        return JSON.stringify(Obj);
    }

    /**
     * JSON string to object without date revival
     */ 
    static json_to_obj_sd(Json){ // String date
        return JSON.parse(Json);
    }

    /**
     * JSON string to object with date revival
     */ 
    static json_to_obj_bd(Json){ // Binary date
        return JSON.parse(Json,(K,V)=>{
            if (V==null)
                return null;
            if (V.constructor != String)
                return V;

            // Check string format if is date
            var Reg = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            if (V.match(Reg) == null) return V;
            return new Date(V);
        });
    }

    /**
     * Set property value of object by path
     */ 
    static prop_set(Obj,Path,Value){
        var Tokens = Path.split(".");
        var Prop   = Obj;

        // Invalid
        if (Tokens.length == 0){
            loge("[EI] utils.prop_set: Invalid path");
            return;
        }

        // Direct field
        if (Tokens.length == 1){
            Obj[Path] = Value;
            return Obj;
        }

        // Inner field    
        for (let i=0; i<Tokens.length; i++){
            let Token = Tokens[i];

            if (i<Tokens.length-1){
                if (Prop[Token] == null) Prop[Token]={};
                Prop = Prop[Token];
            }
            else{
                Prop[Token] = Value; 
                return Obj;
            }
        }
    }

    /**
     * Get property value of object by path
     */ 
    static prop_get(Obj,Path){
        var Tokens = Path.split(".");
        var Prop   = Obj;

        // Invalid
        if (Tokens.length == 0){
            loge("[EI] utils.prop_get: Invalid path");
            return;
        }

        // Direct field
        if (Tokens.length == 1)
            return Obj[Path];

        // Inner field    
        for (let i=0; i<Tokens.length; i++){
            let Token = Tokens[i];
            if (Prop[Token] == null) return null;
            Prop = Prop[Token];
        }

        return Prop;
    }

    /**
     * Deep copy
     */ 
    static deepcopy(Obj){
        return utils.json_to_obj_bd( utils.obj_to_json(Obj) );
    }

    /**
     * Escape string for putting in regex<br/>
     * See: https://stackoverflow.com/a/6969486/5581893
     */
    static escape_for_regex(Str) {
        return Str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    } 

    /**
     * Init static stuff
     */ 
    static init(){
    }
}

export default utils;
// EOF