// EnergyX Az: Service Worker (oflayn dəstək)
//
// Strategiya:
//  - Bütün fayllar saytın öz serverindədir (Chart.js və jsPDF də vendor/ qovluğunda).
//  - Əvvəlcə şəbəkə, keş yalnız oflayn ehtiyat kimi istifadə olunur.
//  - JS/CSS ünvanları versiyalıdır (?v=...), yeni HTML həmişə yeni faylları istəyir.
//  - API sorğuları (backend) keşlənmir.
const VERSION = "2.5.3";
const CACHE = "energyx-" + VERSION;
const CORE = ["./", "index.html", "SpaceGrotesk-Bold.ttf", "icon.svg", "manifest.webmanifest",
  "img/azgf-h-color.webp", "img/azgf-h-white.webp", "img/azgf-v-color.webp", "img/azgf-v-white.webp",
  "vendor/chart-4.5.1.min.js",
  "icons/icon-192.png", "icons/apple-touch-icon.png", "img/video-thumb.webp",
  ...["css/pro.css", "css/layout.css", "css/theme.css", "js/engine.js", "js/pro.js", "js/extras.js", "js/ux.js", "js/lab.js", "js/home.js"].map((f) => f + "?v=" + VERSION)];

self.addEventListener("install", (e) => {
  // cache: "reload" - brauzerin HTTP keşindəki köhnə nüsxələr götürülməsin
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function networkFirst(req, cacheKey) {
  return fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(cacheKey || req, copy)); }
    return res;
  }).catch(() => caches.match(cacheKey || req).then((hit) => hit || caches.match(req, { ignoreSearch: true })));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(networkFirst(req, req.mode === "navigate" ? "index.html" : null));
    return;
  }
});
