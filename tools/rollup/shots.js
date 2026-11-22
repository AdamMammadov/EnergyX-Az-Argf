// Roll-up üçün telefon ekran şəkilləri (yüksək keyfiyyət, 4x).
// İstifadə: cd frontend && python3 -m http.server 8765; node tools/rollup/shots.js <çıxış qovluğu>
const path = require("path");
const PW = require(process.env.PW || "playwright");
const OUT = process.argv[2] || path.join(__dirname, "build");
const BASE = process.env.BASE || "http://127.0.0.1:8765/";
const THEME = process.env.THEME || "light";
(async () => {
  require("fs").mkdirSync(OUT, { recursive: true });
  const b = await PW.chromium.launch({ args: ["--no-proxy-server"] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 4, isMobile: true, hasTouch: true, locale: "az-AZ" });
  await ctx.addInitScript((t) => { try { localStorage.setItem("energyx_theme", t); localStorage.setItem("energyx_lang", "az"); } catch {} }, THEME);
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const p = await ctx.newPage();
  const shot = async (name) => { await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, name + ".png") }); console.log("ok", name); };
  // Bildirişlər ekran şəklinə düşməsin
  await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => {
    const st = document.createElement("style"); st.textContent = "#toastBox,.to-top,.scroll-progress{display:none!important}"; document.head.appendChild(st); }));
  const scrollTo = async (sel, off = 120) => { await p.evaluate(([q, o]) => {
    const el = document.querySelector(q); const card = el.closest("section, .pro-card, .card") || el; window.scrollTo(0, card.getBoundingClientRect().top + scrollY - o); }, [sel, off]); };
  const tab = async (t) => { await p.evaluate((x) => { switchTab(x); window.scrollTo(0, 0); }, t); await p.waitForTimeout(700); };

  await p.goto(BASE + "#home", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await shot("home");

  await tab("calc");
  await p.evaluate(() => { const s = document.getElementById("kwhSlider"); s.value = 260; s.dispatchEvent(new Event("input", { bubbles: true })); });
  await shot("calc");

  await p.evaluate(() => EnergyPro.loadSample());
  await p.waitForTimeout(800);
  await tab("app"); await shot("app");
  await scrollTo("#appChart", 72); await shot("app-chart");
  await tab("insights"); await shot("insights");
  await scrollTo("#fcChart", 72); await shot("insights-forecast");
  await tab("meter"); await scrollTo("#labCurve", 72); await shot("meter-curve");
  await tab("gas"); await shot("gas");
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
