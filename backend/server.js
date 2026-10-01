// ==========================================
// EnergyX Az — Açıq Enerji Kalkulyatoru Backend
// Gənclər Fondu Qrantı çərçivəsində hazırlanmış,
// tam pulsuz, açıq mənbə layihə.
// ==========================================
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { calculateTariff } = require("./tariff");

const app = express();
app.disable("x-powered-by");
// Render/Vercel kimi proksi arxasında rate-limit real IP-yə görə işləsin
app.set("trust proxy", 1);

// ==========================================
// 🛡️ TƏHLÜKƏSİZLİK
// ==========================================
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// ALLOWED_ORIGINS boşdursa hamıya açıqdır (geriyə uyğunluq); istehsalda
// məsələn "https://energyx.az,https://www.energyx.az" yazın.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json({ limit: "10kb" }));

const MAX_KWH = 100000;
const MAX_QUESTION_LEN = 500;

function parseKwh(value) {
  const kwh = parseFloat(value);
  if (!Number.isFinite(kwh) || kwh < 0 || kwh > MAX_KWH) return null;
  return kwh;
}

// ==========================================
// 📊 POST /calculate — sadə, sürətli hesablama (AI lazım deyil)
// ==========================================
app.post("/calculate", (req, res) => {
  const kwh = parseKwh(req.body && req.body.kwh);
  if (kwh === null) {
    return res.status(400).json({ error: "Düzgün kVt/saat dəyəri daxil edin." });
  }
  res.json(calculateTariff(kwh));
});

// ==========================================
// 🤖 POST /advise — AI enerji məsləhətçisi (Gemini, pulsuz tier)
// ==========================================
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çox tez-tez sorğu göndərilir, bir dəqiqə gözləyin." },
});

const LANG_NAMES = { az: "Azərbaycan", en: "English", ru: "русский" };

// Frontend-dən gələn analitika kontekstini təhlükəsiz, qısa mətnə çevirir.
// Yalnız gözlənilən sahələr və rəqəmlər götürülür — prompt injection riskini azaldır.
function contextToText(ctx) {
  if (!ctx || typeof ctx !== "object") return "";
  const num = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 100) / 100 : null);
  const clean = (s) => String(s || "").replace(/[^\p{L}\p{N} .,()+\-]/gu, "").slice(0, 40);
  const lines = [];
  if (num(ctx.healthScore) !== null) lines.push(`Enerji sağlamlıq balı: ${num(ctx.healthScore)}/100`);
  if (Array.isArray(ctx.healthFactors) && ctx.healthFactors.length) {
    lines.push(`Balı aşağı salan amillər: ${ctx.healthFactors.slice(0, 5).map(clean).join(", ")}`);
  }
  if (num(ctx.forecastYearCost) !== null) lines.push(`Növbəti 12 ay üçün proqnoz xərc: ${num(ctx.forecastYearCost)} ₼`);
  if (Array.isArray(ctx.anomalies) && ctx.anomalies.length) {
    lines.push("Qeyri-adi aylar: " + ctx.anomalies.slice(0, 3)
      .map((a) => `${clean(a.month)} (${num(a.kwh)} kVt, gözlənilən ~${num(a.expected)})`).join("; "));
  }
  if (Array.isArray(ctx.topDevices) && ctx.topDevices.length) {
    lines.push("Ən çox enerji işlədən cihazlar: " + ctx.topDevices.slice(0, 3)
      .map((d) => `${clean(d.name)} ${num(d.kwh)} kVt/ay`).join(", "));
  }
  if (num(ctx.budget) > 0) lines.push(`Aylıq büdcə: ${num(ctx.budget)} ₼`);
  return lines.join("\n");
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const AI_TIMEOUT_MS = 15000;

