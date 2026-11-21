// Tanıtım videosunun kadrları: giriş kartı -> ana səhifədə sürətli hesablama -> təqdimat (9 addım) -> Fond loqosu və məcburi qeyd.
// Hər hissənin uzunluğu izah kliplərinə görə seçilir (clips.json), təqdimat addımları səslə sinxron gedir.
// Kadrlar CDP screencast ilə (yüksək keyfiyyət) götürülür, sonra ffmpeg ilə H.264 MP4-ə yığılır.
const fs = require("fs");
const PW = require(process.env.PW || "playwright");
const OUT = process.argv[2];            // kadr qovluğu
const LANG = process.argv[3] || "az";
const THEME = process.argv[4] || "light";
const CLIPS = JSON.parse(fs.readFileSync(process.argv[5], "utf8"));
const D = Object.fromEntries(CLIPS.map((c) => [c.id, c.dur]));
const LEAD = 0.35;                                   // seqment başlayandan səsə qədər
const segMs = (id, pad, min) => Math.round(Math.max(min, LEAD + D[id] + pad) * 1000);
const STEP_IDS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"];
const marks = {};                                    // seqmentlərin başlanğıc vaxtı (epoch saniyə)

const TXT = {
  az: { sub: "Azərbaycanda ev təsərrüfatları üçün pulsuz elektrik və qaz xərci kalkulyatoru",
        sup: "Azərbaycan Respublikasının Gənclər Fondunun dəstəyi ilə",
        credit: "Musiqi: Kevin MacLeod, \"Inspired\" (incompetech.com), CC BY 4.0 · Səs: Meta MMS-TTS, CC BY-NC 4.0",
        disc: "Bu nəşr Azərbaycan Respublikasının Gənclər Fondunun maliyyə yardımı ilə hazırlanmışdır. Fond nəşrin məzmununa görə məsuliyyət daşımır." },
  en: { sub: "A free electricity and gas cost calculator for households in Azerbaijan",
        sup: "Supported by the Youth Foundation of the Republic of Azerbaijan",
        disc: "This publication was prepared with the financial support of the Youth Foundation of the Republic of Azerbaijan. The Foundation is not responsible for its content." },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await PW.chromium.launch({ args: ["--no-proxy-server"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  await ctx.route("https://energyx-az-kalkulyator.onrender.com/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|energyx-az)/, (r) => r.abort());
  await ctx.addInitScript(([lang, theme]) => {
    try { localStorage.clear(); localStorage.setItem("energyx_theme", theme); localStorage.setItem("energyx_lang", lang); } catch (e) {}
  }, [LANG, THEME]);
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle" });
  await p.evaluate((l) => setLang(l), LANG);
  await p.waitForTimeout(500);

  // Kart (giriş/çıxış) və siçan göstəricisi üçün stillər
  await p.addStyleTag({ content: `
    .vcard { position:fixed; inset:0; z-index:5000; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px;
      background:var(--bg); color:var(--text-hi); text-align:center; padding:60px; opacity:0; transition:opacity .6s ease; }
    .vcard.on { opacity:1; }
    .vcard h1 { font-family:var(--font-num); font-size:72px; letter-spacing:-0.02em; margin:0; }
    .vcard .vsub { font-size:24px; color:var(--text-lo); max-width:900px; line-height:1.4; }
    .vcard .vsup { font-size:17px; color:var(--text-lo); margin-top:26px; }
    .vcard img { height:76px; width:auto; }
    .vcard .vdisc { font-size:18px; color:var(--text-lo); max-width:900px; line-height:1.55; font-style:italic; }
    .vcard .vtags { font-size:17px; color:var(--accent); font-weight:600; }
    .vcard .vbrand svg { width:96px; height:96px; }
    .vcur { position:fixed; z-index:4000; width:22px; height:22px; margin:-11px 0 0 -11px; border-radius:50%; pointer-events:none;
      background:rgba(20,30,45,.35); border:2px solid #fff; box-shadow:0 1px 6px rgba(0,0,0,.35); left:720px; top:600px;
      transition:left .8s cubic-bezier(.4,0,.2,1), top .8s cubic-bezier(.4,0,.2,1), transform .15s; }
    .vcur.press { transform:scale(.75); }
    .pres-bar, .toast-box { display:none !important; }
    .vcard .vcredit { font-size:13px; color:var(--text-lo); margin-top:18px; }
  `});
  const t = TXT[LANG] || TXT.az;
  const logo = THEME === "dark" ? "img/azgf-h-white.webp" : "img/azgf-h-color.webp";
  const brandSvg = await p.evaluate(() => document.querySelector(".brand svg").outerHTML);

  // ---- Kadr yazısı (CDP screencast)
  const client = await ctx.newCDPSession(p);
  const stamps = [];
  client.on("Page.screencastFrame", async (f) => {
    const i = stamps.length;
    stamps.push(f.metadata.timestamp);
    fs.writeFileSync(`${OUT}/f${String(i).padStart(6, "0")}.jpg`, Buffer.from(f.data, "base64"));
    try { await client.send("Page.screencastFrameAck", { sessionId: f.sessionId }); } catch (e) {}
  });
  const card = async (html, ms) => {
    await p.evaluate((h) => { const d = document.createElement("div"); d.className = "vcard"; d.id = "vcard"; d.innerHTML = h; document.body.appendChild(d); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("on"))); }, html);
    await p.waitForTimeout(ms);
  };
  const cardOff = async () => { await p.evaluate(() => { const d = document.getElementById("vcard"); d.classList.remove("on"); setTimeout(() => d.remove(), 700); }); await p.waitForTimeout(750); };
  const cursorTo = async (sel) => {
    const box = await p.locator(sel).first().boundingBox();
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await p.evaluate(([x, y]) => { let c = document.querySelector(".vcur"); if (!c) { c = document.createElement("div"); c.className = "vcur"; document.body.appendChild(c); } c.style.left = x + "px"; c.style.top = y + "px"; }, [x, y]);
    await p.waitForTimeout(900);
    return { x, y };
  };
  const press = async (sel) => {
    const { x, y } = await cursorTo(sel);
    await p.evaluate(() => document.querySelector(".vcur").classList.add("press"));
    await p.mouse.click(x, y);
    await p.waitForTimeout(150);
    await p.evaluate(() => document.querySelector(".vcur").classList.remove("press"));
  };

  await client.send("Page.startScreencast", { format: "jpeg", quality: 92, everyNthFrame: 1 });
  const t0 = Date.now() / 1000;

  // 1) Giriş kartı
  marks.intro = Date.now() / 1000;
  await card(`<div class="vbrand">${brandSvg}</div><h1>EnergyX Az</h1><div class="vsub">${t.sub}</div>
    <div class="vsup">${t.sup}</div><img src="${logo}" alt="">`, segMs("intro", 0.9, 5) - 750);
  await cardOff();

  // 2) Ana səhifə: sürətli hesablama ("məsələn iki yüz altmış" deyiləndə yazılır)
  marks.home = Date.now() / 1000;
  const homeEnd = Date.now() + segMs("home", 0.8, 6);
  await p.waitForTimeout(400);
  await press("#homeKwh");
  await p.fill("#homeKwh", "");
  await p.waitForTimeout(1300);
  await p.type("#homeKwh", "260", { delay: 220 });
  await p.waitForTimeout(Math.max(300, homeEnd - Date.now() - 1100));
  await p.evaluate(() => { const c = document.querySelector(".vcur"); if (c) c.remove(); });

  // 3) Təqdimat (ana səhifədəki "Necə işlədiyinə bax" düyməsi)
  await cursorTo(".home-cta .btn-secondary");
  await p.evaluate(() => document.querySelector(".vcur").classList.add("press"));
  const durations = STEP_IDS.map((id) => segMs(id, 0.8, 4.5));
  marks.steps = Date.now() / 1000;
  marks.durations = durations;
  await p.evaluate((d) => { document.querySelector(".vcur").remove(); EnergyPro.startPresentation({ durations: d }); }, durations);
  await p.waitForFunction(() => !document.getElementById("presBar"), null, { timeout: 240000, polling: 250 });
  await p.waitForTimeout(600);

  // 4) Çıxış kartı: Fond loqosu, məcburi qeyd, heşteqlər
  marks.outro = Date.now() / 1000;
  await card(`<img src="${logo}" alt="" style="height:96px"><div class="vdisc">${t.disc}</div>
    <div class="vtags">#EnergyXAz #AzGF #GenclerFondu</div><div class="vsup">EnergyX Az · 2026</div>
    <div class="vcredit">${t.credit}</div>`, segMs("outro", 1.8, 6));

  const tEnd = Date.now() / 1000;
  await client.send("Page.stopScreencast");
  await p.waitForTimeout(300);
  fs.writeFileSync(`${OUT}/stamps.json`, JSON.stringify({ stamps, end: tEnd, start: t0, marks }));
  console.log("frames:", stamps.length, "| seconds:", (tEnd - t0).toFixed(1), "| errors:", errs.join(" | ") || "none");
  await b.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
