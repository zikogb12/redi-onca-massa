/* Fonctionnement hors réseau : les fichiers de l'application sont gardés sur le téléphone.
   Changer VERSION à chaque mise à jour de l'application pour forcer le rafraîchissement. */
const VERSION = "redi-massa-v5-3";
const FILES = ["./", "./index.html", "./config.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // le serveur Google n'est jamais mis en cache
  // Réseau d'abord (pour recevoir les mises à jour), téléphone en secours
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
