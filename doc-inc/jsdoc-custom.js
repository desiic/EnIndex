// Shortcuts
var log = console.log;

// Select element
function d$(Selector){
    return document.querySelector(Selector);
}

// Select elements
function d$$(Selector){
    return [...document.querySelectorAll(Selector)];
}

// Mod func
function mod_func(){
    var Togs = d$$(".sidebar-section-title");
    log(Togs)
}

window.addEventListener("load",mod_func);
// EOF