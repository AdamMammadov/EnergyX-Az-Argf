// EnergyX Az — Service Worker (oflayn dəstək)
// Statik fayllar keşlənir; səhifə üçün "əvvəlcə şəbəkə", qalanı üçün stale-while-revalidate.
// API sorğuları (backend) keşlənmir.
const CACHE = "energyx-v5";
const CORE = ["./", "index.html", "css/pro.css", "css/layout.css", "js/engine.js", "js/pro.js", "js/extras.js", "js/ux.js", "SpaceGrotesk-Bold.ttf", "icon.svg", "manifest.webmanifest"];
const CDN = "https://cdnjs.cloudflare.com/";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !req.url.startsWith(CDN)) return;

  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put("index.html", copy));
      return res;
    }).catch(() => caches.match("index.html")));
    return;
  }
  // stale-while-revalidate: keşdən dərhal cavab, arxa planda yenilə
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
