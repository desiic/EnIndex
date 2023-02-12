import base from"../base.js";import transaction from"./transaction.js";import object_store from"./object-store.js";var log=console.log,logw=console.warn,loge=console.error,new_lock=base.new_lock;class database{self=null;constructor(e){this.self=e}SETS_AND_GETS;get Name(){return this.self.name}get Object_Store_Names(){return[...this.self.objectStoreNames]}get version(){return this.self.version}EVENTS;set on_close(e){this.self.onclose=e}set on_version_change(e){this.self.onversionchange=e}METHODS;close(){return window._num_db_cons-=1,this.self.close()}create_object_store(e){try{return new object_store(this.self.createObjectStore(e,{keyPath:"id",autoIncrement:!0}))}catch(e){return loge("[EI] database.create_object_store: Error:",e),e}}delete_object_store(e){try{return this.self.deleteObjectStore(e)}catch(e){return loge("[EI] database.delete_object_store: Error:",e),e}}transaction(e,t,r){try{return new transaction(this.self.transaction(e,t,r))}catch(e){return loge("[EI] database.transaction: Error:",e),e}}}export default database;