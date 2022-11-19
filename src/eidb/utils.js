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

    /**
     * Intersect 2 id trees
     */ 
    static intersect_2idtrees(Tree1,Tree2){
        ???
    }

    /**
     * Intersect a list of id trees
     */ 
    static intersect_idtrees(Trees){
        // Sample tree:
        // Id_Tree: { // Navigate until value==1, not object, 1 is shorter than 'true'
        //     1: {
        //         1:1, // id == 11
        //         6:1  // id == 16
        //     }
        //     5:...
        // }
        if (Trees==null || Trees.length==0) return [];
        if (Trees.length==1)                return Trees[0];

        // Start intersecting
        var Inter = Trees[0]; // Intersection

        for (let i=1; i<Trees.length; i++)
            Inter = utils.intersect_2idtrees(Inter,Trees[i]);

        return Inter;
    }
}

export default utils;
// EOF