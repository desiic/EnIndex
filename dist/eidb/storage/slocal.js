import utils from"../utils.js";class slocal{static set(t,o){var l=utils.obj_to_json(o);localStorage[t]=l}static get(t){var o=localStorage[t];return utils.json_to_obj_bd(o)}}export default slocal;