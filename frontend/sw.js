// EnergyX Az — Service Worker (oflayn dəstək)
//
// Strategiya:
//  - Öz fayllarımız (HTML, JS, CSS): ƏVVƏLCƏ ŞƏBƏKƏ, keş yalnız oflayn ehtiyat kimi.
//    (Əvvəlki "stale-while-revalidate" yeniləmədən sonra köhnə JS/CSS-i yeni HTML ilə
//    qarışdırırdı — mobil menyu bu səbəbdən sınırdı.)
//  - Fayl URL-ləri versiyalıdır (?v=...), yeni HTML həmişə yeni faylları istəyir.
//  - CDN kitabxanaları (Chart.js, jsPDF) versiyalı URL-lərdir və dəyişmir: əvvəlcə keş.
//  - API sorğuları (backend) keşlənmir.
const VERSION = "2.3.0";
const CACHE = "energyx-" + VERSION;
const CORE = ["./", "index.html", "SpaceGrotesk-Bold.ttf", "icon.svg", "manifest.webmanifest",
  ...["css/pro.css", "css/layout.css", "js/engine.js", "js/pro.js", "js/extras.js", "js/ux.js"].map((f) => f + "?v=" + VERSION)];
const CDN = "https://cdnjs.cloudflare.com/";

self.addEventListener("install", (e) => {
  // cache: "reload" — brauzerin HTTP keşindəki köhnə nüsxələr götürülməsin
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
  if (req.url.startsWith(CDN)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })));
  }
});
