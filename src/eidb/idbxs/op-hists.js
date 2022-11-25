/**
 * @module eidb/idbxs/op_hists
 */ 
// WARNING TO CODE UPDATERS:
// DO NOT USE idbx.crud, idbxs.crud IN THIS FILE OR FTS MODULE, COZ crud.js 
// USES op_hist AND fts.js AND THAT'S INFINITE CIRCULAR FUNCTION CALLS. 
// USE MODULES IN idb.* INSTEAD.

// NOTE:
// OP HISTORY AND FTS RUN IN BACKGROUND, DON'T AWAIT,
// CALL `eidb.stay_idle` (or just `stay_idle`) TO DELAY FOR A WHILE 
// IF IN NEED OF OP HISTORY OR FTS RESULTS IMMEDIATELY.

// Modules
import idbxs from "../idbxs.js";

// Shorthands
const log  = console.log;
const logw = console.warn;
const loge = console.error;

/**
 * Operation history secure
 */ 
class op_hists {
    static max_history = 1000;
    static enabled     = false;

    /**
     * Change default max entries per op type in history
     */ 
    static set_max_history(max){
        if (idbxs.Skey==null) {
            loge("op_hists.set_max_history: Static key not set");
            return;
        }
    }

    /**
     * Get op hist status
     */ 
    static get_op_hist_status(){
        if (idbxs.Skey==null) {
            loge("op_hists.get_op_hist_status: Static key not set");
            return;
        }
    }

    /**
     * Enable op history
     */
    static async enable_op_hist(){
        if (idbxs.Skey==null) {
            loge("op_hists.enable_op_hist: Static key not set");
            return;
        }
    }

    /**
     * Disable history
     */ 
    static disable_op_hist(){
        if (idbxs.Skey==null) {
            loge("op_hists.disable_op_hist: Static key not set");
            return;
        }
    }

    /**
     * Sort a docmeta array descending, most recents first
     */ 
    static sort_docmetas_des(Docmetas){
        if (idbxs.Skey==null) {
            loge("op_hists.sort_docmetas_des: Static key not set");
            return;
        }
    }

    /**
     * Update op hist CRUD<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static async #update_op_hist(Store_Name, Op_Type, Ids){
        if (idbxs.Skey==null) {
            loge("op_hists.#update_op_hist: Static key not set");
            return;
        }
    }

    /**
     * Update op hist CRUD:C<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_c(Store_Name, Ids){
        if (idbxs.Skey==null) {
            loge("op_hists.update_op_hist_c: Static key not set");
            return;
        }
    }

    /**
     * Update op hist CRUD:R<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_r(Store_Name, Ids){
        if (idbxs.Skey==null) {
            loge("op_hists.update_op_hist_r: Static key not set");
            return;
        }
    }

    /**
     * Update op hist CRUD:U<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_u(Store_Name, Ids){
        if (idbxs.Skey==null) {
            loge("op_hists.update_op_hist_u: Static key not set");
            return;
        }
    }

    /**
     * Update op hist CRUD:D<br/>
     * NOTE: NOT TO AWAIT HISTORY|FTS METHODS, BE IN BACKGROUND
     */ 
    static update_op_hist_d(Store_Name, Ids){
        if (idbxs.Skey==null) {
            loge("op_hists.update_op_hist_d: Static key not set");
            return;
        }
    }

    /**
     * Get operation history entries
     */ 
    static async get_op_hist(Store_Name, max){
        if (idbxs.Skey==null) {
            loge("op_hists.get_op_hist: Static key not set");
            return;
        }
    }

    /**
     * Clear operation history, caller should await, to let user see result.
     */ 
    static async clear_op_hist(){
        if (idbxs.Skey==null) {
            loge("op_hists.clear_op_hist: Static key not set");
            return;
        }
    }
}

export default op_hists;
// EOF