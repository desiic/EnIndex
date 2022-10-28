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
    // Expand all sections in left sidebar
    var Togs = d$$("#sidebar .sidebar-section-title");
    
    for (let Tog of Togs)
        Tog.setAttribute("data-isopen","true");
}

window.addEventListener("load",mod_func);
// EOF