app.post("/advise", aiLimiter, async (req, res) => {
  const body = req.body || {};
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question || question.length > MAX_QUESTION_LEN) {
    return res.status(400).json({ error: `Sual 1-${MAX_QUESTION_LEN} simvol olmalıdır.` });
  }
  const kwh = body.kwh === undefined || body.kwh === "" ? null : parseKwh(body.kwh);
  const lang = LANG_NAMES[body.lang] ? body.lang : "az";

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "AI xidməti hazırda konfiqurasiya edilməyib." });
  }

  const tierNameAz = { low: "aşağı", mid: "orta", high: "yüksək" };
  const tariff = kwh !== null ? calculateTariff(kwh) : null;
  const ctxText = contextToText(body.context);

  const systemContext = `Sən Azərbaycan Respublikasının pillə-əsaslı elektrik tarif sistemi üzrə ixtisaslaşmış, dostcasına bir AI enerji köməkçisisən.
Rəsmi tariflər: 0-200 kVt/saat = 8.4 qəpik, 200-300 kVt/saat = 10 qəpik, 300+ kVt/saat = 15 qəpik.
${tariff ? `İstifadəçinin bu dövrki istifadəsi: ${kwh} kVt/saat (${tierNameAz[tariff.tier]} pillə, təxmini ${tariff.cost} ₼).` : ""}
${ctxText ? `İstifadəçinin analitika məlumatı (onun öz cihazında hesablanıb):\n${ctxText}` : ""}
Qısa (3-5 cümlə), praktik, konkret enerji qənaəti məsləhətləri ver. Uydurma rəqəm vermə. Yalnız enerji mövzusunda cavab ver.
Cavabı ${LANG_NAMES[lang]} dilində yaz.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        // Açar URL-də yox, başlıqda göndərilir — loglara düşmür
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemContext }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.6 },
        }),
        signal: controller.signal,
      }
    );
    if (!response.ok) {
      console.error("Gemini HTTP xətası:", response.status);
      return res.status(502).json({ error: "AI xidmətində xəta baş verdi." });
    }
    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Üzr istəyirəm, cavab hazırlaya bilmədim, bir daha cəhd edin.";
    bumpStats((s) => { s.totalAiQuestions += 1; });
    res.json({ answer });
  } catch (err) {
    const timedOut = err && err.name === "AbortError";
    console.error("AI xətası:", timedOut ? "timeout" : err && err.message);
    res.status(timedOut ? 504 : 500).json({ error: "AI xidmətində xəta baş verdi." });
  } finally {
    clearTimeout(timeout);
  }
});

// ==========================================
// 📈 SADƏ STATİSTİKA SİSTEMİ (fayl-əsaslı, verilənlər bazası tələb etmir)
// Yaddaşda saxlanılır, fayla atomik şəkildə (tmp + rename) yazılır.
// ==========================================
const STATS_FILE = process.env.STATS_FILE || path.join(__dirname, "stats.json");
const DEFAULT_STATS = { totalCalculations: 0, totalSavingsIdentified: 0, totalAiQuestions: 0, aiFeedbackUp: 0, aiFeedbackDown: 0, totalPdfExports: 0 };
let statsCache = null;

function loadStats() {
  if (statsCache) return statsCache;
  try {
    statsCache = { ...DEFAULT_STATS, ...JSON.parse(fs.readFileSync(STATS_FILE, "utf-8")) };
  } catch {
    statsCache = { ...DEFAULT_STATS };
  }
  return statsCache;
}
function saveStats(stats) {
  try {
    const tmp = STATS_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(stats));
    fs.renameSync(tmp, STATS_FILE);
  } catch (err) {
    console.error("Statistika yazılmadı:", err.message);
  }
}
function bumpStats(mutator) {
  const s = loadStats();
  mutator(s);
  saveStats(s);
  return s;
}

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çox sorğu." },
});

const TRACK_HANDLERS = {
  calculation: (s) => { s.totalCalculations += 1; },
  ai_question: (s) => { s.totalAiQuestions += 1; },
  ai_feedback_up: (s) => { s.aiFeedbackUp += 1; },
  ai_feedback_down: (s) => { s.aiFeedbackDown += 1; },
  pdf_export: (s) => { s.totalPdfExports += 1; },
};

app.post("/track", trackLimiter, (req, res) => {
  const { type, amount } = req.body || {};
  if (type === "savings") {
    const value = parseFloat(amount);
    // Bir istifadəçinin statistikanı süni şişirtməsinin qarşısını almaq üçün yuxarı hədd
    if (!Number.isFinite(value) || value <= 0 || value > 1000) return res.status(400).json({ error: "Yanlış məbləğ." });
    return res.json(bumpStats((s) => { s.totalSavingsIdentified = Math.round((s.totalSavingsIdentified + value) * 100) / 100; }));
  }
  const handler = TRACK_HANDLERS[type];
  if (!handler) return res.status(400).json({ error: "Naməlum hadisə növü." });
  res.json(bumpStats(handler));
});

app.get("/stats", (req, res) => {
  res.json(loadStats());
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", ai: Boolean(process.env.GEMINI_API_KEY), uptimeSec: Math.round(process.uptime()) });
});

app.get("/", (req, res) => {
  res.json({ status: "işləyir", service: "EnergyX Az Açıq Enerji Kalkulyatoru" });
});

// Naməlum marşrutlar və JSON parse xətaları üçün səliqəli cavab
app.use((req, res) => res.status(404).json({ error: "Tapılmadı." }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.type === "entity.too.large" ? 413 : err.type === "entity.parse.failed" ? 400 : 500;
  if (status === 500) console.error("Server xətası:", err.message);
  res.status(status).json({ error: status === 500 ? "Server xətası." : "Yanlış sorğu." });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server işə düşdü → port ${PORT}`));
}

module.exports = { app, contextToText };
