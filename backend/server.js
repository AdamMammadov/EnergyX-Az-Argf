// ==========================================
// EnergyX Az - Açıq Enerji Kalkulyatoru Backend
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
// TƏHLÜKƏSİZLİK
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
app.use(express.json({ limit: "24kb" }));

const MAX_KWH = 100000;
const MAX_QUESTION_LEN = 500;

function parseKwh(value) {
  const kwh = parseFloat(value);
  if (!Number.isFinite(kwh) || kwh < 0 || kwh > MAX_KWH) return null;
  return kwh;
}

// ==========================================
// POST /calculate - sadə, sürətli hesablama (AI lazım deyil)
// ==========================================
app.post("/calculate", (req, res) => {
  const kwh = parseKwh(req.body && req.body.kwh);
  if (kwh === null) {
    return res.status(400).json({ error: "Düzgün kVt/saat dəyəri daxil edin." });
  }
  res.json(calculateTariff(kwh));
});

// ==========================================
// POST /advise - AI enerji məsləhətçisi (Gemini, pulsuz tier)
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
// Yalnız gözlənilən sahələr və rəqəmlər götürülür - prompt injection riskini azaldır.
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
  // Ağıllı sayğac (saatlıq yük profili) analizinin xülasəsi
  const p = ctx.profile;
  if (p && typeof p === "object" && num(p.baseloadW) !== null) {
    lines.push(`Saatlıq yük profili${p.source === "csv" ? " (istifadəçinin sayğac CSV-si)" : p.source === "sim" ? " (cihazlardan simulyasiya)" : " (nümunə)"}: `
      + `baza yükü ${num(p.baseloadW)} Vt, pik saat ${num(p.peakHour)}:00, gündəlik orta ${num(p.avgDailyKwh)} kVt·saat, `
      + `gecə payı ${num(p.nightSharePct)}%, saatlıq anomaliya sayı ${num(p.events)}`);
  }
  return lines.join("\n");
}

// Söhbət tarixçəsi (çoxaddımlı dialoq): yalnız user/assistant rolları, son 6 mesaj,
// hər biri 1200 simvola qədər. Gemini ardıcıl user → model növbələnməsi tələb edir.
const MAX_HISTORY = 6, MAX_HISTORY_TEXT = 1200;
function historyToContents(history) {
  if (!Array.isArray(history)) return [];
  const items = history.slice(-MAX_HISTORY)
    .filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.text === "string" && h.text.trim())
    .map((h) => ({ role: h.role === "assistant" ? "model" : "user", text: h.text.trim().slice(0, MAX_HISTORY_TEXT) }));
  const merged = [];
  items.forEach((it) => {
    const last = merged[merged.length - 1];
    if (last && last.role === it.role) last.text += "\n" + it.text;
    else merged.push({ ...it });
  });
  while (merged.length && merged[0].role !== "user") merged.shift();
  // Cari sual "user" olduğu üçün tarixçə "model" ilə bitməlidir
  while (merged.length && merged[merged.length - 1].role !== "model") merged.pop();
  return merged.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
}

// Default: Google-un "həmişə ən son Flash" ləqəbi. Konkret versiyalar (2.0-flash, 2.5-flash …)
// vaxtaşırı bağlanır - 2.0-flash 1 iyun 2026-da bağlandı və köhnə backend-də AI məhz buna görə dayandı.
const GEMINI_MODEL = String(process.env.GEMINI_MODEL || "gemini-flash-latest").trim();
// Model bağlanıbsa (404) və ya müvəqqəti yüklənibsə (503 "high demand", 429 kvota, 500) bu modellər sınanır.
// Hər model Google-da ayrı tutum/kvota hovuzundadır - biri yüklənəndə digəri adətən cavab verir.
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];
const TRANSIENT_STATUS = new Set([429, 500, 503]);
let activeModel = GEMINI_MODEL; // əsas işləyən model (yalnız əvvəlki model bağlananda dəyişir)
const goneModels = new Map();   // 404 verən modellər → vaxt; 1 saat ərzində yenidən sınanmır
const GONE_TTL_MS = 60 * 60 * 1000;
const AI_TIMEOUT_MS = 20000;    // frontend 25 s gözləyir - backend ondan əvvəl cavab verməlidir

