import eidb from"../eidb.js";import base from"./base.js";var log=console.log,logw=console.warn,loge=console.error,new_lock=base.new_lock;class idb{static async databases(){return await eidb.Factory.databases()}static async open(a,e){return window._Db_Name=a,await eidb.Factory.open(a,e)}static async delete_database(a){return await eidb.Factory.delete_database(a)}static init(){}}export default idb;