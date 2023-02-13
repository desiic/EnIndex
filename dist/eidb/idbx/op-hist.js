import eidb from"../../eidb.js";import idbx from"../idbx.js";var log=console.log,logw=console.warn,loge=console.error;const OP_HIST_STORE="op_hist",OP2FIELDNAME={create:"Recent_Creates",read:"Recent_Reads",update:"Recent_Updates",delete:"Recent_Deletes"};class op_hist{static max_history=1e3;static enabled=!1;static set_max_history(t){history.max_history=t}static get_op_hist_status(){return op_hist.enabled?"enabled":"disabled"}static async enable_op_hist(){op_hist.enabled=!0}static disable_op_hist(){op_hist.enabled=!1}static sort_docmetas_des(t){return t.sort(((t,e)=>t.Timestamp<e.Timestamp?1:t.Timestamp>e.Timestamp?-1:0)),t}static async#t(t,e,i){if(op_hist.enabled&&null!=i&&0!=i.length)if(-1!=["create","read","update","delete"].indexOf(e)){var s=await idbx.reopen();if(-1!=s.Object_Store_Names.indexOf("op_hist")){var a=s.transaction("op_hist",eidb.RW).store1(),o=await a.index("Store_Name").get(eidb.value_is(t));if(null==o){let o={Store_Name:t},_=[],p=new Date;for(let t of i)_.length<op_hist.max_history&&_.push({id:t,Timestamp:p});for(let t in OP2FIELDNAME)o[OP2FIELDNAME[t]]=[];return o[OP2FIELDNAME[e]]=_,await a.add(o),void s.close()}var _=o[OP2FIELDNAME[e]],p=_.map((t=>t.id)),r=new Date;for(let t of i)-1==p.indexOf(t)&&_.push({id:t,Timestamp:r});_=(_=op_hist.sort_docmetas_des(_)).slice(0,op_hist.max_history),o[OP2FIELDNAME[e]]=_,await a.put(o),s.close()}else s.close()}else loge("[EI] op_hist.update_op_hist: No such operation type:",e)}static update_op_hist_c(t,e){op_hist.#t(t,"create",e)}static update_op_hist_r(t,e){op_hist.#t(t,"read",e)}static update_op_hist_u(t,e){op_hist.#t(t,"update",e)}static update_op_hist_d(t,e){op_hist.#t(t,"delete",e)}static async get_op_hist(t,e){var i=await idbx.reopen(),s=i.transaction("op_hist",eidb.RO).store1(),a=await s.index("Store_Name").get(eidb.value_is(t));return i.close(),a}static async clear_op_hist(){var t=await idbx.reopen();if(t instanceof Error)loge("[EI] op_hist.clear_op_hist: Failed to open db, error:",t);else{var e=t.transaction("op_hist",eidb.RW).store1();await e.delete(eidb.range_gte(0)),t.close()}}static init(){}}export default op_hist;