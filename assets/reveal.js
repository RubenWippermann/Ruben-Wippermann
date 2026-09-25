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

  var fired = false;
  var io = new IntersectionObserver(function (entries) {
    fired = true;
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
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
    items.forEach(function (el) { el.classList.add("is-in"); });
  }, 2000);
})();
