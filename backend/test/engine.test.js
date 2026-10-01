// Frontend analitika mühərrikinin testləri (frontend/js/engine.js)
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../../frontend/js/engine.js");
const { calculateTariff } = require("../tariff");

test("tarif: pillə sərhədləri rəsmi rəqəmlərə uyğundur", () => {
  assert.deepEqual(E.calcTariff(0), { cost: 0, tier: "low" });
  assert.deepEqual(E.calcTariff(200), { cost: 16.8, tier: "low" });
  assert.deepEqual(E.calcTariff(201), { cost: 16.9, tier: "mid" });
  assert.deepEqual(E.calcTariff(300), { cost: 26.8, tier: "mid" });
  assert.deepEqual(E.calcTariff(301), { cost: 26.95, tier: "high" });
  assert.deepEqual(E.calcTariff(450), { cost: 49.3, tier: "high" });
});

test("tarif: frontend və backend eyni nəticə verir", () => {
  for (let k = 0; k <= 800; k += 7) assert.deepEqual(E.calcTariff(k), calculateTariff(k), `kwh=${k}`);
});

test("kwhForBudget tarifin tərsidir", () => {
  for (const b of [5, 16.8, 20, 26.8, 40, 75]) {
    assert.ok(Math.abs(E.calcTariff(E.kwhForBudget(b)).cost - b) < 0.02, `budget=${b}`);
  }
});

test("mövsümi amillərin orta dəyəri 1-dir", () => {
  const mean = E.SEASON_FACTORS.reduce((s, v) => s + v, 0) / 12;
  assert.ok(Math.abs(mean - 1) < 1e-9);
});

test("anomaliya: stabil seriyada yanlış həyəcan yoxdur", () => {
  const readings = [];
  for (let m = 0; m < 12; m++) readings.push({ month: E.monthKey(2025, m), kwh: Math.round(220 * E.seasonalFactor(m)) });
  const out = E.detectAnomalies(readings);
  assert.equal(out.filter((p) => p.level !== "none").length, 0);
});

test("anomaliya: davamlı artım aşkarlanır və səbəb verilir", () => {
  const s = E.sampleData(new Date(2026, 9, 1));
  const out = E.detectAnomalies(s.readings);
  const last2 = out.slice(-2);
  assert.ok(last2.every((p) => p.level === "anomaly" && p.direction === 1 && p.sustained));
  assert.equal(last2[1].cause, "up_sustained");
  assert.ok(out.slice(0, -2).every((p) => p.level === "none"));
});

test("anomaliya: tək kəskin azalma 'down_spike' kimi təsnif olunur", () => {
  const readings = [210, 205, 215, 208, 212, 60].map((kwh, i) => ({ month: E.monthKey(2026, 3 + i), kwh: Math.round(kwh * E.seasonalFactor(3 + i)) }));
  const last = E.detectAnomalies(readings).pop();
  assert.equal(last.level, "anomaly");
  assert.equal(last.cause, "down_spike");
});

test("normalizeSeries: eyni ay üçün sonuncu qeyd qalır, yanlış ay atılır", () => {
  const out = E.normalizeSeries([
    { month: "2026-01", kwh: 100, ts: 1 }, { month: "2026-01", kwh: 150, ts: 2 }, { month: "bad", kwh: 9 }, { month: "2025-12", kwh: 90 },
  ]);
  assert.deepEqual(out, [{ month: "2025-12", kwh: 90 }, { month: "2026-01", kwh: 150 }]);
});

test("proqnoz: 12 ay, interval nöqtə proqnozunu əhatə edir", () => {
  const f = E.forecastYear([], 250, new Date(2026, 0, 15));
  assert.equal(f.months.length, 12);
  assert.equal(f.basis, "current");
  f.months.forEach((m) => assert.ok(m.low <= m.kwh && m.kwh <= m.high));
  assert.ok(f.totalCostLow <= f.totalCost && f.totalCost <= f.totalCostHigh);
});

test("monthPace: xətti temp, hədd günləri və büdcə", () => {
  const r = E.monthPace([{ day: 5, cum: 60 }, { day: 10, cum: 120 }], 30, 30);
  assert.equal(r.dailyKwh, 12);
  assert.equal(r.projectedKwh, 360);
  assert.deepEqual(r.crossings.map((c) => c.day), [17, 25]);
  assert.equal(r.budget.over, true);
  assert.ok(r.budget.day >= 26 && r.budget.day <= 27);
  assert.equal(E.monthPace([], 30, 0), null);
});

test("sağlamlıq balı: ideal vəziyyət 100, problemlər balı salır", () => {
  assert.equal(E.healthScore({ kwh: 150, readings: [], appliances: [], budget: 0 }).score, 100);
  const s = E.sampleData(new Date(2026, 9, 1));
  const h = E.healthScore({ kwh: 330, readings: s.readings, appliances: s.appliances, budget: 30 });
  assert.ok(h.score < 60);
  assert.equal(h.factors.reduce((a, f) => a + f.share, 0) >= 98, true);
  assert.ok(h.factors.some((f) => f.key === "anomaly"));
});

test("what-if: real vəziyyəti dəyişmir və pillə dəyişimini göstərir", () => {
  const s = E.sampleData(new Date(2026, 9, 1));
  const before = JSON.stringify(s.appliances);
  const r = E.whatIf({ kwh: 330, appliances: s.appliances, levers: { acDegrees: 2, led: true, standby: true } });
  assert.equal(JSON.stringify(s.appliances), before);
  assert.ok(r.savedKwh > 0 && r.newKwh < 330);
  assert.equal(r.before.tier, "high");
  assert.ok(r.tierChanged);
  assert.equal(E.whatIf({ kwh: 200, appliances: [], levers: {} }).savedKwh, 0);
});

test("investisiya planı: geri ödəmə və prioritet sıralaması", () => {
  const s = E.sampleData(new Date(2026, 9, 1));
  const rows = E.investmentPlan({ kwh: 330, appliances: s.appliances, ledCount: 5, plugCount: 2 });
  assert.equal(rows[0].key, "led");
  rows.forEach((r, i) => { if (i) assert.ok(rows[i - 1].priority >= r.priority); });
  const led = rows.find((r) => r.key === "led");
  assert.ok(Math.abs(led.paybackMonths - led.cost / led.monthlyAzn) < 0.2);
});

test("cihaz təsnifatı üç dildə işləyir", () => {
  assert.equal(E.classify("Kondisioner Samsung"), "ac");
  assert.equal(E.classify("Air conditioner"), "ac");
  assert.equal(E.classify("Холодильник"), "fridge");
  assert.equal(E.classify("Su qızdırıcı"), "water_heater");
  assert.equal(E.classify("Elektrik qızdırıcı"), "heater");
  assert.equal(E.classify("Akvarium"), "other");
});

test("ekoloji təsir: rəsmi əmsallar", () => {
  const e = E.ecoImpact(1000);
  assert.equal(e.co2Kg, 719);
  assert.equal(e.gridLossKwh, Math.round(1000 / (1 - 0.076) - 1000));
});
