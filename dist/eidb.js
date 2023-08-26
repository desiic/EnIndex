import base from"./eidb/base.js";import idb from"./eidb/idb.js";import idbx from"./eidb/idbx.js";import idbxs from"./eidb/idbxs.js";import factory from"./eidb/idb/factory.js";import key_range from"./eidb/idb/key-range.js";import wcrypto from"./eidb/wcrypto.js";import utils from"./eidb/utils.js";import slocal from"./eidb/storage/slocal.js";import ssession from"./eidb/storage/ssession.js";var log=console.log,logw=console.warn,loge=console.error;class eidb{SUB_NAMESPACES;static idb;static idbx;static idbxs;static sec;static wcrypto;static utils;LITERALS;static n1=1;static n2=2;static u1=3;static u2=4;CONSTANTS;static RO="readonly";static RW="readwrite";PROPERTIES;static Factory;METHODS;static databases;static open;static delete_database;static open_av;static reopen;static num_db_cons;static set_db;static get_prop;static do_op;static del_obj_store;static insert_one;static insert_many;static exists;static count;static count_all;static find_one;static find_many;static find_all;static filter;static update_one;static update_many;static upsert_one;static remove_one;static remove_many;static remove_all;static set_max_history;static get_op_hist_status;static enable_op_hist;static disable_op_hist;static get_op_hist;static clear_op_hist;static enable_fts;static disable_fts;static find_many_by_terms;static s_open_av;static s_insert_one;static s_insert_many;static s_exists;static s_count;static s_count_all;static s_find_one;static s_find_many;static s_find_all;static s_filter;static s_update_one;static s_update_many;static s_upsert_one;static s_remove_one;static s_remove_many;static s_set_max_history;static s_get_op_hist_status;static s_enable_op_hist;static s_disable_op_hist;static s_get_op_hist;static s_clear_op_hist;static s_enable_fts;static s_disable_fts;static s_find_many_by_terms;METHODS(){}static init_essential_globals(e){e&&(window.n1=eidb.n1),e&&(window.n2=eidb.n2),e&&(window.u1=eidb.u1),e&&(window.u2=eidb.u2),eidb._secure=!0,e&&(window._secure=!0),eidb._stop="stop",e&&(window._stop="stop");const i=eidb.RO;e&&(window.RO=i);const s=eidb.RW;e&&(window.RW=s);eidb.WITH_LEFT=false,e&&(window.WITH_LEFT=false);eidb.WITH_RIGHT=false,e&&(window.WITH_RIGHT=false);eidb.NO_LEFT=true,e&&(window.NO_LEFT=true);eidb.NO_RIGHT=true,e&&(window.NO_RIGHT=true);const t=e=>new key_range(IDBKeyRange.lowerBound(e));eidb.range_gte=t,e&&(window.range_gte=t);const d=e=>new key_range(IDBKeyRange.lowerBound(e,!0));eidb.range_gt=d,e&&(window.range_gt=d);const _=e=>new key_range(IDBKeyRange.upperBound(e));eidb.range_lte=_,e&&(window.range_lte=_);const o=e=>new key_range(IDBKeyRange.upperBound(e,!0));eidb.range_lt=o,e&&(window.range_lt=o);const n=(e,i,s,t)=>new key_range(IDBKeyRange.bound(e,i,s,t));eidb.range_between=n,e&&(window.range_between=n);const a=e=>new key_range(IDBKeyRange.only(e));eidb.value_is=a,e&&(window.value_is=a);const b=base.new_lock;eidb.new_lock=b,e&&(window.new_lock=b);const c=base.stay_idle;eidb.stay_idle=c,e&&(window.stay_idle=c),e&&(window.eidb=eidb),eidb.slocal=slocal,eidb.ssession=ssession,e&&(window.slocal=slocal),e&&(window.ssession=ssession)}static init_more_globals(e){eidb._add="add",e&&(window._add="add");const i="clear";eidb._clear=i,e&&(window._clear=i);const s="count";eidb._count=s,e&&(window._count=s);const t="create_index";eidb._create_index=t,e&&(window._create_index=t);const d="delete";eidb._delete=d,e&&(window._delete=d);const _="delete_index";eidb._delete_index=_,e&&(window._delete_index=_);eidb._get="get",e&&(window._get="get");const o="get_all";eidb._get_all=o,e&&(window._get_all=o);const n="get_all_keys";eidb._get_all_keys=n,e&&(window._get_all_keys=n);const a="get_key";eidb._get_key=a,e&&(window._get_key=a);const b="index";eidb._index=b,e&&(window._index=b);const c="open_cursor";eidb._open_cursor=c,e&&(window._open_cursor=c);const r="open_key_cursor";eidb._open_key_cursor=r,e&&(window._open_key_cursor=r);eidb._put="put",e&&(window._put="put")}static init(e=!0){eidb.idb=idb,eidb.idbx=idbx,eidb.idbxs=idbxs,eidb.sec=idbxs,eidb.wcrypto=wcrypto,eidb.utils=utils,eidb.idb.init(),eidb.idbx.init(),eidb.idbxs.init(),eidb.wcrypto.init(),eidb.utils.init(),thisclass.init_essential_globals(e),thisclass.init_more_globals(e),eidb.Factory=new factory(window.indexedDB),eidb.databases=idb.databases,eidb.open=idb.open,eidb.delete_database=idb.delete_database,eidb.open_av=idbx.open_av,eidb.reopen=idbx.reopen,eidb.num_db_cons=idbx.num_db_cons,eidb.set_db=idbx.set_db,eidb.get_prop=idbx.get_prop,eidb.do_op=idbx.do_op,eidb.del_obj_store=idbx.del_obj_store,eidb.insert_one=idbx.crud.insert_one,eidb.insert_many=idbx.crud.insert_many,eidb.exists=idbx.crud.exists,eidb.count=idbx.crud.count,eidb.count_all=idbx.crud.count_all,eidb.find_one=idbx.crud.find_one,eidb.find_many=idbx.crud.find_many,eidb.find_all=idbx.crud.find_all,eidb.filter=idbx.crud.filter,eidb.update_one=idbx.crud.update_one,eidb.update_many=idbx.crud.update_many,eidb.upsert_one=idbx.crud.upsert_one,eidb.remove_one=idbx.crud.remove_one,eidb.remove_many=idbx.crud.remove_many,eidb.remove_all=idbx.crud.remove_all,eidb.set_max_history=idbx.op_hist.set_max_history,eidb.get_op_hist_status=idbx.op_hist.get_op_hist_status,eidb.enable_op_hist=idbx.op_hist.enable_op_hist,eidb.disable_op_hist=idbx.op_hist.disable_op_hist,eidb.get_op_hist=idbx.op_hist.get_op_hist,eidb.clear_op_hist=idbx.op_hist.clear_op_hist,eidb.enable_fts=idbx.fts.enable_fts,eidb.disable_fts=idbx.fts.disable_fts,eidb.find_many_by_terms=idbx.fts.find_many_by_terms,eidb.s_open_av=idbxs.open_av,eidb.s_insert_one=idbxs.cruds.insert_one,eidb.s_insert_many=idbxs.cruds.insert_many,eidb.s_exists=idbxs.cruds.exists,eidb.s_count=idbxs.cruds.count,eidb.s_count_all=idbxs.cruds.count_all,eidb.s_find_one=idbxs.cruds.find_one,eidb.s_find_many=idbxs.cruds.find_many,eidb.s_find_all=idbxs.cruds.find_all,eidb.s_filter=idbxs.cruds.filter,eidb.s_update_one=idbxs.cruds.update_one,eidb.s_update_many=idbxs.cruds.update_many,eidb.s_upsert_one=idbxs.cruds.upsert_one,eidb.s_remove_one=idbxs.cruds.remove_one,eidb.s_remove_many=idbxs.cruds.remove_many,eidb.s_set_max_history=idbxs.op_hists.set_max_history,eidb.s_get_op_hist_status=idbxs.op_hists.get_op_hist_status,eidb.s_enable_op_hist=idbxs.op_hists.enable_op_hist,eidb.s_disable_op_hist=idbxs.op_hists.disable_op_hist,eidb.s_get_op_hist=idbxs.op_hists.get_op_hist,eidb.s_clear_op_hist=idbxs.op_hists.clear_op_hist,eidb.s_enable_fts=idbxs.ftss.enable_fts,eidb.s_disable_fts=idbxs.ftss.disable_fts,eidb.s_find_many_by_terms=idbxs.ftss.find_many_by_terms}}var L=window.location;log("[EI] EnIndex loaded"),log("     In web page:",`${L.protocol}//${L.host}${L.pathname}`),log("     Imported as:",import.meta.url);const thisclass=eidb;export default thisclass;