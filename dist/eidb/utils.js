const log=console.log,logw=console.warn,loge=console.error;class utils{static intersect_arrs(t){return t.reduce(((t,r)=>t.filter((t=>r.includes(t)))))}static#t(t){if(t.constructor!=Object)return"";var r="";for(let e in t){let l=t[e];null!=l&&(l.constructor==Object?r+=utils.obj_to_valuestr(l):"string"==typeof l&&(r+=l+" "))}return r}static obj_to_valuestr(t){return utils.#t(t).trim()}static obj_to_json(t){return JSON.stringify(t)}static json_to_obj_sd(t){return JSON.parse(t)}static json_to_obj_bd(t){return JSON.parse(t,((t,r)=>{if(r.constructor!=String)return r;return null==r.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)?r:new Date(r)}))}static prop_set(t,r,e){var l=r.split("."),o=t;if(0!=l.length){if(1==l.length)return t[r]=e,t;for(let r=0;r<l.length;r++){let n=l[r];if(!(r<l.length-1))return o[n]=e,t;null==o[n]&&(o[n]={}),o=o[n]}}else loge("[EI] utils.prop_set: Invalid path")}static prop_get(t,r){var e=r.split("."),l=t;if(0!=e.length){if(1==e.length)return t[r];for(let t=0;t<e.length;t++){let r=e[t];if(null==l[r])return null;l=l[r]}return l}loge("[EI] utils.prop_get: Invalid path")}static deepcopy(t){return utils.json_to_obj_bd(utils.obj_to_json(t))}static escape_for_regex(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}static init(){}}export default utils;