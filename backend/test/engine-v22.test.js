// v2.2: hesab yoxlayıcısı və köhnə/yeni cihaz müqayisəsi
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../../frontend/js/engine.js");

test("hesab yoxlayıcısı: düzgün, artıq və əskik hesab", () => {
  assert.equal(E.billCheck(250, 21.8).status, "ok");
  assert.equal(E.billCheck(250, 21.84).status, "ok"); // yuvarlaqlaşdırma tolerantlığı
  const over = E.billCheck(250, 25);
  assert.equal(over.status, "over");
  assert.equal(over.diff, 3.2);
  assert.equal(over.impliedKwh, 282);
  assert.equal(E.billCheck(250, 20).status, "under");
  assert.equal(E.billCheck(-1, 5), null);
  assert.equal(E.billCheck(0, 0).status, "ok");
});

test("cihaz müqayisəsi: pilləli tarifə görə qənaət və geri ödəmə", () => {
  const r = E.compareAppliances({ oldW: 200, newW: 90, hours: 10, price: 700, baseKwh: 320 });
  assert.equal(r.savedKwhMonth, 33);
  // 320 → 287 kVt: 20 kVt × 15q + 13 kVt × 10q = 4.30 ₼
  assert.equal(r.monthlyAzn, 4.3);
  assert.equal(r.paybackMonths, Math.round((700 / 4.3) * 10) / 10);
  assert.equal(r.tenYearNet, Math.round((4.3 * 120 - 700) * 100) / 100);
});

test("cihaz müqayisəsi: yeni cihaz daha çox işlədirsə geri ödəmə yoxdur", () => {
  const r = E.compareAppliances({ oldW: 90, newW: 200, hours: 10, price: 100, baseKwh: 150 });
  assert.ok(r.monthlyAzn < 0);
  assert.equal(r.paybackMonths, null);
});

test("cihaz müqayisəsi: Kalkulyatordakı istifadə qənaətdən az olsa belə mənfi olmur", () => {
  const r = E.compareAppliances({ oldW: 2000, newW: 0, hours: 10, price: 0, baseKwh: 50 });
  assert.equal(r.savedKwhMonth, 600);
  assert.ok(r.monthlyAzn > 0);
});
