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
    // Move examples to bottom
    var Check_Id = d$("#classes");

    if (Check_Id!=null){
        // d$(".main-wrapper article >.container-overview").style.order = 1;
        d$(".main-wrapper article >.container-overview >h3").style.display = "none";
    }

    // Expand all sections in left sidebar
    var Togs = d$$("#sidebar .sidebar-section-title");
    
    for (let Tog of Togs)
        Tog.setAttribute("data-isopen","true");

    // Remove event
    window.removeEventListener("load", mod_func);
}

window.addEventListener("load", mod_func);
// EOF