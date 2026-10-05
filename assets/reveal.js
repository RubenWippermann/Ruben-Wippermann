/* Bewegung mit Bedeutung: Abschnitte blenden beim Scrollen ein (200–300 ms),
   der Hero-Videoloop startet nur, wenn die Datei freigegeben ist (data-ready="1").
   Bei prefers-reduced-motion bleibt alles statisch (nur Poster, kein Einblenden).
   Ohne JavaScript ist alles sofort sichtbar. Keine externen Skripte. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var video = document.querySelector(".hero__video");
  if (video && !reduce && video.getAttribute("data-ready") === "1") {
    var src = video.getAttribute("data-src");
    if (src) {
      video.src = src;
      video.addEventListener("playing", function () { video.classList.add("is-playing"); });
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  if (reduce || !("IntersectionObserver" in window)) return;

  var sel = ".section__head, .split, .timeline__item, .company, .stat, .offer-card, .faq, .cta, .trust__row";
  var items = document.querySelectorAll(sel);
  if (!items.length) return;
  document.documentElement.classList.add("has-reveal");


  /* Zahlen-Hochzähler: nur reine Ganzzahlen, nach dem Einblenden, 600 ms, tabellarische Ziffern gegen Verschieben. */
  var zahlen = document.querySelectorAll(".stat__num");
  Array.prototype.forEach.call(zahlen, function (z) {
    var ziel = (z.textContent || "").trim();
    if (!/^\d{1,5}$/.test(ziel)) return;
    z.style.fontVariantNumeric = "tabular-nums";
    z.dataset.ziel = ziel;
  });


  function zaehleHoch(el) {
    var zahl = el.querySelectorAll ? el.querySelectorAll("[data-ziel]") : [];
    Array.prototype.forEach.call(zahl, function (z) {
      var ziel = parseInt(z.dataset.ziel, 10), t0 = null;
      if (z.dataset.gezaehlt) return;
      z.dataset.gezaehlt = "1";
      z.textContent = "0";
      function schritt(t) {
        if (t0 === null) t0 = t;
        var f = Math.min((t - t0) / 600, 1);
        z.textContent = String(Math.round(ziel * f));
        if (f < 1) requestAnimationFrame(schritt);
      }
      requestAnimationFrame(schritt);
    });
  }

  var fired = false;
  var io = new IntersectionObserver(function (entries) {
    fired = true;
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        zaehleHoch(e.target);
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  items.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", (i % 4) * 60 + "ms");
    io.observe(el);
  });
  /* Sicherheitsnetz: liefert der Browser keine Beobachtungen, sofort alles zeigen. */
  setTimeout(function () {
    if (fired) return;
    items.forEach(function (el) { el.classList.add("is-in"); zaehleHoch(el); });
  }, 2000);
})();