// Generasiya parametrləri modelə görə:
// - 2.5 Flash: "düşünmə" tokenləri maxOutputTokens-dan xərclənir → düşünmə söndürülür (thinkingBudget: 0)
// - 1.x / 2.0: köhnə modellər, düşünmə yoxdur
// - 3.x və "*-latest" ləqəbləri: düşünmə həmişə aktivdir → limit genişləndirilir; Google bu modellərdə
//   temperaturu default saxlamağı tövsiyə edir, ona görə göndərilmir
function generationConfig(model, maxOutputTokens) {
  if (/2\.5-flash/i.test(model)) return { maxOutputTokens, temperature: 0.6, thinkingConfig: { thinkingBudget: 0 } };
  if (/^gemini-(1\.|2\.0)/i.test(model)) return { maxOutputTokens, temperature: 0.6 };
  return { maxOutputTokens: Math.max(maxOutputTokens, 4096) };
}

// Gemini cavabından mətni çıxarır: bütün mətn hissələri birləşdirilir, "thought" hissələri atılır
function extractAnswer(data) {
  const cand = data && Array.isArray(data.candidates) ? data.candidates[0] : null;
  const parts = cand && cand.content && Array.isArray(cand.content.parts) ? cand.content.parts : [];
  const text = parts.filter((p) => p && typeof p.text === "string" && !p.thought).map((p) => p.text).join("").trim();
  const reason = text ? null
    : (data && data.promptFeedback && data.promptFeedback.blockReason) || (cand && cand.finishReason) || "EMPTY_RESPONSE";
  return { text, reason };
}

