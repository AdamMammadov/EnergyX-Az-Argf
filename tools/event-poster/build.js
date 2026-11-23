// poster.html -> PNG və JPG (2160 x 2700, qruplar və sosial şəbəkələr üçün).
// İstifadə: node tools/event-poster/build.js [çıxış qovluğu]
const fs = require("fs");
const path = require("path");
const PW = require(process.env.PW || "playwright");
const OUT = process.argv[2] || path.join(__dirname, "build");
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await PW.chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  await p.goto("file://" + path.join(__dirname, "poster.html"), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  const bad = await p.evaluate(() => [...document.fonts].filter((f) => f.status !== "loaded").length + [...document.images].filter((i) => !i.naturalWidth).length);
  if (bad) throw new Error("Şrift və ya şəkil yüklənmədi");
  await p.screenshot({ path: path.join(OUT, "energyx-tedbir-poster.png") });
  await p.screenshot({ path: path.join(OUT, "energyx-tedbir-poster.jpg"), type: "jpeg", quality: 90 });
  await b.close();
  for (const f of fs.readdirSync(OUT)) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + " KB");
})().catch((e) => { console.error(e.message || e); process.exit(1); });
