// Elements
var $ = function (id) {
  return document.getElementById(id);
};

// ui: { timer, cash, lives, wave, fps, nav, action, bind, page, panel }
window.ui = {
  timer: $("control-timer"),
  cash:  $("control-cash"),
  lives: $("control-lives"),
  wave:  $("control-wave"),
  fps:   $("control-fps"),


  // for performance.now() test only
  perf1:  $("control-perf1"),


  nav: ["start"],
  action: {},

  bind: function (evt, elems, fn) {
    Array.prototype.slice.call(elems).forEach(function (elem) {
      elem.addEventListener(evt, fn, false);
    });
  },

  page: function (name) {
    if (name) {
      ui.nav.unshift(name);
    } else {
      ui.page(ui.nav[1]);
      return;
    }

    Array.prototype.slice.call($("pages").children).forEach(function (elem) {
      if (elem.id !== "pages-overlay") {
        elem.style.display = "none";
      }
    });

    $("pages-" + name).style.display = "block";

//  _gaq.push(["_trackPageview", "/" + name]);
  },
  panel: function (name) {
    Array.prototype.slice.call($("control-left").children).forEach(function (elem) {
      elem.style.display = "none";
    });

    $("control-" + name).style.display = "block";
  },
  fast: $("control-fast")
};