// Model təlimata baxmayaraq emoji, markdown və ya uzun tire yaza bilər: cavab saytda sadə mətn kimi göstərilir
function tidyAnswer(text) {
  return String(text)
    .replace(/[\u2014\u2013\u2212]/g, "-")
    .replace(/\*\*|__|^#+\s*/gm, "")
    .replace(/^\s*[*•]\s+/gm, "- ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\uFE0F?[ \t]?/gu, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

// Vahid Gemini çağırışı: { ok, text, model } və ya { ok:false, status, reason } qaytarır (açar heç vaxt qaytarılmır).
// - 404 (model bağlanıb): növbəti modelə keçir və işləyəni əsas model kimi yadda saxlayır
// - 503/429/500 (müvəqqəti): bu sorğu üçün ehtiyat modelə keçir; hamısı yüklənibsə qısa fasilədən sonra
//   əsas model bir dəfə də sınanır. Ümumi vaxt limiti (timeoutMs) bütün cəhdlərə birlikdə şamil olunur.
async function callGemini(opts) {
  const deadline = Date.now() + (opts.timeoutMs || AI_TIMEOUT_MS);
  const now = Date.now();
  const all = [...new Set([activeModel, GEMINI_MODEL, ...FALLBACK_MODELS])];
  const fresh = all.filter((m) => !(goneModels.has(m) && now - goneModels.get(m) < GONE_TTL_MS));
  const order = fresh.length ? fresh : all;
  let firstFailure = null, last = null, primaryTransient = false;
  const tryModel = async (model) => {
    const left = deadline - Date.now();
    if (left < 2500) return null;
    const r = await callGeminiModel(model, { ...opts, timeoutMs: left });
    if (r.ok) {
      goneModels.delete(model);
      if (model !== activeModel) {
        if (goneModels.has(activeModel)) {
          console.warn(`Gemini modeli dəyişdi: ${activeModel} → ${model} (köhnə model bağlanıb)`);
          activeModel = model;
        } else console.warn(`Gemini: ${order[0]} müvəqqəti əlçatmazdır, cavab ${model} ilə verildi`);
      }
    } else if (r.status === 404) goneModels.set(model, Date.now());
    return r;
  };
  for (const model of order) {
    const r = await tryModel(model);
    if (!r) break;
    if (r.ok) return r;
    last = r;
    if (model === order[0] && TRANSIENT_STATUS.has(r.status)) primaryTransient = true;
    if (r.status !== 404) firstFailure = firstFailure || r;
    if (r.status !== 404 && !TRANSIENT_STATUS.has(r.status)) return r;   // açar səhvi, timeout, boş cavab
  }
  // Hamısı yüklənibsə - əsas modelə qısa fasilədən sonra son cəhd
  if (primaryTransient && deadline - Date.now() > 4000) {
    await new Promise((res) => setTimeout(res, 1000));
    const r = await tryModel(order[0]);
    if (r && r.ok) return r;
  }
  return firstFailure || last || { ok: false, status: 504, reason: "TIMEOUT" };
}

async function callGeminiModel(model, { system, contents, maxOutputTokens = 1024, timeoutMs = AI_TIMEOUT_MS }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        // Açar URL-də yox, başlıqda göndərilir - loglara düşmür
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          contents,
          generationConfig: generationConfig(model, maxOutputTokens),
        }),
        signal: controller.signal,
      }
    );
    let data = null;
    try { data = await response.json(); } catch { data = null; }
    if (!response.ok) {
      const err = (data && data.error) || {};
      const reason = String(err.status || `HTTP_${response.status}`).slice(0, 40);
      // Açar və layihə nömrəsi kimi uzun rəqəmlər gizlədilir (mesaj /ai-check-də görünür)
      const message = String(err.message || "").replace(/key=[^&\s]+/gi, "key=***").replace(/\d{6,}/g, "***").slice(0, 200);
      console.error("Gemini xətası:", model, response.status, reason, message);
      return { ok: false, status: response.status, reason, message };
    }
    const { text, reason } = extractAnswer(data);
    if (!text) {
      console.error("Gemini boş cavab:", reason);
      return { ok: false, status: 200, reason };
    }
    return { ok: true, text, model };
  } catch (err) {
    const timedOut = err && err.name === "AbortError";
    console.error("AI xətası:", timedOut ? "timeout" : err && err.message);
    return { ok: false, status: timedOut ? 504 : 500, reason: timedOut ? "TIMEOUT" : "NETWORK_ERROR" };
  } finally {
    clearTimeout(timer);
  }
}

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
Sadə, təbii dildə yaz: emoji, markdown (**, #, siyahı işarələri) və uzun tire işlətmə, lazım olsa qısa tire (-) yaz.
Cavabı ${LANG_NAMES[lang]} dilində yaz.`;

  const result = await callGemini({
    system: systemContext,
    contents: [...historyToContents(body.history), { role: "user", parts: [{ text: question }] }],
  });
  if (!result.ok) {
    // Boş/bloklanmış cavab da xəta sayılır - frontend bu halda oflayn köməkçiyə keçir
    const status = result.status === 504 ? 504 : 502;
    return res.status(status).json({ error: "AI xidmətində xəta baş verdi.", reason: result.reason });
  }
  bumpStats((s) => { s.totalAiQuestions += 1; });
  res.json({ answer: tidyAnswer(result.text) });
});

// ==========================================
// GET /ai-check - AI-ın real vəziyyətini yoxlayır (deploy-dan sonra diaqnostika üçün)
// Kiçik test sorğusu göndərir; açar və ya istifadəçi məlumatı qaytarılmır.
// ==========================================
const aiCheckLimiter = rateLimit({ windowMs: 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false,
  message: { error: "Çox tez-tez yoxlama." } });
app.get("/ai-check", aiCheckLimiter, async (req, res) => {
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ ok: false, model: activeModel, reason: "GEMINI_API_KEY_MISSING" });
  const t0 = Date.now();
  const r = await callGemini({ contents: [{ role: "user", parts: [{ text: "Reply with the single word: OK" }] }], maxOutputTokens: 16, timeoutMs: 15000 });
  res.status(r.ok ? 200 : 502).json({ ok: r.ok, model: r.ok ? r.model : activeModel, latencyMs: Date.now() - t0,
    ...(r.ok ? {} : { reason: r.reason, message: r.message || undefined }) });
});

// ==========================================
// SADƏ STATİSTİKA SİSTEMİ (fayl-əsaslı, verilənlər bazası tələb etmir)
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
  res.json({ status: "ok", version: require("./package.json").version, ai: Boolean(process.env.GEMINI_API_KEY), model: activeModel,
    uptimeSec: Math.round(process.uptime()) });
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
  app.listen(PORT, () => console.log(`Server işə düşdü → port ${PORT}`));
}

module.exports = { app, contextToText, historyToContents, extractAnswer, generationConfig, tidyAnswer };
