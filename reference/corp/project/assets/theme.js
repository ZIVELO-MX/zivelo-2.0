/* ZIVELO — light/dark theme toggle (default dark per site.config) */
(function () {
  "use strict";
  var KEY = "zivelo-theme";
  function apply(t) {
    t = (t === "light") ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll(".theme-toggle").forEach(function (b) {
      b.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
      b.setAttribute("aria-label", t === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    });
    try { localStorage.setItem(KEY, t); } catch (e) {}
  }
  window.__setTheme = apply;
  function cur() { return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function init() {
    var stored = "dark";
    try { stored = localStorage.getItem(KEY) || "dark"; } catch (e) {}
    apply(stored);
    document.querySelectorAll(".theme-toggle").forEach(function (b) {
      b.addEventListener("click", function () { apply(cur() === "dark" ? "light" : "dark"); });
    });
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
