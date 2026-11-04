/* Sanftes Scrollen (Lenis, lokal gebündelt). Nur Desktop mit Maus; nativ bei Touch, reduzierter Bewegung, Datensparmodus. Ohne JS bleibt alles nativ. */
(function () {
  "use strict";
  var mm = window.matchMedia;
  if (!mm || !window.Lenis) return;
  if (mm("(prefers-reduced-motion: reduce)").matches) return;
  if (!mm("(hover: hover) and (pointer: fine)").matches) return;
  var cx = navigator.connection;
  if (cx && (cx.saveData || /(^|-)2g$/.test(cx.effectiveType || ""))) return;
  var lenis = new window.Lenis({ lerp: 0.12, anchors: true });
  function frame(t) { lenis.raf(t); window.requestAnimationFrame(frame); }
  window.requestAnimationFrame(frame);
})();
