/* Terminanfrage-Formular auf ruben-wippermann.de.
   Endpunkt: POST https://software-wippermann.de/api/terminanfrage
   Pflichtfelder der API: org, name, telefon, wunsch_1. Honeypot-Feld: website.
   Weg ist fest "telefonisch" – online/präsent werden laut Migration 0375
   vom Büro noch nicht bedient. */
(function () {
  "use strict";
  var ENDPOINT = "https://software-wippermann.de/api/terminanfrage";

  function val(fd, name) {
    var v = fd.get(name);
    return v == null ? "" : String(v).trim();
  }

  function setStatus(el, text, kind) {
    el.textContent = text;
    el.style.color = kind === "error" ? "#b3261e"
      : kind === "ok" ? "#1f7a34"
      : "var(--muted)";
  }

  function handle(form) {
    var status = document.createElement("p");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.margin = "10px 0 0";
    status.style.fontSize = ".9rem";
    form.appendChild(status);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof form.reportValidity === "function" && !form.reportValidity()) return;
      var fd = new FormData(form);

      var payload = {
        org: val(fd, "org") || "ruben",
        weg: val(fd, "weg") || "telefonisch",
        name: val(fd, "name"),
        telefon: val(fd, "telefon"),
        wunsch_1: val(fd, "wunsch_1"),
        wunsch_2: val(fd, "wunsch_2"),
        wunsch_3: val(fd, "wunsch_3"),
        anlass: val(fd, "anlass"),
        website: val(fd, "website") // Honeypot – bei echten Nutzern leer
      };

      if (!payload.name || !payload.telefon || !payload.wunsch_1) {
        setStatus(status, "Bitte Name, Telefon und mindestens einen Wunschtermin angeben.", "error");
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Wird gesendet …"; }
      setStatus(status, "Terminanfrage wird gesendet …", "info");

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.status === 429) {
          throw new Error("rate");
        }
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) throw new Error("fail");
          return data;
        });
      }).then(function (data) {
        form.reset();
        var ticket = data.ticket_id ? " (Vorgang " + data.ticket_id + ")" : "";
        setStatus(status, "Vielen Dank! Ihre Terminanfrage ist eingegangen" + ticket + ". Ich rufe zeitnah zurück." , "ok");
      }).catch(function (err) {
        if (err && err.message === "rate") {
          setStatus(status, "Zu viele Anfragen in kurzer Zeit. Bitte in einer Stunde erneut versuchen oder direkt anrufen.", "error");
        } else {
          setStatus(status, "Senden hat gerade nicht geklappt. Bitte direkt an kontakt@ruben-wippermann.de schreiben oder anrufen.", "error");
        }
      }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll("form.form--termin");
    for (var i = 0; i < forms.length; i++) handle(forms[i]);
  });
})();
