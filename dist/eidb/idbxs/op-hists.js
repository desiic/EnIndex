import op_hist from"../idbx/op-hist.js";const log=console.log,logw=console.warn,loge=console.error;class op_hists{static set_max_history(t){op_hist.set_max_history(t)}static get_op_hist_status(){return op_hist.get_op_hist_status()}static async enable_op_hist(){op_hist.enable_op_hist()}static disable_op_hist(){op_hist.disable_op_hist()}static sort_docmetas_des(t){}static async#t(t,s,_){}static update_op_hist_c(t,s){t="#"+t,op_hist.update_op_hist_c(t,s)}static update_op_hist_r(t,s){t="#"+t,op_hist.update_op_hist_r(t,s)}static update_op_hist_u(t,s){t="#"+t,op_hist.update_op_hist_u(t,s)}static update_op_hist_d(t,s){t="#"+t,op_hist.update_op_hist_d(t,s)}static async get_op_hist(t,s){return t="#"+t,await op_hist.get_op_hist(t,s)}static async clear_op_hist(){await op_hist.clear_op_hist()}static init(){}}export default op_hists;