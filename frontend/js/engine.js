// ==========================================
// EnergyX Az — Analitika mühərriki (təmiz funksiyalar, DOM yoxdur)
// Həm brauzerdə (window.EnergyEngine), həm Node testlərində
// (require) işləyir. Bütün hesablamalar istifadəçinin öz cihazında
// aparılır — heç bir məlumat serverə göndərilmir.
//
// İlham mənbələri (müəllifin əvvəlki layihələri):
//  - GridPulse: robust z-score anomaliya aşkarlanması + davamlılıq
//    (persistence) filtri, Bakı iqlim normalarına əsaslanan mövsümi
//    proqnoz, Dünya Bankı şəbəkə itkisi əmsalı
//  - PanoPulse: sağlamlıq balı, kök-səbəb faizli sıralaması, what-if
//    simulyatoru, xətti reqressiya ilə hədd geri sayımı, ROI/prioritet
// ==========================================
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.EnergyEngine = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ===== RƏSMİ TARİF (Tarif Şurası, 2026) =====
  const TIERS = [
    { max: 200, rate: 0.084 },
    { max: 300, rate: 0.10 },
    { max: Infinity, rate: 0.15 },
  ];
  const CO2_FACTOR = 0.719;              // kq CO₂/kVt·saat — Asian Transport Outlook, 2022
  const TREE_ABSORPTION_KG_YEAR = 21;    // 1 ağacın illik udumu (ümumi qəbul edilmiş orta)
  const CAR_KG_PER_KM = 0.17;            // orta minik avtomobili, təxmini
  const AZ_TD_LOSS_PCT = 7.6;            // ötürmə/paylama itkisi, 2023 — Dünya Bankı WDI
  const STANDBY_SHARE = 0.05;            // gözləmə rejimi payı — IEA: 5–10%, aşağı həddi götürülür

  // Bakının aylıq orta temperatur normaları (°C), yanvar → dekabr
  const BAKU_TEMP_C = [5.5, 6.5, 9.5, 14.5, 20.0, 25.5, 28.5, 28.0, 23.5, 17.5, 12.0, 7.5];

  function round2(x) { return Math.round(x * 100) / 100; }

  function calcTariff(kwh) {
    kwh = Math.max(0, Number(kwh) || 0);
    let cost = 0, prev = 0, tier = "low";
    const names = ["low", "mid", "high"];
    for (let i = 0; i < TIERS.length; i++) {
      const top = Math.min(kwh, TIERS[i].max);
      if (top > prev) cost += (top - prev) * TIERS[i].rate;
      if (kwh > prev) tier = names[i];
      prev = TIERS[i].max;
      if (kwh <= TIERS[i].max) break;
    }
    if (kwh === 0) tier = "low";
    return { cost: round2(cost), tier };
  }

  function marginalRate(kwh) {
    if (kwh <= 200) return TIERS[0].rate;
    if (kwh <= 300) return TIERS[1].rate;
    return TIERS[2].rate;
  }

  // Verilmiş büdcə (₼) ilə neçə kVt·saat istifadə etmək olar — tarifin tərsi
  function kwhForBudget(budget) {
    budget = Math.max(0, Number(budget) || 0);
    const c1 = 200 * TIERS[0].rate;           // 16.8
    const c2 = c1 + 100 * TIERS[1].rate;      // 26.8
    if (budget <= c1) return budget / TIERS[0].rate;
    if (budget <= c2) return 200 + (budget - c1) / TIERS[1].rate;
    return 300 + (budget - c2) / TIERS[2].rate;
  }

  // ===== MÖVSÜMİ AMİL (GridPulse: 1 + 0.028·|T − 20|) =====
  // Orta dəyəri 1 olacaq şəkildə normallaşdırılır: yayda kondisioner,
  // qışda qızdırıcı yükü artır.
  const _rawSeason = BAKU_TEMP_C.map((t) => 1 + 0.028 * Math.abs(t - 20));
  const _seasonMean = _rawSeason.reduce((s, v) => s + v, 0) / 12;
  const SEASON_FACTORS = _rawSeason.map((v) => v / _seasonMean);
  function seasonalFactor(monthIdx) { return SEASON_FACTORS[((monthIdx % 12) + 12) % 12]; }

  // "2026-03" → { y: 2026, m: 2 }
  function parseMonth(s) {
    const m = /^(\d{4})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    return { y: +m[1], m: +m[2] - 1 };
  }
  function monthKey(y, m) {
    const d = new Date(Date.UTC(y, m, 1));
    return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0");
  }

  function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const n = s.length;
    if (!n) return 0;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }

  // Sayğac oxunuşlarını aylara görə təmizləyir: eyni ay üçün sonuncu qalır,
  // xronoloji sıralanır. Giriş: [{month:"2026-03", kwh, ts?}]
  function normalizeSeries(readings) {
    const byMonth = {};
    (readings || []).forEach((r) => {
      if (!parseMonth(r.month) || !(Number(r.kwh) >= 0)) return;
      const prev = byMonth[r.month];
      if (!prev || (r.ts || 0) >= (prev.ts || 0)) byMonth[r.month] = r;
    });
    return Object.keys(byMonth).sort().map((k) => ({ month: k, kwh: Number(byMonth[k].kwh) }));
  }

  // ===== ANOMALİYA AŞKARLANMASI (GridPulse metodu, aylıq məlumata uyğunlaşdırılıb) =====
  // 1) Mövsümi təsir çıxarılır (Bakı iqlim amili)
  // 2) Əvvəlki ≤6 ay üzrə median/MAD ilə robust z-score
  // 3) Davamlılıq filtri: eyni istiqamətdə ardıcıl 2+ bayraq → "davamlı"
  const Z_WATCH = 2.5, Z_ANOMALY = 3.5, MIN_HISTORY = 3;

  function detectAnomalies(readings) {
    const series = normalizeSeries(readings);
    const out = series.map((p) => {
      const pm = parseMonth(p.month);
      return { month: p.month, kwh: p.kwh, factor: seasonalFactor(pm.m), adj: p.kwh / seasonalFactor(pm.m) };
    });
    out.forEach((p, i) => {
      p.level = "none"; p.z = 0; p.direction = 0; p.expected = null;
      if (i < MIN_HISTORY) return;
      const base = out.slice(Math.max(0, i - 6), i).map((q) => q.adj);
      const med = median(base);
      const mad = median(base.map((v) => Math.abs(v - med)));
      // MAD çox kiçik olanda (stabil istifadə) mediannın 8%-i minimum səpələnmə kimi götürülür
      const scale = Math.max(mad / 0.6745, med * 0.08, 1);
      p.z = round2((p.adj - med) / scale);
      p.expected = Math.round(med * p.factor);
      p.direction = p.z > 0 ? 1 : -1;
      const az = Math.abs(p.z);
      p.level = az >= Z_ANOMALY ? "anomaly" : az >= Z_WATCH ? "watch" : "none";
    });
    // Davamlılıq: iki ardıcıl bayraqlı ay eyni istiqamətdə
    out.forEach((p, i) => {
      p.sustained = false;
      if (p.level === "none" || i === 0) return;
      const q = out[i - 1];
      if (q.level !== "none" && q.direction === p.direction) { p.sustained = true; q.sustained = true; }
    });
    out.forEach((p) => { p.cause = p.level === "none" ? null : guessCause(p); });
    return out;
  }

  // Səbəb təxmini — qayda-əsaslı, ehtimal kimi təqdim olunur (fakt kimi yox)
  function guessCause(p) {
    if (p.direction > 0) return p.sustained ? "up_sustained" : "up_spike";
    return p.sustained ? "down_sustained" : "down_spike";
  }

  // ===== TREND (deseasonalized, ən kiçik kvadratlar) — %/ay =====
  function linearSlope(ys) {
    const n = ys.length;
    if (n < 2) return 0;
    const mx = (n - 1) / 2;
    const my = ys.reduce((s, v) => s + v, 0) / n;
    let num = 0, den = 0;
    ys.forEach((y, x) => { num += (x - mx) * (y - my); den += (x - mx) * (x - mx); });
    return den ? num / den : 0;
  }
  function trendPctPerMonth(readings) {
    // Təsdiqlənmiş anomaliyalar trendə daxil edilmir (onlar ayrıca cərimələnir)
    const pts = detectAnomalies(readings).filter((p) => p.level !== "anomaly").slice(-6);
    if (pts.length < 3) return 0;
    const ys = pts.map((p) => p.adj);
    const mean = ys.reduce((s, v) => s + v, 0) / ys.length;
    return mean ? round2((linearSlope(ys) / mean) * 100) : 0;
  }

  // ===== 12 AYLIQ MÖVSÜMİ PROQNOZ + 95% ETİBARLILIQ İNTERVALI =====
  // fallbackKwh: oxunuş yoxdursa, Kalkulyatordakı cari ay dəyəri
  function forecastYear(readings, fallbackKwh, now) {
    now = now || new Date();
    const pts = detectAnomalies(readings);
    let level, cv, basis;
    const clean = pts.filter((p) => p.level !== "anomaly").slice(-6);
    if (clean.length >= 2) {
      const adj = clean.map((p) => p.adj);
      level = median(adj);
      const mean = adj.reduce((s, v) => s + v, 0) / adj.length;
      const sd = Math.sqrt(adj.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, adj.length - 1));
      cv = mean ? sd / mean : 0.15;
      basis = "history";
    } else {
      level = (Number(fallbackKwh) || 0) / seasonalFactor(now.getMonth());
      cv = 0.15;
      basis = "current";
    }
    cv = Math.min(0.4, Math.max(0.05, cv));
    const months = [];
    let totalKwh = 0, totalCost = 0, totalLow = 0, totalHigh = 0;
    for (let i = 1; i <= 12; i++) {
      const y = now.getFullYear(), m = now.getMonth() + i;
      const key = monthKey(y, m);
      const mi = ((m % 12) + 12) % 12;
      const kwh = level * seasonalFactor(mi);
      const lo = Math.max(0, kwh * (1 - 1.96 * cv));
      const hi = kwh * (1 + 1.96 * cv);
      const cost = calcTariff(kwh).cost;
      months.push({ month: key, monthIdx: mi, kwh: Math.round(kwh), low: Math.round(lo), high: Math.round(hi),
        cost, costLow: calcTariff(lo).cost, costHigh: calcTariff(hi).cost, tier: calcTariff(kwh).tier });
      totalKwh += kwh; totalCost += cost; totalLow += calcTariff(lo).cost; totalHigh += calcTariff(hi).cost;
    }
    const peak = months.reduce((a, b) => (b.kwh > a.kwh ? b : a), months[0]);
    return { months, basis, cv: round2(cv), totalKwh: Math.round(totalKwh), totalCost: round2(totalCost),
      totalCostLow: round2(totalLow), totalCostHigh: round2(totalHigh), peak };
  }

  // ===== AY İÇİ TEMP + PİLLƏ/BÜDCƏ GERİ SAYIMI (PanoPulse FailureCountdown) =====
  // readings: [{day, cum}] — ayın günü və həmin günədək yığılmış kVt·saat
  function monthPace(readings, daysInMonth, budget) {
    const pts = (readings || []).filter((r) => r.day >= 1 && r.cum >= 0).sort((a, b) => a.day - b.day);
    if (!pts.length) return null;
    let slope;
    if (pts.length === 1) slope = pts[0].cum / pts[0].day;
    else {
      // (0,0) nöqtəsi ayın başlanğıcı kimi əlavə olunur — sayğac ay başı sıfırlanır
      const xs = [0, ...pts.map((p) => p.day)], ys = [0, ...pts.map((p) => p.cum)];
      const n = xs.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
      let num = 0, den = 0;
      xs.forEach((x, i) => { num += (x - mx) * (ys[i] - my); den += (x - mx) ** 2; });
      slope = den ? num / den : 0;
    }
    slope = Math.max(0, slope);
    const last = pts[pts.length - 1];
    const projected = last.cum + slope * Math.max(0, daysInMonth - last.day);
    const dayFor = (target) => {
      if (last.cum >= target) return last.day;
      if (slope <= 0) return null;
      const d = last.day + (target - last.cum) / slope;
      return d <= daysInMonth ? Math.ceil(d) : null;
    };
    const res = {
      dailyKwh: round2(slope), lastDay: last.day, lastCum: last.cum,
      projectedKwh: Math.round(projected), projected: calcTariff(projected),
      crossings: [200, 300].map((t) => ({ threshold: t, day: dayFor(t) })),
      budget: null,
    };
    if (budget > 0) {
      const limitKwh = kwhForBudget(budget);
      res.budget = { amount: budget, limitKwh: Math.round(limitKwh), day: dayFor(limitKwh),
        over: projected > limitKwh, safeDailyKwh: round2(Math.max(0, limitKwh - last.cum) / Math.max(1, daysInMonth - last.day)) };
    }
    return res;
  }

  // ===== CİHAZ KATEQORİYALARI =====
  const CATEGORIES = {
    ac:           { keywords: ["kondisioner", "kondisoner", "conditioner", " ac", "кондиционер"], typical: 1000 },
    lighting:     { keywords: ["lampa", "işıq", "isiq", "light", "лампа", "свет"], typical: 15 },
    washer:       { keywords: ["paltaryuyan", "washing", "washer", "стиральн"], typical: 500 },
    fridge:       { keywords: ["soyuducu", "fridge", "refrigerator", "холодильник"], typical: 150 },
    water_heater: { keywords: ["su qızdırıcı", "su qizdirici", "kombi", "boiler", "water heater", "водонагреват", "бойлер"], typical: 1500 },
    heater:       { keywords: ["qızdırıcı", "qizdirici", "heater", "обогреват", "радиатор"], typical: 1500 },
    tv:           { keywords: ["televizor", "tv", "телевизор"], typical: 100 },
    computer:     { keywords: ["kompüter", "komputer", "computer", "laptop", "компьютер", "ноутбук"], typical: 200 },
    microwave:    { keywords: ["mikrodalğa", "mikrodalga", "microwave", "микроволнов"], typical: 800 },
    kettle:       { keywords: ["çaydan", "caydan", "kettle", "чайник"], typical: 2000 },
  };
  function classify(name) {
    const lower = " " + String(name || "").toLowerCase();
    for (const [cat, def] of Object.entries(CATEGORIES)) {
      if (def.keywords.some((k) => lower.includes(k))) return cat;
    }
    return "other";
  }
  function categoryKwh(appliances, cat) {
    return (appliances || []).filter((a) => classify(a.name) === cat).reduce((s, a) => s + (a.monthlyKwh || 0), 0);
  }

  // ===== ENERJİ SAĞLAMLIQ BALI (PanoPulse Health Score) =====
  // Ani xərcdən fərqli, uzunmüddətli göstərici: təkrarlanan anomaliyalar,
  // artan trend və effektivsiz cihazlar balı aşağı salır.
  function healthScore({ kwh, readings, appliances, budget }) {
    const factors = [];
    const add = (key, penalty) => { if (penalty > 0) factors.push({ key, penalty: Math.round(penalty) }); };
    const { tier } = calcTariff(kwh);
    add("tier", tier === "mid" ? 10 : tier === "high" ? 20 + Math.min(10, (kwh - 300) / 30) : 0);

    const trend = trendPctPerMonth(readings);
    add("trend", trend > 3 ? Math.min(15, trend * 1.5) : 0);

    const recent = detectAnomalies(readings).slice(-6);
    let anomPen = 0;
    recent.forEach((p) => {
      if (p.level === "anomaly") anomPen += 8;
      else if (p.level === "watch") anomPen += 4;
      if (p.sustained && p.direction > 0) anomPen += 3;
    });
    add("anomaly", Math.min(25, anomPen));

    const ineff = (appliances || []).filter((a) => a.typicalWatts && a.watts > a.typicalWatts * 1.2).length;
    add("devices", Math.min(15, ineff * 5));

    if (budget > 0 && calcTariff(kwh).cost > budget) add("budget", 10);

    const total = factors.reduce((s, f) => s + f.penalty, 0);
    const score = Math.max(0, Math.min(100, 100 - total));
    // Kök-səbəb faizli sıralaması (PanoPulse root_cause_ranking)
    factors.sort((a, b) => b.penalty - a.penalty);
    factors.forEach((f) => { f.share = total ? Math.round((f.penalty / total) * 100) : 0; });
    const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "E";
    return { score: Math.round(score), grade, factors, trend };
  }

  // ===== "ƏGƏR...?" SİMULYATORU (PanoPulse What-If) =====
  // Real vəziyyəti dəyişmir — yalnız proqnoz qaytarır.
  function whatIf({ kwh, appliances, levers }) {
    levers = levers || {};
    const parts = [];
    const ac = categoryKwh(appliances, "ac");
    const light = categoryKwh(appliances, "lighting");
    const washer = categoryKwh(appliances, "washer");
    const wh = categoryKwh(appliances, "water_heater");
    if (levers.acDegrees > 0 && ac > 0) parts.push({ key: "ac", kwh: ac * Math.min(0.35, 0.07 * levers.acDegrees) });
    if (levers.led && light > 0) parts.push({ key: "led", kwh: light * 0.8 });
    if (levers.washer30 && washer > 0) parts.push({ key: "washer", kwh: washer * 0.4 });
    if (levers.waterHeater && wh > 0) parts.push({ key: "water_heater", kwh: wh * 0.1 });
    if (levers.standby) parts.push({ key: "standby", kwh: kwh * STANDBY_SHARE });
    if (levers.topDeviceCut > 0 && appliances && appliances.length) {
      const top = appliances.reduce((m, a) => (a.monthlyKwh > m.monthlyKwh ? a : m), appliances[0]);
      parts.push({ key: "top", name: top.name, kwh: top.monthlyKwh * (levers.topDeviceCut / 100) });
    }
    const saved = Math.min(kwh, parts.reduce((s, p) => s + p.kwh, 0));
    const after = Math.max(0, kwh - saved);
    const before = calcTariff(kwh), now = calcTariff(after);
    return {
      parts: parts.map((p) => ({ ...p, kwh: round2(p.kwh) })),
      savedKwh: round2(saved), newKwh: Math.round(after),
      before, after: now, savedAzn: round2(before.cost - now.cost),
      yearlyAzn: round2((before.cost - now.cost) * 12),
      co2SavedKg: Math.round(saved * CO2_FACTOR), tierChanged: before.tier !== now.tier,
    };
  }

  // ===== SƏRMAYƏ GERİ ÖDƏMƏ + PRİORİTET (PanoPulse FinancialImpact + Top Priority) =====
  // Qiymətlər redaktə oluna bilən fərziyyələrdir (UI-da göstərilir).
  function investmentPlan({ kwh, appliances, prices, ledCount, plugCount }) {
    prices = Object.assign({ led: 3, inverter: 900, fridge: 1100, plug: 25 }, prices || {});
    const opts = [];
    const n = Math.max(0, ledCount || 0);
    if (n > 0) opts.push({ key: "led", cost: prices.led * n, kwh: n * (51 / 1000) * 5 * 30 }); // 60W→9W, 5 saat/gün
    const ac = categoryKwh(appliances, "ac");
    if (ac > 0) opts.push({ key: "inverter", cost: prices.inverter, kwh: ac * 0.3 });
    const fridge = categoryKwh(appliances, "fridge");
    if (fridge > 15) opts.push({ key: "fridge", cost: prices.fridge, kwh: Math.max(0, fridge - 13) }); // A+++ ≈ 150 kVt/il
    const p = Math.max(0, plugCount || 0);
    if (p > 0) opts.push({ key: "plug", cost: prices.plug * p, kwh: Math.min(kwh * STANDBY_SHARE, p * 3) });

    const rows = opts.map((o) => {
      const saved = Math.min(o.kwh, kwh);
      const monthly = round2(calcTariff(kwh).cost - calcTariff(kwh - saved).cost);
      const payback = monthly > 0 ? o.cost / monthly : Infinity;
      return { key: o.key, cost: round2(o.cost), kwh: round2(saved), monthlyAzn: monthly,
        paybackMonths: isFinite(payback) ? Math.round(payback * 10) / 10 : null,
        fiveYearNet: round2(monthly * 60 - o.cost), co2Year: Math.round(saved * 12 * CO2_FACTOR) };
    });
    // Çəkili prioritet: qənaət (50%), sürətli geri ödəmə (30%), CO₂ (20%)
    const maxM = Math.max(1e-9, ...rows.map((r) => r.monthlyAzn));
    const maxC = Math.max(1e-9, ...rows.map((r) => r.co2Year));
    rows.forEach((r) => {
      const pb = r.paybackMonths == null ? 0 : 1 / (1 + r.paybackMonths / 12);
      let pr = 0.5 * (r.monthlyAzn / maxM) + 0.3 * pb + 0.2 * (r.co2Year / maxC);
      if (r.fiveYearNet < 0) pr *= 0.5; // 5 ildə özünü ödəməyən tədbir arxaya keçir
      r.priority = Math.round(pr * 100);
    });
    rows.sort((a, b) => b.priority - a.priority);
    return rows;
  }

  // ===== EKOLOJİ (ESG) TƏSİR =====
  function ecoImpact(yearKwh) {
    const co2 = yearKwh * CO2_FACTOR;
    const lossKwh = yearKwh / (1 - AZ_TD_LOSS_PCT / 100) - yearKwh;
    return {
      co2Kg: Math.round(co2), trees: round2(co2 / TREE_ABSORPTION_KG_YEAR),
      carKm: Math.round(co2 / CAR_KG_PER_KM), gridLossKwh: Math.round(lossKwh),
      gridLossCo2Kg: Math.round(lossKwh * CO2_FACTOR),
    };
  }

  // ===== NÜMUNƏ MƏLUMAT (təqdimat/demo üçün; açıq şəkildə "nümunə" etiketlənir) =====
  function sampleData(now) {
    now = now || new Date();
    const base = 230;
    const readings = [];
    for (let i = 12; i >= 1; i--) {
      const y = now.getFullYear(), m = now.getMonth() - i;
      const mi = ((m % 12) + 12) % 12;
      let kwh = base * seasonalFactor(mi) * (1 + 0.03 * Math.sin(i * 1.7));
      if (i <= 2) kwh *= 1.45; // son 2 ay: su qızdırıcısının termostat nasazlığı ssenarisi
      readings.push({ month: monthKey(y, m), kwh: Math.round(kwh), ts: Date.UTC(y, mi, 28) });
    }
    const appliances = [
      { name: "Soyuducu", watts: 190, hours: 10 },
      { name: "Kondisioner", watts: 1200, hours: 5 },
      { name: "Lampalar (közərmə, 5 əd.)", watts: 300, hours: 5 },
      { name: "Su qızdırıcı", watts: 1500, hours: 2 },
      { name: "Televizor", watts: 120, hours: 5 },
      { name: "Paltaryuyan", watts: 500, hours: 1 },
    ].map((a) => ({ ...a, monthlyKwh: (a.watts / 1000) * a.hours * 30,
      typicalWatts: (CATEGORIES[classify(a.name)] || {}).typical || null }));
    return { meterName: "Nümunə ev", readings, appliances };
  }

  return {
    TIERS, CO2_FACTOR, TREE_ABSORPTION_KG_YEAR, AZ_TD_LOSS_PCT, BAKU_TEMP_C, SEASON_FACTORS,
    calcTariff, marginalRate, kwhForBudget, seasonalFactor, parseMonth, monthKey, median,
    normalizeSeries, detectAnomalies, trendPctPerMonth, forecastYear, monthPace,
    classify, categoryKwh, healthScore, whatIf, investmentPlan, ecoImpact, sampleData,
  };
});
