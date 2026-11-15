/* Spamschutz ohne Drittskript: Zeit-Token der Firmensoftware (fz_token) und Koederfeld (hp_zusatz).
   Token beim Laden holen und mitsenden; bei aktiv:false oder Fehler bleibt das Feld leer, das Formular
   sendet normal (echte Nutzer werden nie blockiert). Token gilt hoechstens 2 Stunden, Neuladen nach 90 Minuten. */
(function () {
  "use strict";
  var URL_ZEIT = "https://software-wippermann.de/api/formular-zeit";
  var forms = [];

  function feld(form) {
    var f = form.querySelector('input[name="fz_token"]');
    if (!f) {
      f = document.createElement("input");
      f.type = "hidden";
      f.name = "fz_token";
      f.value = "";
      form.appendChild(f);
    }
    return f;
  }

  function laden(form) {
    var f = feld(form);
    if (!window.fetch) return Promise.resolve();
    return fetch(URL_ZEIT, { credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) { f.value = d && d.token ? String(d.token) : ""; })
      .catch(function () { f.value = ""; });
  }

  window.RWSpam = { neu: laden };

  document.addEventListener("DOMContentLoaded", function () {
    var list = document.querySelectorAll("form.form");
    for (var i = 0; i < list.length; i++) { forms.push(list[i]); laden(list[i]); }
    if (forms.length) {
      setInterval(function () { for (var j = 0; j < forms.length; j++) laden(forms[j]); }, 90 * 60 * 1000);
    }
  });
})();
