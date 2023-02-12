import base from"../base.js";import index from"../idb/index.js";import transaction from"./transaction.js";import key_range from"./key-range.js";import cursor from"./cursor.js";import cursor_with_value from"./cursor-with-value.js";var log=console.log,logw=console.warn,loge=console.error,new_lock=base.new_lock;class object_store{self=null;constructor(e){this.self=e}SETS_AND_GETS;get auto_increment(){return this.self.autoIncrement}get Index_Names(){return[...this.self.indexNames]}get Key_Path(){return this.self.keyPath}get Name(){return this.self.name}get Transaction(){return new transaction(this.self.transaction)}METHODS;async add(e){try{var r=this.self.add(e),[t,s]=new_lock();return r.onerror=function(e){s(e.target.error)},r.onsuccess=function(e){s(e.target.result)},await t}catch(e){return loge("[EI] object_store.add: Error:",e),e}}async clear(){try{var e=this.self.clear(),[r,t]=new_lock();return e.onerror=function(e){t(e.target.error)},e.onsuccess=function(e){t(e.target.result)},await r}catch(e){return loge("[EI] object_store.clear: Error:",e),e}}async count(e){try{if(null==e)var r=this.self.count();else if(e.constructor==key_range)r=this.self.count(e.self);else r=this.self.count(e);var[t,s]=new_lock();return r.onerror=function(e){s(e.target.error)},r.onsuccess=function(e){s(e.target.result)},await t}catch(e){return loge("[EI] object_store.count: Error:",e),e}}create_index(e,r,t){try{if(t==n1)var s={unique:!1,multiEntry:!1};else if(t==n2)s={unique:!1,multiEntry:!0};else if(t==u1)s={unique:!0,multiEntry:!1};else if(t==u2)s={unique:!0,multiEntry:!0};return new index(this.self.createIndex(e,r,s))}catch(e){return loge("[EI] object_store.create_index: Error:",e),e}}async delete(e){try{if(e.constructor==key_range)var r=this.self.delete(e.self);else r=this.self.delete(e);var[t,s]=new_lock();return r.onerror=function(e){s(e.target.error)},r.onsuccess=function(e){s(e.target.result)},await t}catch(e){return loge("[EI] object_store.delete: Error:",e),e}}delete_index(e){try{this.self.deleteIndex(e)}catch(e){return loge("[EI] object_store.delete_index: Error:",e),e}}async get(e){try{if(null==e)var r=this.self.get();else if(e.constructor==key_range)r=this.self.get(e.self);else r=this.self.get(e);var[t,s]=new_lock();return r.onerror=function(e){s(e.target.error)},r.onsuccess=function(e){s(e.target.result)},await t}catch(e){return loge("[EI] object_store.get: Error:",e),e}}async get_all(e){try{if(null==e)var r=this.self.getAll();else if(e.constructor==key_range)r=this.self.getAll(e.self);else r=this.self.getAll(e);var[t,s]=new_lock();return r.onerror=function(e){s(e.target.error)},r.onsuccess=function(e){s(e.target.result)},await t}catch(e){return loge("[EI] object_store.get_all: Error:",e),e}}async get_all_keys(e,r){try{if(null==e)var t=this.self.getAllKeys();else if(e.constructor==key_range)t=this.self.getAllKeys(e.self,r);else t=this.self.getAllKeys(e,r);var[s,n]=new_lock();return t.onerror=function(e){n(e.target.error)},t.onsuccess=function(e){n(e.target.result)},await s}catch(e){return loge("[EI] object_store.get_all_keys: Error:",e),e}}async get_key(e){try{if(null==e)var r=this.self.getKey();else if(e.constructor==key_range)r=this.self.getKey(e.self);else r=this.self.getKey(e);var[t,s]=new_lock();return r.onerror=function(e){s(e.target.error)},r.onsuccess=function(e){s(e.target.result)},await t}catch(e){return loge("[EI] object_store.get_key: Error:",e),e}}index(e){try{return new index(this.self.index(e))}catch(e){return loge("[EI] object_store.index: Error:",e),e}}async open_cursor(e,r="next",t){try{if(null==e)var s=this.self.openCursor();else if(e.constructor==key_range)s=this.self.openCursor(e.self,r);else s=this.self.openCursor(e,r);var[n,o]=new_lock();return s.onerror=function(e){o(e.target.error)},s.onsuccess=async function(e){var r=e.target.result;if(null!=r){"stop"==await t(r)?o():r.continue()}else o(null)},await n}catch(e){return loge("[EI] object_store.open_cursor: Error:",e),e}}async open_key_cursor(e,r="next",t){try{if(null==e)var s=this.self.openKeyCursor();else if(e.constructor==key_range)s=this.self.openKeyCursor(e.self,r);else s=this.self.openKeyCursor(e,r);var[n,o]=new_lock();return s.onerror=function(e){o(e.target.error)},s.onsuccess=async function(e){var r=e.target.result;if(null!=r){"stop"==await t(r)?o():r.continue()}else o(null)},await n}catch(e){return loge("[EI] object_store.open_key_cursor: Error:",e),e}}async put(e,r,t=!0,s){try{if(null==r)var n=this.self.put(e);else if(r.constructor==key_range)n=this.self.put(e,r.self);else{log(e,r);n=this.self.put(e,r)}var[o,l]=new_lock();return n.onerror=function(e){0==t&&s(e.target.error),l(e.target.error)},n.onsuccess=function(e){0==t&&s(e.target.result),l(e.target.result)},t?await o:void 0}catch(e){return loge("[EI] object_store.put: Error:",e),e}}}export default object_store;