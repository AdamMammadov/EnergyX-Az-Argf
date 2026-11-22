// Statistika anbarı: Upstash Redis (saxta REST API ilə), lokal fayl, köhnə formatın oxunması
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createStatsStore, today, lastDays } = require("../stats-store");

// Upstash REST pipeline-ın sadə saxta versiyası (yaddaşda hash-lər)
function fakeUpstash() {
  const db = new Map(), calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push({ url, auth: opts.headers.Authorization, body: JSON.parse(opts.body) });
    const out = JSON.parse(opts.body).map(([cmd, key, ...args]) => {
      const h = db.get(key) || new Map(); db.set(key, h);
      if (cmd === "HINCRBY") { h.set(args[0], (Number(h.get(args[0])) || 0) + Number(args[1])); return { result: h.get(args[0]) }; }
      if (cmd === "HSETNX") { if (h.has(args[0])) return { result: 0 }; h.set(args[0], args[1]); return { result: 1 }; }
      if (cmd === "HGETALL") return { result: [...h.entries()].flatMap(([k, v]) => [k, String(v)]) };
      return { error: "ERR unknown command " + cmd };
    });
    return new Response(JSON.stringify(out), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  return { db, calls, fetchImpl };
}

test("Upstash: sayğaclar, gün, dil, başlanğıc tarixi; açar başlıqda", async () => {
  const up = fakeUpstash();
  const s = createStatsStore({ UPSTASH_REDIS_REST_URL: "https://x.upstash.io/", UPSTASH_REDIS_REST_TOKEN: "tok" }, up.fetchImpl);
  assert.equal(s.kind, "redis");
  await s.add("visits", 1, "az");
  await s.add("visits", 1, "ru");
  await s.add("calculations");
  await s.add("savings_cents", 350);
  assert.equal(up.calls[0].url, "https://x.upstash.io/pipeline");
  assert.equal(up.calls[0].auth, "Bearer tok");
  const t = await s.totals();
  assert.equal(t.totals.visits, 2);
  assert.equal(t.totals.calculations, 1);
  assert.equal(t.totals.savings_cents, 350);
  assert.deepEqual(t.languages, { az: "1", ru: "1" });
  assert.equal(t.since, today());
  const d = await s.daily(3);
  assert.equal(d.length, 3);
  assert.equal(d[2].date, today());
  assert.equal(d[2].visits, 2);
  assert.equal(d[0].visits, 0);
});

test("Upstash xətası istisna atır (server 503 qaytarır)", async () => {
  const s = createStatsStore({ UPSTASH_REDIS_REST_URL: "https://x", UPSTASH_REDIS_REST_TOKEN: "t" },
    async () => new Response("no", { status: 401 }));
  await assert.rejects(() => s.add("visits"), /Upstash HTTP 401/);
});

test("Fayl: köhnə format oxunur, yeni formatda yazılır", async () => {
  const file = path.join(os.tmpdir(), `energyx-old-${process.pid}.json`);
  fs.writeFileSync(file, JSON.stringify({ totalCalculations: 7, totalSavingsIdentified: 12.5, totalAiQuestions: 3,
    aiFeedbackUp: 1, aiFeedbackDown: 0, totalPdfExports: 2 }));
  const s = createStatsStore({ STATS_FILE: file });
  assert.equal(s.kind, "file");
  const t = await s.totals();
  assert.equal(t.totals.calculations, 7);
  assert.equal(t.totals.savings_cents, 1250);
  await s.add("calculations");
  const saved = JSON.parse(fs.readFileSync(file, "utf-8"));
  assert.equal(saved.totals.calculations, 8);
  assert.equal(saved.days[today()].calculations, 1);
  fs.unlinkSync(file);
});

test("günlər Bakı vaxtı ilə, ardıcıl və təkrarsız", () => {
  const d = lastDays(5, new Date("2026-03-01T21:30:00Z"));   // Bakıda artıq 2 mart
  assert.deepEqual(d, ["2026-02-26", "2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02"]);
});

test("Upstash dəyərləri dırnaqla kopyalananda da işləyir", async () => {
  const up = fakeUpstash();
  const s = createStatsStore({ UPSTASH_REDIS_REST_URL: ' "https://y.upstash.io" ', UPSTASH_REDIS_REST_TOKEN: '"tok2"\n' }, up.fetchImpl);
  await s.add("visits");
  assert.equal(up.calls[0].url, "https://y.upstash.io/pipeline");
  assert.equal(up.calls[0].auth, "Bearer tok2");
  assert.equal(s.lastError, null);
});

test("Upstash xətası lastError-da görünür, açar gizlədilir", async () => {
  const s = createStatsStore({ UPSTASH_REDIS_REST_URL: "https://z.upstash.io", UPSTASH_REDIS_REST_TOKEN: "secret-token" },
    async () => new Response(JSON.stringify({ error: "WRONGPASS invalid password secret-token" }), { status: 401 }));
  await assert.rejects(() => s.totals());
  assert.match(s.lastError, /Upstash HTTP 401: WRONGPASS/);
  assert.ok(!s.lastError.includes("secret-token"));
});
