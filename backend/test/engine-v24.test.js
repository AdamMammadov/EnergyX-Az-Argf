// v2.4: ağıllı sayğac simulyasiyası, CSV idxalı, yük profili analizi, vizual izah
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../../frontend/js/engine.js");

const NOW = new Date(2026, 10, 21);
const apps = [
  { name: "Soyuducu", watts: 150, hours: 10, monthlyKwh: 45 },
  { name: "Kondisioner", watts: 1000, hours: 4, monthlyKwh: 120 },
  { name: "Televizor", watts: 100, hours: 5, monthlyKwh: 15 },
];

test("simulyasiya: saatlıq nöqtələr, aylıq enerji cihazlarla uyğundur", () => {
  const pts = E.simulateLoadProfile({ appliances: apps, days: 28, end: NOW, seed: 3, standbyW: 0, noise: 0 });
  assert.equal(pts.length, 28 * 24);
  const total = pts.reduce((s, p) => s + p.kwh, 0);
  const expected = (45 + 120 + 15) / 30 * 28;
  assert.ok(Math.abs(total - expected) / expected < 0.02, `total ${total} vs ${expected}`);
  assert.ok(pts.every((p) => p.kwh >= 0));
  // Kondisioner gecə 03:00-da işləmir, axşam işləyir
  const a = E.analyzeLoadProfile(pts);
  assert.ok(a.hourlyAvgKw[20] > a.hourlyAvgKw[4] * 3);
});

test("simulyasiya deterministikdir (eyni seed → eyni nəticə)", () => {
  const a = E.simulateLoadProfile({ appliances: apps, days: 7, end: NOW, seed: 9 });
  const b = E.simulateLoadProfile({ appliances: apps, days: 7, end: NOW, seed: 9 });
  assert.deepEqual(a, b);
});

test("nümunə profil: 2 gecə anomaliyası tapılır, yüksək baza yükü tövsiyəsi verilir", () => {
  const a = E.analyzeLoadProfile(E.sampleMeterProfile(NOW));
  assert.equal(a.events.length, 2);
  assert.ok(a.events.every((e) => e.type === "night" && e.extraKwh > 5));
  const keys = E.profileInsights(a).map((i) => i.key);
  assert.ok(keys.includes("anomaly_night"));
  assert.ok(keys.includes("baseload_high") || keys.includes("baseload_mid"));
  assert.equal(a.weekHour.length, 7);
  assert.equal(a.weekHour[0].length, 24);
});

test("stabil profildə yanlış həyəcan yoxdur", () => {
  const pts = E.simulateLoadProfile({ appliances: apps, days: 28, end: NOW, seed: 5, noise: 0.08 });
  assert.equal(E.analyzeLoadProfile(pts).events.length, 0);
});

test("baza yükü: sabit 100 Vt yük düzgün ölçülür", () => {
  const pts = [];
  for (let h = 0; h < 72; h++) pts.push({ ts: new Date(2026, 9, 1, h).getTime(), kwh: 0.1 + (h % 24 === 20 ? 1 : 0) });
  const a = E.analyzeLoadProfile(pts);
  assert.equal(a.baseloadW, 100);
  assert.equal(a.peakHour, 20);
  assert.ok(Math.abs(a.standbyYearKwh - 876) < 1);
});

test("az məlumat (48 saatdan az) → null", () => {
  assert.equal(E.analyzeLoadProfile([{ ts: Date.now(), kwh: 1 }]), null);
  assert.equal(E.analyzeLoadProfile([]), null);
});

test("CSV: ISO, AZ formatı, ayrı saat sütunu, onluq vergül, Vt·saat çevrilməsi", () => {
  const r1 = E.parseMeterCsv("timestamp,kwh\n2026-10-01 00:00,0.412\n2026-10-01T01:00:00,0.385\n");
  assert.equal(r1.points.length, 2);
  assert.equal(r1.points[0].ts, new Date(2026, 9, 1, 0).getTime());
  assert.equal(r1.unit, "kWh");
  const r2 = E.parseMeterCsv("tarix;saat;kVt\n01.10.2026;13;0,5\n01.10.2026;14:00;0,25\nxəta;x;1\n");
  assert.equal(r2.points.length, 2);
  assert.equal(r2.points[0].kwh, 0.5);
  assert.equal(r2.points[1].ts, new Date(2026, 9, 1, 14).getTime());
  assert.equal(r2.skipped, 1);
  const r3 = E.parseMeterCsv("2026-10-01 00:00\t412\n2026-10-01 01:00\t380\n");
  assert.equal(r3.unit, "Wh");
  assert.equal(r3.points[0].kwh, 0.412);
  assert.ok(Number.isNaN(E.parseMeterDate("2026-13-01")));
});

test("CSV ixrac → idxal eyni məlumatı qaytarır; 15 dəq. məlumat saatlıq cəmlənir", () => {
  const pts = E.simulateLoadProfile({ appliances: apps, days: 3, end: NOW, seed: 1 });
  const back = E.parseMeterCsv(E.profileToCsv(pts)).points;
  assert.equal(back.length, pts.length);
  back.forEach((p, i) => { assert.equal(p.ts, pts[i].ts); assert.ok(Math.abs(p.kwh - pts[i].kwh) < 0.0006); });
  const q = [];
  for (let i = 0; i < 4 * 60; i++) q.push({ ts: new Date(2026, 9, 1, 0, i * 15).getTime(), kwh: 0.05 });
  const a = E.analyzeLoadProfile(q);
  assert.equal(a.hours, 60);
  assert.ok(Math.abs(a.hourlyAvgKw[5] - 0.2) < 1e-9);
});

test("tarif pillələrinin bölgüsü cəmi tarifə bərabərdir", () => {
  for (const k of [0, 150, 200, 250, 300, 330, 600]) {
    const rows = E.tierBreakdown(k);
    assert.equal(rows.length, 3);
    const sumCost = Math.round(rows.reduce((s, r) => s + r.cost, 0) * 100) / 100;
    assert.equal(sumCost, E.calcTariff(k).cost, `kwh=${k}`);
    assert.equal(Math.round(rows.reduce((s, r) => s + r.used, 0)), k);
  }
});

test("enerji axını: itki 7.6%, hissələr istifadəni aşmır", () => {
  const f = E.energyFlow(300, apps);
  assert.ok(Math.abs(f.loss - (300 / (1 - 0.076) - 300)) < 0.05);
  const sum = f.parts.reduce((s, p) => s + p.kwh, 0);
  assert.ok(Math.abs(sum - 300) < 0.1);
  assert.ok(f.parts.some((p) => p.key === "unknown")); // 180 kVt cihaz + 120 naməlum
  const big = E.energyFlow(100, apps); // cihazlar istifadədən çoxdur → miqyaslanır
  assert.ok(Math.abs(big.parts.reduce((s, p) => s + p.kwh, 0) - 100) < 0.1);
  assert.deepEqual(E.energyFlow(50, []).parts.map((p) => p.key), ["unknown"]);
});
