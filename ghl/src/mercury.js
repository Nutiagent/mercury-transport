/*
 * Mercury Transport: vanilla runtime for the GHL (GoHighLevel) export.
 * It replaces the React behaviour of the Next.js site on pages that are pasted in as static HTML:
 * header and mobile menu, film hero, film chapters and the service selector.
 * There are no dependencies. It runs once the DOM is ready and is safe to load on every page.
 */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var swap = function (el, off, on, state) {
    off.split(" ").forEach(function (c) { if (c) el.classList.toggle(c, !state); });
    on.split(" ").forEach(function (c) { if (c) el.classList.toggle(c, state); });
  };
  var play = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };

  /* ---------- Header: background on scroll + mobile menu ---------- */
  function header() {
    var h = document.querySelector("header.fixed");
    if (!h) return;
    var toggle = h.querySelector("[aria-controls=mobiilimenyy]");
    var menu = document.getElementById("mobiilimenyy");
    var bars = toggle ? toggle.querySelectorAll("span > span") : [];
    var open = false;
    var BASE = "border-b border-line bg-ink border-line/80 bg-ink/85 backdrop-blur-xl border-transparent bg-transparent";
    var paint = function () {
      var scrolled = window.scrollY > 24;
      BASE.split(" ").forEach(function (c) { h.classList.remove(c); });
      var cls = open ? "border-b border-line bg-ink" : scrolled ? "border-b border-line/80 bg-ink/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent";
      cls.split(" ").forEach(function (c) { h.classList.add(c); });
    };
    paint();
    window.addEventListener("scroll", paint, { passive: true });
    if (!toggle || !menu) return;

    var focusables = function () { return [toggle].concat([].slice.call(menu.querySelectorAll("a,button"))); };
    var onKey = function (e) {
      if (e.key === "Escape") { setOpen(false); toggle.focus(); }
      if (e.key === "Tab") {
        var all = focusables(), idx = all.indexOf(document.activeElement);
        if (e.shiftKey && idx <= 0) { e.preventDefault(); all[all.length - 1].focus(); }
        else if (!e.shiftKey && idx === all.length - 1) { e.preventDefault(); all[0].focus(); }
      }
    };
    var setOpen = function (v) {
      open = v;
      menu.hidden = !v;
      toggle.setAttribute("aria-expanded", String(v));
      toggle.setAttribute("aria-label", v ? "Sulge menüü" : "Ava menüü");
      if (bars[0]) swap(bars[0], "top-0", "top-1.5 rotate-45", v);
      if (bars[1]) swap(bars[1], "top-3", "top-1.5 -rotate-45", v);
      document.body.style.overflow = v ? "hidden" : "";
      if (v) { var f = menu.querySelector("a,button"); if (f) f.focus(); window.addEventListener("keydown", onKey); }
      else window.removeEventListener("keydown", onKey);
      paint();
    };
    toggle.addEventListener("click", function () { setOpen(!open); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
  }

  /* ---------- Film hero ---------- */
  var PAUSE = '<svg aria-hidden="true" viewBox="0 0 12 12" class="size-3" fill="currentColor"><rect x="2" y="1" width="3" height="10"></rect><rect x="7" y="1" width="3" height="10"></rect></svg>';
  var PLAY = '<svg aria-hidden="true" viewBox="0 0 12 12" class="size-3" fill="currentColor"><path d="M3 1l8 5-8 5z"></path></svg>';

  function filmHero() {
    var root = document.querySelector("[data-film]");
    if (!root) return;
    var v = root.querySelector("[data-film-video]");
    var toggles = root.querySelectorAll("[data-film-toggle]");
    var timeEl = root.querySelector("[data-film-time]");
    var list = root.querySelector("[data-film-duration]");
    var duration = list ? parseFloat(list.getAttribute("data-film-duration")) : 10;
    var scenes = [].slice.call(root.querySelectorAll("[data-scene-at]"));
    var userPaused = false, started = false;
    var tc = function (s) { return "00:" + String(Math.floor(s)).padStart(2, "0"); };

    var w = window.innerWidth, portrait = window.matchMedia("(orientation: portrait)").matches;
    v.src = w < 768 && portrait ? v.dataset.srcMobile : w * (window.devicePixelRatio || 1) > 1700 ? v.dataset.srcDesktop : v.dataset.srcTablet;

    var setPlaying = function (p) {
      toggles.forEach(function (b) { b.innerHTML = p ? PAUSE : PLAY; b.setAttribute("aria-label", p ? "Peata video" : "Mängi video"); });
    };
    setPlaying(false);
    v.addEventListener("playing", function () {
      if (!started) { started = true; swap(v, "opacity-0", "opacity-100", true); }
      setPlaying(true);
    });
    v.addEventListener("pause", function () { setPlaying(false); });
    v.addEventListener("timeupdate", function () {
      var t = v.currentTime;
      if (timeEl) timeEl.textContent = tc(t) + " / " + tc(duration);
      var idx = 0;
      scenes.forEach(function (li, k) { if (t >= parseFloat(li.dataset.sceneAt)) idx = k; });
      scenes.forEach(function (li, k) {
        var on = k === idx && started;
        swap(li, "text-bone/40", "text-bone", on);
        var num = li.querySelector("[data-scene-num]");
        if (num) num.classList.toggle("text-signal", on);
        var bar = li.querySelector("[data-scene-bar]");
        if (bar) {
          var start = parseFloat(li.dataset.sceneAt);
          var end = scenes[k + 1] ? parseFloat(scenes[k + 1].dataset.sceneAt) : duration;
          bar.style.width = on ? Math.min(100, ((t - start) / (end - start)) * 100) + "%" : "0";
        }
      });
    });
    toggles.forEach(function (b) {
      b.addEventListener("click", function () {
        if (v.paused) { userPaused = false; play(v); } else { userPaused = true; v.pause(); }
      });
    });

    if (reduced || saveData) { userPaused = true; v.preload = "metadata"; return; }
    play(v);
    new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) v.pause();
      else if (!userPaused) play(v);
    }).observe(v);
  }

  /* ---------- Film chapters ---------- */
  function chapters() {
    var root = document.querySelector("[data-chapters]");
    if (!root) return;
    var items = [].slice.call(root.querySelectorAll("li[data-index]"));
    var sticky = [].slice.call(root.querySelectorAll("[data-sticky-video]"));
    var texts = items.map(function (li) { return li.querySelector("[data-chapter-text]"); });
    var bars = [].slice.call(root.querySelectorAll("[data-bar]"));
    var capStep = root.querySelector("[data-cap-step]"), capLabel = root.querySelector("[data-cap-label]"), counter = root.querySelector("[data-counter]");
    var desktop = window.matchMedia("(min-width: 1024px)").matches;

    var setActive = function (i) {
      texts.forEach(function (t, k) { if (t) t.classList.toggle("lg:!opacity-100", k === i); });
      sticky.forEach(function (v, k) {
        var on = k === i;
        swap(v, "scale-[1.04] opacity-0", "scale-100 opacity-100", on);
        v.setAttribute("aria-hidden", String(!on));
        if (desktop) { if (on && !reduced) play(v); else v.pause(); }
      });
      bars.forEach(function (b, k) { swap(b, "bg-bone/25", "bg-signal", k === i); });
      if (sticky[i]) {
        if (capStep) capStep.textContent = sticky[i].dataset.step;
        if (capLabel) capLabel.textContent = sticky[i].dataset.label;
      }
      if (counter) counter.textContent = String(i + 1).padStart(2, "0");
    };
    setActive(0);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(Number(e.target.dataset.index)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    items.forEach(function (li) { io.observe(li); });

    if (!desktop) {
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !reduced) play(e.target); else e.target.pause(); });
      }, { threshold: 0.4 });
      root.querySelectorAll("[data-inline-video]").forEach(function (v) { io2.observe(v); });
    }
  }

  /* ---------- Service selector (tabs) ---------- */
  function tabs() {
    document.querySelectorAll("[role=tablist]").forEach(function (list) {
      var tabsEls = [].slice.call(list.querySelectorAll("[role=tab]"));
      var select = function (i, focus) {
        tabsEls.forEach(function (t, k) {
          var on = k === i;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          swap(t, "text-steel-2 hover:text-bone", "text-bone", on);
          var spans = t.children;
          if (spans[0]) swap(spans[0], "scale-y-0", "scale-y-100", on);
          if (spans[1]) swap(spans[1], "text-steel", "text-signal", on);
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        if (focus) tabsEls[i].focus();
      };
      tabsEls.forEach(function (t, i) {
        t.addEventListener("click", function () { select(i); });
        t.addEventListener("keydown", function (e) {
          var n = tabsEls.length, next = null;
          if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
          if (e.key === "Home") next = 0;
          if (e.key === "End") next = n - 1;
          if (next !== null) { e.preventDefault(); select(next, true); }
        });
      });
    });
  }

  function init() { header(); filmHero(); chapters(); tabs(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
