import base from"../base.js";import database from"./database.js";import object_store from"./object-store.js";var log=console.log,logw=console.warn,loge=console.error,new_lock=base.new_lock;class transaction{self=null;constructor(t){this.self=t}SETS_AND_GETS;get Db(){return new database(this.self.db)}get Durability(){return this.self.durability}get Error(){return this.self.error}get Mode(){return this.self.mode}get Object_Store_Names(){return[...this.self.objectStoreNames]}EVENTS;set on_abort(t){this.self.onabort=t}set on_complete(t){this.self.oncomplete=t}set on_error(t){this.self.onerror=t}METHODS;abort(){try{this.self.abort()}catch(t){return loge("[EI] transaction.abort: Error:",t),t}}commit(){try{this.self.commit()}catch(t){return loge("[EI] transaction.commit: Error:",t),t}}object_store(t){try{var e=this.self.objectStore(t);return new object_store(e)}catch(t){return loge("[EI] transaction.object_store: Error:",t),t}}ADDITIONAL_METHODS;store1(){return this.object_store([...this.self.objectStoreNames][0])}}export default transaction;