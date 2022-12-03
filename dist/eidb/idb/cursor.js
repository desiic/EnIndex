import base from"../base.js";var log=console.log,logw=console.warn,loge=console.error,new_lock=base.new_lock;class cursor{self=null;constructor(e){this.self=e}SETS_AND_GETS;get Direction(){return this.self.direction}get Key(){return this.self.key}get Primary_Key(){return this.self.primaryKey}get Request(){return new request(this.self.request)}get Source(){var e=this.self.source;return e instanceof IDBObjectStore?new object_store(e):new index(e)}METHODS;advance(e){try{this.self.advance(e)}catch(e){return loge("cursor.advance: Error:",e),e}}continue(e){try{this.self.continue(e)}catch(e){return loge("cursor.continue(K): Error:",e),e}}continue(e,r){try{this.self.continuePrimaryKey(e,r)}catch(e){return loge("cursor.continue(K,Pk): Error:",e),e}}async delete(){try{var e=new request(this.self.delete()),[r,t]=new_lock();return e.onerror=e=>{t(e.target.error)},e.onsuccess=e=>{t(e.target.result)},await r}catch(e){return loge("cursor.delete: Error:",e),e}}async update(e){try{var r=new request(this.self.update(e)),[t,o]=new_lock();return r.onerror=e=>{o(e.target.error)},r.onsuccess=e=>{o(e.target.result)},await t}catch(e){return loge("cursor.update: Error:",e),e}}}export default cursor;