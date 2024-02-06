/**
 * @module eidb/idb/version_change_event
 */

function $_____CLASS_____(){}

/**
 * IDBVersionChangeEvent wraper class
 */
class version_change_event {
    self = null;

    /**
     * Constructor
     */
    constructor(Idb_Version_Change_Event){
        this.self = Idb_Version_Change_Event;
    }
    
    #_____SETS_AND_GETS_____(){}

    /**
     * Get newVersion
     */
    get new_version(){
        return this.self.newVersion;
    }

    /**
     * Get oldVersion
     */ 
    get old_version(){
        return this.self.oldVersion;
    }
}

export default version_change_event;
// EOF