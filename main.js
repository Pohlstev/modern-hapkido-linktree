/* Modern Hapkido · Linkseite
   Teilen-Knopf, Lichtkegel in den Linkfeldern, Glutfunken im German-Open-Block.
   Ohne JavaScript ist jeder Inhalt sichtbar; bei reduzierter Bewegung laufen keine Effekte. */
(function () {
  "use strict";

  /* Teilen: System-Dialog, sonst Link in die Zwischenablage */
  var teilen = document.querySelector(".lt-teilen");
  if (teilen && (navigator.share || navigator.clipboard)) {
    var text = teilen.querySelector(".lt-teilen__text");
    teilen.hidden = false;
    teilen.addEventListener("click", function () {
      var daten = { title: document.title, url: location.href };
      if (navigator.share) {
        navigator.share(daten).catch(function () {});
        return;
      }
      navigator.clipboard.writeText(daten.url).then(function () {
        text.textContent = "Kopiert";
        setTimeout(function () { text.textContent = "Teilen"; }, 2000);
      });
    });
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* Lichtkegel folgt dem Zeiger (nur bei feinem Zeiger) */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".lt-link").forEach(function (a) {
      a.addEventListener("pointermove", function (e) {
        var r = a.getBoundingClientRect();
        a.style.setProperty("--x", (e.clientX - r.left) + "px");
        a.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
    });
  }

  /* Glutfunken steigen auf (nur solange der Block sichtbar ist) */
  var go = document.querySelector("[data-glut]");
  if (!go) return;
  var cv = document.createElement("canvas");
  cv.className = "lt-glut";
  cv.setAttribute("aria-hidden", "true");
  go.insertBefore(cv, go.firstChild);

  var ctx = cv.getContext("2d"), funken = [], sichtbar = false, bild = 0, zuletzt = 0;
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var groesse = function () { cv.width = go.offsetWidth * dpr; cv.height = go.offsetHeight * dpr; };
  groesse();
  if ("ResizeObserver" in window) new ResizeObserver(groesse).observe(go);

  for (var f = 0; f < 36; f++) {
    funken.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6, v: 0.0008 + Math.random() * 0.002, d: Math.random() * 6.28, a: 0.25 + Math.random() * 0.6 });
  }

  var zeichnen = function (ms) {
    if (!sichtbar) { bild = 0; return; }
    var zeit = ms / 1000, schritt = zuletzt ? Math.min(3, (ms - zuletzt) / 16.7) : 1;
    zuletzt = ms;
    ctx.clearRect(0, 0, cv.width, cv.height);
    funken.forEach(function (p) {
      p.y -= p.v * schritt;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      var x = (p.x + Math.sin(zeit * 0.8 + p.d) * 0.01) * cv.width, y = p.y * cv.height;
      var flackern = p.a * (0.6 + 0.4 * Math.sin(zeit * 3 + p.d));
      ctx.beginPath();
      ctx.arc(x, y, p.r * dpr, 0, 6.283);
      ctx.fillStyle = "rgba(255," + (90 + Math.round(p.r * 40)) + ",40," + flackern.toFixed(2) + ")";
      ctx.shadowColor = "rgba(255,90,40,.9)";
      ctx.shadowBlur = 8 * dpr;
      ctx.fill();
    });
    bild = requestAnimationFrame(zeichnen);
  };

  new IntersectionObserver(function (e) {
    sichtbar = e[0].isIntersecting;
    if (sichtbar && !bild) { zuletzt = 0; bild = requestAnimationFrame(zeichnen); }
  }).observe(go);
})();
