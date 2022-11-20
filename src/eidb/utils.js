/**
 * @module eidb/utils
 */ 

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
        if (Obj.constructor != Object) return "";

        // Iterate thru' fields
        var Str = "";

        for (let Field in Obj){
            let Value = Obj[Field];
            if (Value==null) continue;

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
}

export default utils;
// EOF