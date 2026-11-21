// AI (Gemini) inteqrasiyasının tam yoxlanışı — Gemini API saxta (mock) cavablarla əvəz olunur
const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");

process.env.STATS_FILE = path.join(os.tmpdir(), `energyx-ai-${process.pid}.json`);
process.env.GEMINI_API_KEY = "test-key-123";
delete process.env.GEMINI_MODEL;

const realFetch = globalThis.fetch;
let mode = "ok", lastCall = null, calls = 0, urls = [];
globalThis.fetch = async (url, opts) => {
  if (!String(url).includes("generativelanguage.googleapis.com")) return realFetch(url, opts);
  calls++; urls.push(String(url));
  lastCall = { url: String(url), headers: opts.headers, body: JSON.parse(opts.body) };
  const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
  switch (mode) {
    case "ok": return json(200, { candidates: [{ content: { parts: [{ text: "düşünürəm…", thought: true }, { text: "LED lampalara " }, { text: "keçin." }] }, finishReason: "STOP" }] });
    case "max_tokens": return json(200, { candidates: [{ content: { parts: [] }, finishReason: "MAX_TOKENS" }] });
    case "blocked": return json(200, { promptFeedback: { blockReason: "SAFETY" } });
    case "not_found": return json(404, { error: { code: 404, status: "NOT_FOUND", message: "models/gemini-2.0-flash is not found for API version v1beta" } });
    case "bad_key": return json(400, { error: { code: 400, status: "INVALID_ARGUMENT", message: "API key not valid. Please pass a valid API key." } });
    default: throw new Error("network down");
  }
};

const { app, extractAnswer, generationConfig } = require("../server");
let server, base;
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
test.after(() => new Promise((r) => server.close(r)));
const ask = (body) => realFetch(base + "/advise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("uğurlu cavab: sorğu formatı, açar başlıqda, tarixçə, kontekst, default model ləqəbi", async () => {
  mode = "ok";
  const res = await ask({ question: "Necə qənaət edim?", kwh: 330, lang: "en",
    history: [{ role: "user", text: "Salam" }, { role: "assistant", text: "Salam!" }],
    context: { healthScore: 58, profile: { baseloadW: 145, peakHour: 19, avgDailyKwh: 14.3, nightSharePct: 21, events: 2, source: "sample" } } });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).answer, "LED lampalara keçin.");     // "thought" hissəsi atılır, qalanlar birləşir
  assert.match(lastCall.url, /models\/gemini-flash-latest:generateContent$/);
  assert.ok(!lastCall.url.includes("test-key"));                       // açar URL-də deyil
  assert.equal(lastCall.headers["x-goog-api-key"], "test-key-123");
  const sys = lastCall.body.systemInstruction.parts[0].text;
  assert.match(sys, /330 kVt\/saat \(yüksək pillə, təxmini 31.3 ₼\)/);
  assert.match(sys, /English/);
  assert.match(sys, /baza yükü 145 Vt/);
  const c = lastCall.body.contents;
  assert.deepEqual(c.map((x) => x.role), ["user", "model", "user"]);
  assert.equal(c[2].parts[0].text, "Necə qənaət edim?");
  // "*-latest" (Gemini 3+) üçün düşünmə tokenlərinə yer saxlanılır, temperatur default qalır
  assert.equal(lastCall.body.generationConfig.thinkingConfig, undefined);
  assert.equal(lastCall.body.generationConfig.temperature, undefined);
  assert.ok(lastCall.body.generationConfig.maxOutputTokens >= 2048);
});

test("boş cavab (MAX_TOKENS) 200 'üzr istəyirəm' yox, 502 qaytarır → frontend oflayn köməkçiyə keçir", async () => {
  mode = "max_tokens";
  const res = await ask({ question: "Salam" });
  assert.equal(res.status, 502);
  assert.equal((await res.json()).reason, "MAX_TOKENS");
});

test("bloklanmış sorğu və köhnəlmiş model səbəbi ilə xəta qaytarır", async () => {
  mode = "blocked";
  let res = await ask({ question: "Salam" });
  assert.equal(res.status, 502); assert.equal((await res.json()).reason, "SAFETY");
  mode = "not_found"; urls = [];
  res = await ask({ question: "Salam" });
  assert.equal(res.status, 502); assert.equal((await res.json()).reason, "NOT_FOUND");
  // bütün ehtiyat modellər sınanır (təkrarsız), sonra xəta qaytarılır
  assert.deepEqual(urls.map((u) => u.match(/models\/([^:]+):/)[1]), ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"]);
});

test("/ai-check: uğur, yanlış açar, açar yoxdur", async () => {
  mode = "ok";
  let r = await (await realFetch(base + "/ai-check")).json();
  assert.equal(r.ok, true); assert.equal(r.model, "gemini-flash-latest");
  mode = "bad_key";
  const res = await realFetch(base + "/ai-check");
  r = await res.json();
  assert.equal(res.status, 502); assert.equal(r.ok, false); assert.equal(r.reason, "INVALID_ARGUMENT");
  assert.ok(!JSON.stringify(r).includes("test-key"));
  const h = await (await realFetch(base + "/health")).json();
  assert.equal(h.model, "gemini-flash-latest"); assert.equal(h.ai, true); assert.ok(h.version);
});

test("şəbəkə xətası 502, sorğu limiti 429 (dəqiqədə 5 sual)", async () => {
  mode = "network";
  const res = await ask({ question: "Salam" });
  assert.equal(res.status, 502);
  // Bu faylda artıq 4 /advise sorğusu göndərilib; 5-ci keçir, 6-cı bloklanır
  mode = "ok";
  assert.equal((await ask({ question: "Salam" })).status, 429);
});

test("köməkçi funksiyalar", () => {
  assert.deepEqual(extractAnswer({ candidates: [{ content: { parts: [{ text: " a " }, { text: "b" }] } }] }), { text: "a b", reason: null });
  assert.equal(extractAnswer(null).reason, "EMPTY_RESPONSE");
  assert.equal(generationConfig("gemini-2.0-flash", 100).thinkingConfig, undefined);
  assert.equal(generationConfig("gemini-2.5-pro", 100).thinkingConfig, undefined);
  assert.equal(generationConfig("gemini-2.5-flash-lite", 100).thinkingConfig.thinkingBudget, 0);
  assert.equal(generationConfig("gemini-2.5-flash", 100).maxOutputTokens, 100);
  assert.deepEqual(generationConfig("gemini-3.5-flash", 100), { maxOutputTokens: 4096 });
  assert.deepEqual(generationConfig("gemini-flash-latest", 8000), { maxOutputTokens: 8000 });
});
