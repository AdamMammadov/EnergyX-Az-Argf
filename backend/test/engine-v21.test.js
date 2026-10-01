// v2.1 funksiyalarının testləri: qaz, diaqnoz, doğrulama, kəsinti, nailiyyətlər
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../../frontend/js/engine.js");

const seasonal = (vals, startMonth = 0) =>
  vals.map((k, i) => ({ month: E.monthKey(2026, startMonth + i), kwh: Math.round(k * E.seasonalFactor(startMonth + i)) }));

test("qaz: illik pillələr kumulyativ hesablanır", () => {
  assert.deepEqual(E.gasCost(100, 0).cost, 12.5);
  const c = E.gasCost(150, 1100); // 100 m³ × 12.5q + 50 m³ × 20q
  assert.equal(c.cost, 22.5);
  assert.equal(c.tier, "mid");
  assert.equal(E.gasCost(100, 2500).cost, 25);
  assert.equal(E.gasCost(0, 0).cost, 0);
});

test("qaz: mövsümi profilin orta dəyəri 1, qış yaydan çoxdur", () => {
  const mean = E.GAS_SEASON.reduce((s, v) => s + v, 0) / 12;
  assert.ok(Math.abs(mean - 1) < 1e-9);
  assert.ok(E.GAS_SEASON[0] > 3 * E.GAS_SEASON[6]);
});

test("qaz proqnozu: 1200 m³ həddinin keçildiyi ay tapılır", () => {
  const f = E.gasForecast(300, 9, 950); // oktyabr, artıq 950 m³ → bu ay 1200-ü keçir
  assert.equal(f.months[0].monthIdx, 9);
  assert.equal(f.cross1200, 9);
  assert.ok(f.yearEndCumulative > 1200);
  const none = E.gasForecast(20, 6, 0);
  assert.equal(none.cross1200, null);
});

test("sızma testi", () => {
  assert.equal(E.gasLeakTest(100.000, 100.000, 8).status, "ok");
  const r = E.gasLeakTest(100.000, 100.004, 8);
  assert.equal(r.status, "leak");
  assert.equal(E.gasLeakTest(100, 99, 8).status, "invalid");
});

test("diaqnoz: sıfır göstərici → sayğac nasazlığı", () => {
  const f = E.diagnoseMeter(seasonal([220, 215, 225, 218, 222, 0]));
  assert.equal(f[0].type, "meter_zero");
});

test("diaqnoz: davamlı kəskin azalma → şübhəli (kritik)", () => {
  const f = E.diagnoseMeter(seasonal([210, 205, 215, 208, 212, 90, 85, 80]));
  const d = f.find((x) => x.type === "suspicious_drop");
  assert.ok(d);
  assert.equal(d.severity, "critical");
  assert.equal(f[0].type, "suspicious_drop"); // ən ciddi birinci
});

test("diaqnoz: stabil seriyada heç nə tapılmır", () => {
  assert.deepEqual(E.diagnoseMeter(seasonal([220, 218, 222, 219, 221, 220, 223, 218])), []);
});

test("həssaslıq: həssas rejim daha çox bayraq qaldırır", () => {
  const r = seasonal([200, 205, 198, 202, 200, 245]);
  const count = (s) => E.detectAnomalies(r, E.SENSITIVITY[s]).filter((p) => p.level !== "none").length;
  assert.ok(count("sensitive") >= count("balanced"));
  assert.ok(count("balanced") >= count("careful"));
});

test("doğrulama: deterministikdir və tarazlıq gözlənildiyi kimidir", () => {
  const a = E.validateDetector({ n: 120 }), b = E.validateDetector({ n: 120 });
  assert.deepEqual(a, b);
  const bal = a.sweep.find((r) => r.z === 3.5);
  assert.ok(bal.precision >= 0.9, `precision ${bal.precision}`);
  assert.ok(bal.recall >= 0.8, `recall ${bal.recall}`);
  // hədd artdıqca aşkarlama azalır, yanlış həyəcan artmır
  for (let i = 1; i < a.sweep.length; i++) {
    assert.ok(a.sweep[i].recall <= a.sweep[i - 1].recall);
    assert.ok(a.sweep[i].falseAlarmRatePct <= a.sweep[i - 1].falseAlarmRatePct);
  }
});

test("kəsinti planı: enerji və tutum", () => {
  const r = E.outagePlan([{ watts: 10 }, { watts: 150, duty: 0.4 }], 10);
  assert.equal(r.loadW, 70);
  assert.equal(r.wh, 700);
  assert.equal(r.capacityWh, Math.ceil(700 / 0.85 / 0.8));
  assert.equal(E.outagePlan([], 5).wh, 0);
});

test("nailiyyətlər və aylıq çağırış", () => {
  const s = E.sampleData(new Date(2026, 9, 1));
  const b = E.badges({ readings: s.readings, budget: 30, appliances: s.appliances, health: { score: 50 } });
  const get = (k) => b.find((x) => x.key === k);
  assert.ok(get("first").earned && get("streak12").earned && get("planner").earned && get("auditor").earned);
  assert.ok(!get("healthy").earned);
  const ch = E.monthlyChallenge(s.readings, new Date(2026, 9, 5));
  assert.equal(ch.month, "2026-10");
  assert.equal(ch.reference.month, "2026-09");
  assert.ok(ch.target > 0 && ch.current === null);
  assert.equal(E.monthlyChallenge([], new Date()), null);
});
