/* Zentrales Linkziel fuer die Widerrufsfunktion im Footer.
   Der Wechsel auf die Online-Widerrufsfunktion der Software ist nur diese eine Zeile. */
(function () {
  "use strict";
  var WIDERRUF_ZIEL = "widerruf.html";
  var links = document.querySelectorAll("a[data-widerruf]");
  for (var i = 0; i < links.length; i++) links[i].setAttribute("href", WIDERRUF_ZIEL);
})();
