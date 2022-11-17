/**
 * @module eidb/utils
 */ 

/**
 * Utility class
 */
class utils {

    /**
     * Intersect arrays (used for intersecting id arrays in CRUD, FTS)
     */ 
    static intersect_arrs(Arrays){
        // Ref: https://stackoverflow.com/a/51874332/5581893
        // Note: Id_Arrays.length MUST BE >0
        return Arrays.reduce((t,a) => t.filter(b => a.includes(b)));
    }
}

export default utils;
// EOF