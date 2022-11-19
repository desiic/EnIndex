/**
 * @module eidb/utils
 */ 

/**
 * Utility class
 */
class utils {

    /**
     * Intersect arrays (used for intersecting id arrays in CRUD, FTS)
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
}

export default utils;
// EOF