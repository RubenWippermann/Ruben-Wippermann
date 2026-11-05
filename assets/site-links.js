/* Zentrale Linkziele der Online-Widerrufsfunktion (Footer, § 356a BGB).
   Wechsel eines Ziels = eine Zeile hier; ohne JavaScript gilt dasselbe Ziel direkt im Link. */
(function () {
  "use strict";
  var ZIELE = {
    ruben: "https://software-wippermann.de/widerruf?org=ruben-wippermann#vertrag-widerrufen",
    bww: "https://software-wippermann.de/widerruf?org=bww#vertrag-widerrufen"
  };
  var links = document.querySelectorAll("a[data-widerruf-online]");
  for (var i = 0; i < links.length; i++) {
    var z = ZIELE[links[i].getAttribute("data-widerruf-online")];
    if (z) links[i].setAttribute("href", z);
  }
})();
