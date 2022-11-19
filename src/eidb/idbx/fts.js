/**
 * @module eidb/idbx/fts
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, opss.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// NOTE:
// OP HISTORY AND FTS RUN IN BACKGROUND, DON'T AWAIT,
// CALL `eidb.stay_idle` (or just `stay_idle`) TO DELAY FOR A WHILE 
// IF IN NEED OF OP HISTORY OR FTS RESULTS IMMEDIATELY.

/**
 * FTS manager class
 */
class fts {
    static enabled = false;
}

export default fts;
// EOF