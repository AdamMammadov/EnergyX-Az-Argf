// rollup.html -> çap üçün PDF (850x2000 mm) və önizləmə şəkilləri.
// İstifadə: node tools/rollup/build.js [çıxış qovluğu] [--jpg150]
// Əvvəlcə ekran şəkilləri: node tools/rollup/shots.js tools/rollup/build
const fs = require("fs");
const path = require("path");
const PW = require(process.env.PW || "playwright");
const OUT = process.argv.slice(2).find((a) => !a.startsWith("--")) || path.join(__dirname, "build");
const MM = 96 / 25.4;
const W = Math.ceil(850 * MM), H = Math.ceil(2000 * MM);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const url = "file://" + path.join(__dirname, "rollup.html");
  const b = await PW.chromium.launch();
  async function page(scale) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    const fonts = await p.evaluate(() => [...document.fonts].filter((f) => f.status !== "loaded").map((f) => f.family + " " + f.weight));
    if (fonts.length) throw new Error("Şrift yüklənmədi: " + fonts.join(", "));
    const missing = await p.$$eval("img", (imgs) => imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")));
    if (missing.length) throw new Error("Şəkil tapılmadı: " + missing.join(", ") + " (əvvəlcə shots.js işə salın)");
    return { ctx, p };
  }
  let { ctx, p } = await page(1);
  await p.pdf({ path: path.join(OUT, "rollup-energyx-850x2000.pdf"), width: "850mm", height: "2000mm", printBackground: true, pageRanges: "1" });
  await ctx.close();
  ({ ctx, p } = await page(0.4));
  await p.screenshot({ path: path.join(OUT, "rollup-preview.jpg"), type: "jpeg", quality: 88 });
  await p.evaluate(() => document.body.classList.add("show-guides"));
  await p.screenshot({ path: path.join(OUT, "rollup-guides.jpg"), type: "jpeg", quality: 80 });
  await ctx.close();
  if (process.argv.includes("--jpg150")) {
    ({ ctx, p } = await page(150 / 96));
    const buf = await p.screenshot({ type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: 850 * MM, height: 2000 * MM } });
    // JFIF başlığına 150 dpi yazılır ki, çap proqramı ölçünü 850x2000 mm kimi görsün
    if (buf.toString("latin1", 6, 11) === "JFIF\0") { buf[13] = 1; buf.writeUInt16BE(150, 14); buf.writeUInt16BE(150, 16); }
    fs.writeFileSync(path.join(OUT, "rollup-energyx-850x2000-150dpi.jpg"), buf);
    await ctx.close();
  }
  await b.close();
  for (const f of fs.readdirSync(OUT).filter((f) => f.startsWith("rollup"))) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + " KB");
})().catch((e) => { console.error(e.message || e); process.exit(1); });
