/* Mitlaufende CTA-Leiste (nur mobil, per CSS eingeblendet).
   Ein Tipp bis zur Anfrage. Blendet sich aus, wo es keinen Sinn ergibt:
   auf Kontakt-/Rechtsseiten und auf Seiten, die bereits ein Formular zeigen. */
(function () {
  "use strict";
  var p = location.pathname;
  if (/(kontakt|impressum|datenschutz|agb)\.html/.test(p)) return;
  if (document.querySelector("form.form")) return;

  function init() {
    if (document.querySelector(".cta-bar")) return;
    var bar = document.createElement("div");
    bar.className = "cta-bar";
    bar.innerHTML =
      '<span class="cta-bar__txt">Kurs, Sanitätsdienst oder Beratung?</span>' +
      '<a class="cta-bar__btn" href="angebote.html">Angebot anfragen</a>';
    document.body.appendChild(bar);
    document.body.classList.add("has-cta-bar");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
