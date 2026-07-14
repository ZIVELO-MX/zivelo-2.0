/* ZIVELO — site interactions */
(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var drawer = document.querySelector(".mobile-nav");
  var closeBtn = document.querySelector(".mobile-nav__close");
  function setDrawer(open) {
    if (!drawer || !toggle) return;
    drawer.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { setDrawer(!drawer.classList.contains("is-open")); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setDrawer(false); });
  if (drawer) drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setDrawer(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up numbers ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var dur = 1100, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = dec ? val.toFixed(dec) : Math.round(val).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = dec ? target.toFixed(dec) : Math.round(target).toString();
    }
    requestAnimationFrame(step);
  }
  function runCountsIn(scope) {
    (scope || document).querySelectorAll("[data-count]").forEach(function (el) {
      if (el.getAttribute("data-done") === "1") return;
      el.setAttribute("data-done", "1");
      animateCount(el);
    });
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var panel = en.target;
          if (panel.classList.contains("is-active") || !panel.closest(".case-panel")) runCountsIn(panel);
          cio.unobserve(panel);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".case-panel.is-active, .hero-strip, .cs-results").forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Case study tabs ---------- */
  var tabs = document.querySelectorAll(".cases__tab");
  var panels = document.querySelectorAll(".case-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-case");
      tabs.forEach(function (t) { t.classList.toggle("is-active", t === tab); t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
      panels.forEach(function (p) {
        var on = p.getAttribute("data-case") === id;
        p.classList.toggle("is-active", on);
        if (on) {
          p.querySelectorAll("[data-count]").forEach(function (el) { el.removeAttribute("data-done"); });
          runCountsIn(p);
        }
      });
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.querySelector(".cform__form");
  if (form) {
    var success = document.querySelector(".cform__success");
    var formBody = document.querySelector(".cform__body");
    function setError(field, on) { field.classList.toggle("is-error", on); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[data-required]").forEach(function (input) {
        var field = input.closest(".field");
        var val = (input.value || "").trim();
        var bad = !val;
        if (input.type === "email" && val) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        setError(field, bad);
        if (bad) ok = false;
      });
      if (!ok) { var first = form.querySelector(".is-error input, .is-error select, .is-error textarea"); if (first) first.focus(); return; }
      if (formBody && success) { formBody.style.display = "none"; success.classList.add("show"); }
    });
    form.querySelectorAll("[data-required]").forEach(function (input) {
      input.addEventListener("input", function () { if (input.closest(".field").classList.contains("is-error")) setError(input.closest(".field"), false); });
    });
  }

  /* ---------- Active-section nav highlight ---------- */
  var navLinks = document.querySelectorAll(".nav__links a[data-sec]");
  var secMap = {};
  navLinks.forEach(function (a) { var s = document.getElementById(a.getAttribute("data-sec")); if (s) secMap[a.getAttribute("data-sec")] = a; });
  if ("IntersectionObserver" in window && navLinks.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = secMap[en.target.id];
        if (!a) return;
        if (en.isIntersecting) { navLinks.forEach(function (l) { l.style.color = ""; }); a.style.color = "var(--ink)"; }
      });
    }, { threshold: 0.5, rootMargin: "-30% 0px -55% 0px" });
    Object.keys(secMap).forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  }

  /* ---------- Active page highlight ---------- */
  var pageFile = decodeURIComponent((location.pathname.split("/").pop() || ""));
  document.querySelectorAll(".nav__links > a, .nav__dd > a").forEach(function (a) {
    var href = decodeURIComponent(a.getAttribute("href") || "").split("#")[0];
    if (href && pageFile && href === pageFile) { a.style.color = "var(--ink)"; a.style.fontWeight = "550"; }
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq__item");
      var ans = item.querySelector(".faq__a");
      var open = item.classList.contains("is-open");
      if (open) { ans.style.maxHeight = "0"; item.classList.remove("is-open"); }
      else { ans.style.maxHeight = ans.scrollHeight + "px"; item.classList.add("is-open"); }
    });
  });

  /* ---------- Year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     TWEAKS — hero variant, accent, heading font
     Applied to :root / .hero-wrap. Defaults set inline already.
     ============================================================ */
  window.__applyTweaks = function (t) {
    if (!t) return;
    var root = document.documentElement;
    if (t.hero) {
      var hw = document.querySelector(".hero-wrap");
      if (hw) hw.setAttribute("data-hero", t.hero);
    }
  };
})();
