/* Formular-Anbindung an die Firmensoftware.
   Endpunkt: POST https://software-wippermann.de/api/inhouse-anfrage
   CORS-fähig, ohne Token. Legt ein Ticket (INH-XXXXXXXX) über org "ruben" an.
   Pflichtfelder der API: firma, email. Honeypot-Feld: website.
   Bis 25.08.2026 lief das fälschlich über org "bww" — persönliche Anfragen
   landeten damit in der Ticket-Warteschlange der Firma BWW. org "ruben"
   bildet auf org_ruben_wippermann ab (Software-repo/worker/public.ts). */
(function () {
  "use strict";
  var ENDPOINT = "https://software-wippermann.de/api/inhouse-anfrage";
  var ORG = "ruben"; // eigener Slug seit 25.08.2026, org_ruben_wippermann statt BWW

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

      // Felder der verschiedenen Formulare auf die API abbilden
      var firma = val(fd, "org") || val(fd, "firma") || val(fd, "name") || "Privatanfrage";
      var ansprechpartner = val(fd, "name") || val(fd, "ansprechpartner");
      var email = val(fd, "email");

      var extra = [];
      if (val(fd, "topic")) extra.push("Thema: " + val(fd, "topic"));
      if (val(fd, "date")) extra.push("Datum/Zeitraum: " + val(fd, "date"));
      if (val(fd, "place")) extra.push("Ort: " + val(fd, "place"));
      var nachricht = val(fd, "message");
      if (extra.length) nachricht = extra.join("\n") + (nachricht ? "\n\n" + nachricht : "");

      if (!email || email.indexOf("@") < 1) {
        setStatus(status, "Bitte eine gültige E-Mail-Adresse angeben.", "error");
        return;
      }
      if (!nachricht) {
        setStatus(status, "Bitte noch eine kurze Nachricht ergänzen.", "error");
        return;
      }

      var payload = {
        org: ORG,
        firma: firma,
        ansprechpartner: ansprechpartner,
        email: email,
        nachricht: nachricht,
        website: val(fd, "website") // Honeypot – bei echten Nutzern leer
      };

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Wird gesendet …"; }
      setStatus(status, "Anfrage wird gesendet …", "info");

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
        setStatus(status, "Vielen Dank! Ihre Anfrage ist eingegangen" + ticket + ". Ich melde mich zeitnah.", "ok");
      }).catch(function (err) {
        if (err && err.message === "rate") {
          setStatus(status, "Zu viele Anfragen in kurzer Zeit. Bitte in einer Stunde erneut versuchen oder direkt an kontakt@ruben-wippermann.de schreiben.", "error");
        } else {
          setStatus(status, "Senden hat gerade nicht geklappt. Bitte direkt an kontakt@ruben-wippermann.de schreiben.", "error");
        }
      }).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll("form.form");
    for (var i = 0; i < forms.length; i++) handle(forms[i]);
  });
})();
