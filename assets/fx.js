/* Effekt-Ebene (FX) — ruben-wippermann.de. Vanilla-JS, keine externen Skripte.
   Läuft nur ohne prefers-reduced-motion. Ohne JS bleibt alles wie bisher. */
(function () {
  "use strict";
  var mm = window.matchMedia;
  if (!mm || mm("(prefers-reduced-motion: reduce)").matches) return;
  var fine = mm("(hover: hover) and (pointer: fine)").matches;
  var doc = document, root = doc.documentElement;
  var raf = window.requestAnimationFrame.bind(window);

  /* Lese-Fortschritt */
  var bar = doc.createElement("div");
  bar.className = "fx-progress";
  bar.setAttribute("aria-hidden", "true");
  doc.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      if (heroMedia && heroVisible) heroMedia.style.transform = "translate3d(0," + Math.round(window.scrollY * 0.16) + "px,0)";
      ticking = false;
    });
  }

  /* Hero */
  var hero = doc.querySelector(".hero--media");
  var heroMedia = null, heroVisible = false;
  if (hero) {
    hero.classList.add("fx-hero");
    heroMedia = hero.querySelector(".hero__media");
    var h1 = hero.querySelector("h1");
    if (h1 && !h1.querySelector(".fx-word")) {
      var text = h1.textContent;
      h1.setAttribute("aria-label", text.replace(/ /g, " "));
      h1.textContent = "";
      var n = 0;
      text.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { h1.appendChild(doc.createTextNode(" ")); return; }
        var word = doc.createElement("span");
        word.className = "fx-word";
        word.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(w, function (c) {
          var s = doc.createElement("span");
          s.className = "fx-ch";
          s.style.setProperty("--i", n++);
          s.textContent = c;
          word.appendChild(s);
        });
        h1.appendChild(word);
      });
    }
    var eyebrow = hero.querySelector(".hero__eyebrow");
    if (eyebrow && !hero.querySelector(".fx-ekg")) {
      var ns = "http://www.w3.org/2000/svg";
      var svg = doc.createElementNS(ns, "svg");
      svg.setAttribute("class", "fx-ekg");
      svg.setAttribute("viewBox", "0 0 220 36");
      svg.setAttribute("aria-hidden", "true");
      var p = doc.createElementNS(ns, "path");
      p.setAttribute("d", "M0 20 H62 L72 20 L80 6 L90 33 L99 2 L108 20 H132 L140 14 L148 20 H220");
      svg.appendChild(p);
      eyebrow.insertAdjacentElement("afterend", svg);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    } else heroVisible = true;

    if (fine) {
      var spot = doc.createElement("div");
      spot.className = "fx-spot";
      spot.setAttribute("aria-hidden", "true");
      hero.insertBefore(spot, hero.firstChild.nextSibling);
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        spot.style.setProperty("--sx", e.clientX - r.left + "px");
        spot.style.setProperty("--sy", e.clientY - r.top + "px");
        hero.classList.add("fx-hot");
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { hero.classList.remove("fx-hot"); });
    }
  }

  /* Kennzahlen: Zahlen zählen hoch, Texte erscheinen mit Spreiz-Effekt */
  var stats = doc.querySelectorAll(".stat__num");
  if (stats.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        sio.unobserve(e.target);
        var el = e.target, fin = el.getAttribute("data-fx-final");
        var target = parseInt(fin, 10);
        var t0 = null, dur = 1400;
        function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 4);
          el.textContent = String(Math.round(target * ease));
          if (k < 1) raf(step); else el.textContent = fin;
        }
        raf(step);
        setTimeout(function () { el.textContent = fin; }, dur + 400);
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) {
      var t = el.textContent.trim();
      if (/^\d+$/.test(t)) {
        el.setAttribute("data-fx-final", t);
        el.classList.add("fx-count");
        el.style.minWidth = el.getBoundingClientRect().width + "px";
        el.textContent = "0";
        sio.observe(el);
      } else {
        el.classList.add("fx-pop");
      }
    });
  }

  /* Karten: 3D-Neigung + Lichtreflex (nur Maus/Trackpad) */
  if (fine) {
    doc.querySelectorAll(".company, .offer-card, .card").forEach(function (card) {
      card.classList.add("fx-tilt");
      var glare = doc.createElement("span");
      glare.className = "fx-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);
      var pending = false, ev = null;
      card.addEventListener("pointermove", function (e) {
        ev = e;
        if (pending) return;
        pending = true;
        raf(function () {
          pending = false;
          var r = card.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
          card.style.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - y) * 9).toFixed(2) + "deg");
          card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
          card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
          card.classList.add("fx-tilt-on");
        });
      }, { passive: true });
      card.addEventListener("pointerleave", function () { card.classList.remove("fx-tilt-on"); });
    });

    /* Primäre Buttons: magnetisch */
    doc.querySelectorAll(".btn--primary, .hero__cta").forEach(function (b) {
      b.classList.add("fx-mag");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + "px");
        b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + "px");
      }, { passive: true });
      b.addEventListener("pointerleave", function () {
        b.style.setProperty("--bx", "0px");
        b.style.setProperty("--by", "0px");
      });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
})();
