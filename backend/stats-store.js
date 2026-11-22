// İstifadə statistikası: ümumi sayğaclar + gün üzrə sayğaclar + dil bölgüsü.
// UPSTASH_REDIS_REST_URL və UPSTASH_REDIS_REST_TOKEN verilibsə Upstash Redis-də (qalıcı) saxlanılır,
// yoxsa lokal JSON faylında (Render-in pulsuz planında server yenidən başlayanda sıfırlanır).
// Heç bir şəxsi məlumat (IP, istifadəçi identifikatoru) saxlanılmır, yalnız saylar.
const fs = require("fs");
const path = require("path");

const FIELDS = ["visits", "calculations", "ai_questions", "ai_feedback_up", "ai_feedback_down", "pdf_exports", "savings_cents"];
const LANGS = ["az", "en", "ru"];
const PREFIX = "energyx:";

// Gün Bakı vaxtı ilə hesablanır (UTC+4)
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku", year: "numeric", month: "2-digit", day: "2-digit" });
function today(now = new Date()) { return dayFmt.format(now); }
function lastDays(n, now = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(today(new Date(now.getTime() - i * 86400000)));
  return [...new Set(out)];
}
const emptyRow = () => Object.fromEntries(FIELDS.map((f) => [f, 0]));
function toRow(obj) {
  const r = emptyRow();
  for (const f of FIELDS) r[f] = Number(obj && obj[f]) || 0;
  return r;
}

// ---------- Upstash Redis (REST) ----------
// Panel dəyərləri tez-tez dırnaqla kopyalanır (.env formatı: KEY="..."): dırnaq və boşluqlar təmizlənir
const cleanEnv = (v) => String(v || "").trim().replace(/^["']+|["']+$/g, "").trim();

function redisStore(url, token, fetchImpl) {
  const base = url.replace(/\/+$/, "");
  const store = { kind: "redis", lastError: null };
  async function pipeline(cmds) {
    try {
      const res = await (fetchImpl || globalThis.fetch)(base + "/pipeline", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify(cmds),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        let detail = "";
        try { detail = String((await res.json()).error || ""); } catch {}
        throw new Error(`Upstash HTTP ${res.status}${detail ? ": " + detail : ""}`);
      }
      const data = await res.json();
      const bad = Array.isArray(data) ? data.find((x) => x && x.error) : { error: "gözlənilməz cavab" };
      if (bad) throw new Error("Upstash: " + bad.error);
      store.lastError = null;
      return data.map((x) => x.result);
    } catch (err) {
      // Diaqnostika üçün (/health): açar heç vaxt mesajda olmur
      store.lastError = String(err && err.message || err).split(token).join("***").slice(0, 160);
      throw err;
    }
  }
  const hashToObj = (arr) => {
    const o = {};
    if (Array.isArray(arr)) for (let i = 0; i + 1 < arr.length; i += 2) o[arr[i]] = arr[i + 1];
    return o;
  };
  return Object.assign(store, {
    async add(field, by = 1, lang) {
      const day = today();
      const cmds = [["HINCRBY", PREFIX + "totals", field, by], ["HINCRBY", PREFIX + "day:" + day, field, by],
        ["HSETNX", PREFIX + "meta", "since", day]];
      if (lang) cmds.push(["HINCRBY", PREFIX + "lang", lang, 1]);
      await pipeline(cmds);
    },
    async totals() {
      const [t, l, m] = await pipeline([["HGETALL", PREFIX + "totals"], ["HGETALL", PREFIX + "lang"], ["HGETALL", PREFIX + "meta"]]);
      return { totals: toRow(hashToObj(t)), languages: hashToObj(l), since: hashToObj(m).since || null };
    },
    async daily(days) {
      const list = lastDays(days);
      const res = await pipeline(list.map((d) => ["HGETALL", PREFIX + "day:" + d]));
      return list.map((date, i) => ({ date, ...toRow(hashToObj(res[i])) }));
    },
  });
}

// ---------- Lokal fayl ----------
function fileStore(file) {
  let cache = null;
  function load() {
    if (cache) return cache;
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
      // Köhnə format (v2.4-ə qədər): { totalCalculations, totalAiQuestions, ... } düz obyekt
      if (raw && !raw.totals && "totalCalculations" in raw) {
        cache = { totals: toRow({ calculations: raw.totalCalculations, ai_questions: raw.totalAiQuestions,
          ai_feedback_up: raw.aiFeedbackUp, ai_feedback_down: raw.aiFeedbackDown, pdf_exports: raw.totalPdfExports,
          savings_cents: Math.round((Number(raw.totalSavingsIdentified) || 0) * 100) }), days: {}, languages: {}, since: null };
      } else {
        cache = { totals: toRow(raw.totals), days: raw.days || {}, languages: raw.languages || {}, since: raw.since || null };
      }
    } catch {
      cache = { totals: emptyRow(), days: {}, languages: {}, since: null };
    }
    return cache;
  }
  function save() {
    try {
      const tmp = file + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(cache));
      fs.renameSync(tmp, file);
    } catch (err) {
      console.error("Statistika yazılmadı:", err.message);
    }
  }
  return {
    kind: "file",
    async add(field, by = 1, lang) {
      const s = load(), day = today();
      s.totals[field] = (s.totals[field] || 0) + by;
      s.days[day] = toRow(s.days[day]);
      s.days[day][field] += by;
      if (lang) s.languages[lang] = (s.languages[lang] || 0) + 1;
      if (!s.since) s.since = day;
      save();
    },
    async totals() {
      const s = load();
      return { totals: { ...s.totals }, languages: { ...s.languages }, since: s.since };
    },
    async daily(days) {
      const s = load();
      return lastDays(days).map((date) => ({ date, ...toRow(s.days[date]) }));
    },
  };
}

function createStatsStore(env = process.env, fetchImpl) {
  const url = cleanEnv(env.UPSTASH_REDIS_REST_URL), token = cleanEnv(env.UPSTASH_REDIS_REST_TOKEN);
  if (url && token) return redisStore(/^https?:\/\//i.test(url) ? url : "https://" + url, token, fetchImpl);
  return fileStore(env.STATS_FILE || path.join(__dirname, "stats.json"));
}

module.exports = { createStatsStore, cleanEnv, FIELDS, LANGS, today, lastDays };
