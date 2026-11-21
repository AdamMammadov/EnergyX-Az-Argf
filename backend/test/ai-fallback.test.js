// Köhnəlmiş model (məs. 1 iyun 2026-da bağlanan gemini-2.0-flash) konfiqurasiya olunubsa,
// backend avtomatik "gemini-flash-latest" ləqəbinə keçir və işləyən modeli yadda saxlayır.
const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("os");
const path = require("path");

process.env.STATS_FILE = path.join(os.tmpdir(), `energyx-fb-${process.pid}.json`);
process.env.GEMINI_API_KEY = "test-key-456";
process.env.GEMINI_MODEL = "gemini-2.0-flash";

const realFetch = globalThis.fetch;
const models = [];
let busy = new Set();   // bu modellər 503 "high demand" qaytarır
globalThis.fetch = async (url, opts) => {
  if (!String(url).includes("generativelanguage.googleapis.com")) return realFetch(url, opts);
  const model = String(url).match(/models\/([^:]+):/)[1];
  models.push(model);
  const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
  if (model === "gemini-2.0-flash") return json(404, { error: { code: 404, status: "NOT_FOUND", message: "models/gemini-2.0-flash is no longer available" } });
  if (busy.has(model)) return json(503, { error: { code: 503, status: "UNAVAILABLE", message: "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later." } });
  return json(200, { candidates: [{ content: { parts: [{ text: `cavab (${model})` }] }, finishReason: "STOP" }] });
};

const { app } = require("../server");
let server, base;
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
test.after(() => new Promise((r) => server.close(r)));
const ask = () => realFetch(base + "/advise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "Salam" }) });

test("bağlanmış model → ehtiyat ləqəb, sonrakı sorğular birbaşa işləyən modelə gedir", async () => {
  let res = await ask();
  assert.equal(res.status, 200);
  assert.equal((await res.json()).answer, "cavab (gemini-flash-latest)");
  assert.deepEqual(models, ["gemini-2.0-flash", "gemini-flash-latest"]);
  models.length = 0;
  res = await ask();
  assert.equal(res.status, 200);
  assert.deepEqual(models, ["gemini-flash-latest"]);          // köhnə model yenidən sınanmır
  const h = await (await realFetch(base + "/health")).json();
  assert.equal(h.model, "gemini-flash-latest");
  const c = await (await realFetch(base + "/ai-check")).json();
  assert.equal(c.ok, true); assert.equal(c.model, "gemini-flash-latest");
});

test("503 'high demand': həmin sorğu ehtiyat modellə cavablanır, əsas model dəyişmir", async () => {
  busy = new Set(["gemini-flash-latest"]); models.length = 0;
  const res = await ask();
  assert.equal(res.status, 200);
  assert.equal((await res.json()).answer, "cavab (gemini-flash-lite-latest)");
  // bağlanmış 2.0-flash yenidən sınanmır, əsas model yüklənib → lite ilə cavab
  assert.deepEqual(models, ["gemini-flash-latest", "gemini-flash-lite-latest"]);
  const h = await (await realFetch(base + "/health")).json();
  assert.equal(h.model, "gemini-flash-latest");                  // müvəqqəti yüklənmə əsas modeli dəyişmir
});

test("bütün modellər yüklənib: hamısı + əsas model fasilədən sonra bir də sınanır, sonra 502 UNAVAILABLE", async () => {
  busy = new Set(["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"]); models.length = 0;
  const res = await ask();
  assert.equal(res.status, 502);
  assert.equal((await res.json()).reason, "UNAVAILABLE");
  assert.deepEqual(models, ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-flash-latest"]);
  busy = new Set();
});
