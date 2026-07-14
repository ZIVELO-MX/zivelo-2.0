/* ZIVELO — bilingual runtime (es-MX default, en optional) */
(function () {
  "use strict";
  var KEY = "zivelo-lang";
  function apply(lang) {
    lang = (lang === "en") ? "en" : "es";
    document.documentElement.lang = (lang === "en") ? "en" : "es-MX";
    document.querySelectorAll(".i18n[data-en]").forEach(function (el) {
      if (el.dataset.es === undefined) el.dataset.es = el.innerHTML;
      el.innerHTML = (lang === "en") ? el.dataset.en : el.dataset.es;
    });
    document.querySelectorAll("[data-en-ph]").forEach(function (el) {
      if (el.dataset.esPh === undefined) el.dataset.esPh = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", (lang === "en") ? el.dataset.enPh : el.dataset.esPh);
    });
    var titleEl = document.querySelector("title[data-en]");
    if (titleEl) {
      if (!titleEl.dataset.es) titleEl.dataset.es = titleEl.textContent;
      document.title = (lang === "en") ? titleEl.dataset.en : titleEl.dataset.es;
    }
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  window.__setLang = apply;
  function init() {
    var stored = "es";
    try { stored = localStorage.getItem(KEY) || "es"; } catch (e) {}
    apply(stored);
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.addEventListener("click", function () { apply(b.dataset.lang); });
    });
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
