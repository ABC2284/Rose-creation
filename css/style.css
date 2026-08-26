// ============================================================
// SERVICE WORKER — Rose Créatrice
// Mete lokal (cache) fichye prensipal yo pou app la mache
// menm san koneksyon entènèt, e pou l ka enstale.
//
// ⚠️ Chak fwa ou modifye HTML/CSS/JS, MONTE nimewo CACHE_VERSION
// anba a (v2 → v3 → v4...) — sinon telefòn moun ki DEJA enstale
// app la ap kontinye wè ANSYEN vèsyon an pandan lontan.
// ============================================================
const CACHE_VERSION = "rc-v3";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/boot.js",
  "./js/booking.js",
  "./js/config.js",
  "./js/firebase-init.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fichye "kokiy" app la (HTML/CSS/JS/manifest) — sa yo chanje souvan
// pandan devlopman, kidonk nou toujou eseye REZO A DABÒ, e nou sèvi
// ak vèsyon anrejistre a SÈLMAN si pa gen entènèt.
function isCoreAsset(url) {
  return (
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith("manifest.json") ||
    url.pathname === "/" ||
    url.pathname.endsWith("/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Firestore / Firebase rekèt yo pa dwe pase nan cache — toujou rezo
  if (url.hostname.includes("firestore.googleapis.com") ||
      url.hostname.includes("gstatic.com")) {
    return;
  }

  if (url.origin === self.location.origin && isCoreAsset(url)) {
    // ---- REZO DABÒ (network-first) pou HTML/CSS/JS ----
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // ---- CACHE DABÒ (cache-first) pou imaj/videyo — yo pi lou,
  // pa chanje souvan, e sa fè app la vit e mache ofline ----
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
