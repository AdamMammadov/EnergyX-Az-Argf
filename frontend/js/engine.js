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
  // Həssaslıq səviyyələri (GridPulse ThresholdExplorer): yanlış həyəcan ↔ aşkarlama tarazlığı
  const SENSITIVITY = {
    careful:   { anomaly: 4.5, watch: 3.0 },
    balanced:  { anomaly: Z_ANOMALY, watch: Z_WATCH },
    sensitive: { anomaly: 2.5, watch: 2.0 },
  };

  function detectAnomalies(readings, opts) {
    const zA = (opts && opts.anomaly) || Z_ANOMALY;
    const zW = (opts && opts.watch) || Z_WATCH;
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
      p.level = az >= zA ? "anomaly" : az >= zW ? "watch" : "none";
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
  function healthScore({ kwh, readings, appliances, budget, sensitivity }) {
    const factors = [];
    const add = (key, penalty) => { if (penalty > 0) factors.push({ key, penalty: Math.round(penalty) }); };
    const { tier } = calcTariff(kwh);
    add("tier", tier === "mid" ? 10 : tier === "high" ? 20 + Math.min(10, (kwh - 300) / 30) : 0);

    const trend = trendPctPerMonth(readings);
    add("trend", trend > 3 ? Math.min(15, trend * 1.5) : 0);

    const recent = detectAnomalies(readings, sensitivity).slice(-6);
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
      { name: "Lampa (közərmə)", watts: 60, hours: 5 },
      { name: "Su qızdırıcı", watts: 1500, hours: 2 },
      { name: "Televizor", watts: 120, hours: 5 },
      { name: "Paltaryuyan", watts: 500, hours: 1 },
    ].map((a) => ({ ...a, monthlyKwh: (a.watts / 1000) * a.hours * 30,
      typicalWatts: (CATEGORIES[classify(a.name)] || {}).typical || null }));
    return { meterName: "Nümunə ev", readings, appliances };
  }


  // =====================================================================
  // v2.1 — GridPulse/PanoPulse-dan əlavə ssenarilər
  // =====================================================================

  // ===== SAYĞAC DİAQNOZU (GridPulse diagnose_meters + SecurityAlertsPanel) =====
  // Nasazlığı icazəsiz müdaxilədən və real istifadə dəyişikliyindən ayırmağa çalışır.
  // Nəticələr ehtimaldır, fakt deyil — UI-da belə təqdim olunur.
  const DIAG_SEVERITY = { meter_zero: "high", suspicious_drop: "critical", sustained_rise: "high",
    spike: "medium", gradual_rise: "medium", gradual_decline: "low" };
  function diagnoseMeter(readings, opts) {
    const pts = detectAnomalies(readings, opts);
    const findings = [];
    if (pts.length < 2) return findings;
    // 1) Sıfır göstərici: əvvəl normal idi, sonra tam sıfır — sayğac/rabitə nasazlığı
    const zeros = pts.filter((p, i) => i > 0 && p.kwh === 0 && pts.slice(0, i).some((q) => q.kwh > 20));
    if (zeros.length) findings.push({ type: "meter_zero", months: zeros.map((p) => p.month) });
    // 2) Davamlı kəskin azalma (sıfır deyil): bypass / icazəsiz müdaxilə əlaməti ola bilər
    const drops = pts.filter((p) => p.sustained && p.direction < 0 && p.kwh > 0 && p.expected && p.kwh < p.expected * 0.65);
    if (drops.length >= 2) findings.push({ type: "suspicious_drop", months: drops.map((p) => p.month) });
    // 3) Davamlı artım: cihaz nasazlığı
    const rises = pts.filter((p) => p.sustained && p.direction > 0 && p.level !== "none");
    if (rises.length >= 2) findings.push({ type: "sustained_rise", months: rises.map((p) => p.month) });
    // 4) Tək pik
    const spikes = pts.filter((p) => !p.sustained && p.direction > 0 && p.level === "anomaly");
    if (spikes.length) findings.push({ type: "spike", months: spikes.map((p) => p.month) });
    // 5) Tədrici trend (anomaliya həddinə çatmayan, aylarla davam edən dəyişiklik)
    const trend = trendPctPerMonth(readings);
    const recent = pts.slice(-6).map((p) => p.month);
    if (pts.length >= 5 && trend <= -5) findings.push({ type: "gradual_decline", months: recent, trend });
    if (pts.length >= 5 && trend >= 5 && !rises.length) findings.push({ type: "gradual_rise", months: recent, trend });
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.forEach((f) => { f.severity = DIAG_SEVERITY[f.type]; });
    return findings.sort((a, b) => order[a.severity] - order[b.severity]);
  }

  // ===== METODUN DOĞRULANMASI (GridPulse real_data_validation + threshold sweep) =====
  // Real, açıq, sayğac-səviyyəli Azərbaycan datası mövcud olmadığı üçün (GridPulse-da
  // araşdırılıb), Bakı iqliminə kalibrlənmiş SİNTETİK ev təsərrüfatları yaradılır,
  // bilinən anomaliyalar "inject" edilir və detektorun dəqiqliyi ölçülür.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rnd) {
    const u = Math.max(1e-9, rnd()), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function syntheticHouseholds({ n = 300, months = 18, seed = 2026, anomalyShare = 0.3, noise = 0.06 } = {}) {
    const rnd = mulberry32(seed);
    const homes = [];
    for (let h = 0; h < n; h++) {
      const base = 120 + rnd() * 260;
      const readings = [], labels = [];
      for (let i = 0; i < months; i++) {
        const mi = i % 12;
        readings.push({ month: monthKey(2025, i), kwh: Math.max(0, Math.round(base * seasonalFactor(mi) * (1 + noise * gauss(rnd)))) });
        labels.push(false);
      }
      let type = "none";
      if (rnd() < anomalyShare) {
        const types = ["spike", "sustained_rise", "drop", "zero"];
        type = types[Math.floor(rnd() * types.length)];
        const at = 8 + Math.floor(rnd() * (months - 10)); // ən azı 8 ay normal tarixçə
        const span = type === "spike" ? 1 : 2 + Math.floor(rnd() * 2);
        const mult = type === "spike" ? 1.6 + rnd() * 0.6 : type === "sustained_rise" ? 1.35 + rnd() * 0.25
          : type === "drop" ? 0.4 + rnd() * 0.2 : 0;
        for (let k = at; k < Math.min(months, at + span); k++) {
          readings[k].kwh = Math.round(readings[k].kwh * mult);
          labels[k] = true;
        }
      }
      homes.push({ readings, labels, type });
    }
    return homes;
  }
  function validateDetector(opts) {
    opts = opts || {};
    const homes = syntheticHouseholds(opts);
    const thresholds = opts.thresholds || [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
    // z-score həddən asılı deyil — bir dəfə hesablanır
    const scored = homes.map((h) => ({ ...h, z: detectAnomalies(h.readings).map((p, i) => (i < MIN_HISTORY ? 0 : Math.abs(p.z))) }));
    const sweep = thresholds.map((th) => {
      let tp = 0, fp = 0, fn = 0, normalMonths = 0;
      const byType = {};
      scored.forEach((h) => {
        let hit = false;
        h.z.forEach((z, i) => {
          if (i < MIN_HISTORY) return;
          const flagged = z >= th;
          if (h.labels[i] && flagged) { tp++; hit = true; }
          else if (!h.labels[i] && flagged) fp++;
          else if (h.labels[i] && !flagged) fn++;
          if (!h.labels[i]) normalMonths++;
        });
        if (h.type !== "none") {
          byType[h.type] = byType[h.type] || { homes: 0, caught: 0 };
          byType[h.type].homes++;
          if (hit) byType[h.type].caught++;
        }
      });
      return {
        z: th,
        precision: tp + fp ? round2(tp / (tp + fp)) : 1,
        recall: tp + fn ? round2(tp / (tp + fn)) : 0,
        falseAlarmRatePct: normalMonths ? round2((fp / normalMonths) * 100) : 0,
        byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, round2(v.caught / v.homes)])),
      };
    });
    return { homes: homes.length, anomalous: homes.filter((h) => h.type !== "none").length,
      months: homes[0] ? homes[0].readings.length : 0, sweep };
  }

  // ===== TƏBİİ QAZ (GridPulse gas module) =====
  // Əhali üçün İLLİK həcmə görə pilləli tarif (Tarif Şurası).
  const GAS_TIERS = [
    { max: 1200, rate: 0.125 },
    { max: 2500, rate: 0.20 },
    { max: Infinity, rate: 0.25 },
  ];
  const GAS_CO2_KG_PER_M3 = 1.9; // təbii qazın yanmasından, təxmini (IPCC əmsalı əsasında)
  // Qaz istehlakının mövsümi profili: bişirmə + isti su (sabit) + istilik (Bakı temperaturuna görə)
  const _gasRaw = BAKU_TEMP_C.map((t) => 1 + 0.25 * Math.max(0, 18 - t));
  const _gasMean = _gasRaw.reduce((s, v) => s + v, 0) / 12;
  const GAS_SEASON = _gasRaw.map((v) => v / _gasMean);

  function gasCost(m3, priorThisYear) {
    m3 = Math.max(0, Number(m3) || 0);
    let from = Math.max(0, Number(priorThisYear) || 0);
    const to = from + m3;
    let cost = 0, prev = 0;
    const parts = [];
    GAS_TIERS.forEach((t, i) => {
      const lo = Math.max(from, prev), hi = Math.min(to, t.max);
      if (hi > lo) { cost += (hi - lo) * t.rate; parts.push({ tier: i, m3: round2(hi - lo), rate: t.rate }); }
      prev = t.max;
    });
    const tierIdx = to <= GAS_TIERS[0].max ? 0 : to <= GAS_TIERS[1].max ? 1 : 2;
    return { cost: round2(cost), tier: ["low", "mid", "high"][tierIdx], parts, cumulative: round2(to) };
  }

  // İl sonuna qədər proqnoz: hazırkı ay → dekabr, pillə keçid ayları ilə
  function gasForecast(m3ThisMonth, monthIdx, priorThisYear) {
    const level = (Number(m3ThisMonth) || 0) / GAS_SEASON[monthIdx];
    let cum = Math.max(0, Number(priorThisYear) || 0);
    const months = [];
    let cross1200 = null, cross2500 = null, total = 0;
    for (let m = monthIdx; m < 12; m++) {
      const use = m === monthIdx ? Number(m3ThisMonth) || 0 : level * GAS_SEASON[m];
      const c = gasCost(use, cum);
      if (cross1200 === null && cum <= 1200 && cum + use > 1200) cross1200 = m;
      if (cross2500 === null && cum <= 2500 && cum + use > 2500) cross2500 = m;
      cum += use; total += c.cost;
      months.push({ monthIdx: m, m3: Math.round(use), cost: c.cost, cumulative: Math.round(cum), tier: c.tier });
    }
    const yearEstimate = Math.round(level * GAS_SEASON.reduce((s, v) => s + v, 0));
    return { months, yearEndCumulative: Math.round(cum), restOfYearCost: round2(total), cross1200, cross2500,
      typicalYearM3: yearEstimate, typicalYearCost: gasCost(yearEstimate, 0).cost, co2Kg: Math.round(yearEstimate * GAS_CO2_KG_PER_M3) };
  }

  // Sızma testi: heç bir qaz cihazı işləmirkən sayğacın iki göstəricisi
  function gasLeakTest(start, end, hours) {
    const d = (Number(end) || 0) - (Number(start) || 0);
    const h = Math.max(0.1, Number(hours) || 0);
    if (d < 0) return { status: "invalid" };
    const perHour = d / h;
    // 0.001 m³ — mexaniki sayğacın ən kiçik bölgüsü
    return { status: d >= 0.001 ? "leak" : "ok", deltaM3: round2(d * 1000) / 1000, perHour: Math.round(perHour * 10000) / 10000,
      perMonthM3: round2(perHour * 24 * 30) };
  }

  // ===== KƏSİNTİ HAZIRLIĞI (GridPulse critical infra + disaster scenario, ev miqyasında) =====
  // devices: [{watts, duty (0..1), count}] → lazım olan enerji və tövsiyə olunan ehtiyat tutumu
  const INVERTER_EFF = 0.85, USABLE_DOD = 0.8, POWERBANK_WH = 37; // 10 000 mAh × 3.7 V
  function outagePlan(devices, hours) {
    hours = Math.max(0, Number(hours) || 0);
    const loadW = (devices || []).reduce((s, d) => s + (d.watts || 0) * (d.duty == null ? 1 : d.duty) * (d.count || 1), 0);
    const peakW = (devices || []).reduce((s, d) => s + (d.watts || 0) * (d.count || 1), 0);
    const wh = loadW * hours;
    const capacityWh = Math.ceil(wh / INVERTER_EFF / USABLE_DOD);
    return { loadW: Math.round(loadW), peakW: Math.round(peakW), wh: Math.round(wh), capacityWh,
      inverterW: Math.ceil((peakW * 1.25) / 100) * 100, powerbanks: Math.ceil(wh / (POWERBANK_WH * 0.85)) };
  }

  // ===== NAİLİYYƏTLƏR + AYLIQ ÇAĞIRIŞ (öyrənmə motivasiyası) =====
  function badges({ readings, budget, appliances, health }) {
    const series = normalizeSeries(readings);
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    let streak = 0;
    for (let i = series.length - 1; i >= 0; i--) {
      if (i === series.length - 1) { streak = 1; continue; }
      const a = parseMonth(series[i].month), b = parseMonth(series[i + 1].month);
      if ((b.y * 12 + b.m) - (a.y * 12 + a.m) === 1) streak++; else break;
    }
    const adj = (p) => p.kwh / seasonalFactor(parseMonth(p.month).m);
    return [
      { key: "first", earned: series.length >= 1, progress: Math.min(1, series.length) },
      { key: "streak3", earned: streak >= 3, progress: Math.min(1, streak / 3) },
      { key: "streak12", earned: streak >= 12, progress: Math.min(1, streak / 12) },
      { key: "low_tier", earned: !!last && last.kwh <= 200, progress: last ? Math.min(1, 200 / Math.max(1, last.kwh)) : 0 },
      { key: "saver", earned: !!(last && prev && adj(last) <= adj(prev) * 0.9), progress: last && prev ? Math.min(1, Math.max(0, (adj(prev) - adj(last)) / (adj(prev) * 0.1))) : 0 },
      { key: "planner", earned: budget > 0, progress: budget > 0 ? 1 : 0 },
      { key: "auditor", earned: (appliances || []).length >= 5, progress: Math.min(1, (appliances || []).length / 5) },
      { key: "healthy", earned: !!health && health.score >= 85, progress: health ? Math.min(1, health.score / 85) : 0 },
    ];
  }
  // Bu ay üçün hədəf: keçən ayın mövsümə görə düzəldilmiş səviyyəsindən 10% az
  function monthlyChallenge(readings, now) {
    now = now || new Date();
    const series = normalizeSeries(readings);
    const key = monthKey(now.getFullYear(), now.getMonth());
    const past = series.filter((p) => p.month < key);
    if (!past.length) return null;
    const ref = past[past.length - 1];
    const level = ref.kwh / seasonalFactor(parseMonth(ref.month).m);
    const target = Math.round(level * seasonalFactor(now.getMonth()) * 0.9);
    const current = series.find((p) => p.month === key);
    return { month: key, target, reference: ref, current: current ? current.kwh : null,
      targetCost: calcTariff(target).cost, done: current ? current.kwh <= target : null };
  }

  // =====================================================================
  // v2.2 — Hesab yoxlayıcısı və cihaz müqayisəsi
  // =====================================================================
  // Azərişıq hesabındakı kVt·saat və məbləğ rəsmi tariflə uyğun gəlirmi?
  function billCheck(kwh, amount) {
    kwh = Number(kwh); amount = Number(amount);
    if (!(kwh >= 0) || !(amount >= 0)) return null;
    const expected = calcTariff(kwh);
    const diff = round2(amount - expected.cost);
    const tolerance = Math.max(0.05, expected.cost * 0.01); // yuvarlaqlaşdırma üçün 1% / 5 qəpik
    const status = Math.abs(diff) <= tolerance ? "ok" : diff > 0 ? "over" : "under";
    return { expected: expected.cost, tier: expected.tier, diff, diffPct: expected.cost ? round2((diff / expected.cost) * 100) : 0,
      status, impliedKwh: Math.round(kwhForBudget(amount)) };
  }

  // Köhnə vs yeni cihaz: qənaət pilləli tarifə görə (cari istifadənin marjinal hissəsindən) hesablanır
  function compareAppliances({ oldW, newW, hours, price, baseKwh }) {
    oldW = Math.max(0, Number(oldW) || 0); newW = Math.max(0, Number(newW) || 0);
    hours = Math.min(24, Math.max(0, Number(hours) || 0)); price = Math.max(0, Number(price) || 0);
    baseKwh = Math.max(0, Number(baseKwh) || 0);
    const savedKwh = ((oldW - newW) / 1000) * hours * 30;
    let monthlyAzn;
    if (savedKwh >= 0) {
      const base = Math.max(baseKwh, savedKwh); // cari istifadə qənaətdən az ola bilməz
      monthlyAzn = calcTariff(base).cost - calcTariff(base - savedKwh).cost;
    } else {
      monthlyAzn = -(calcTariff(baseKwh - savedKwh).cost - calcTariff(baseKwh).cost);
    }
    monthlyAzn = round2(monthlyAzn);
    const payback = monthlyAzn > 0 ? price / monthlyAzn : null;
    return { savedKwhMonth: round2(savedKwh), monthlyAzn, yearlyAzn: round2(monthlyAzn * 12),
      paybackMonths: payback == null ? null : Math.round(payback * 10) / 10,
      tenYearNet: round2(monthlyAzn * 120 - price), co2YearKg: Math.round(savedKwh * 12 * CO2_FACTOR) };
  }

  // =====================================================================
  // v2.4 — Ağıllı sayğac AI laboratoriyası + vizual izah
  // Saatlıq (smart meter) məlumatın simulyasiyası, CSV idxalı, yük profili
  // analizi, saatlıq anomaliya aşkarlanması və qayda-əsaslı tövsiyələr.
  // =====================================================================

  // 24 saatlıq istifadə çəkiləri: [başlanğıc saat, son saat (daxil deyil), çəki], əsas = qalan saatlar
  function hourPattern(base, ranges) {
    const w = new Array(24).fill(base);
    ranges.forEach(([a, b, v]) => { for (let h = a; h < b; h++) w[h % 24] = v; });
    return w;
  }
  const HOUR_PATTERNS = {
    fridge:       hourPattern(1, [[12, 19, 1.2]]),                       // kompressor gün boyu, istidə çox
    ac:           hourPattern(0, [[0, 2, 1], [12, 17, 2], [17, 23, 3], [23, 24, 1.5]]),
    heater:       hourPattern(0.3, [[0, 2, 1.5], [6, 9, 2.5], [17, 24, 3]]),
    lighting:     hourPattern(0.05, [[0, 1, 1], [6, 8, 1], [18, 24, 3]]),
    tv:           hourPattern(0, [[8, 12, 0.5], [19, 24, 3]]),
    computer:     hourPattern(0.05, [[9, 18, 1.5], [20, 24, 2]]),
    washer:       hourPattern(0, [[10, 13, 2], [18, 20, 1]]),
    water_heater: hourPattern(0.2, [[6, 9, 3], [19, 23, 2.5]]),
    kettle:       hourPattern(0, [[7, 9, 3], [13, 14, 1.5], [17, 20, 2]]),
    microwave:    hourPattern(0, [[7, 8, 1], [13, 14, 2], [19, 21, 2]]),
    other:        hourPattern(0.1, [[7, 23, 1]]),
  };
  // Həftəsonu evdə daha çox vaxt keçirilir — bu kateqoriyalar şənbə/bazar 20% artır
  const WEEKEND_BOOST = { tv: 1.2, washer: 1.4, kettle: 1.2, microwave: 1.2, lighting: 1.1, computer: 1.1, other: 1.1 };

  function hourKey(ts) { const d = new Date(ts); d.setMinutes(0, 0, 0); return d.getTime(); }
  function dayKey(ts) { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  // Cihaz siyahısından saatlıq "ağıllı sayğac" məlumatı yaradır (aylıq kVt saxlanılır)
  function simulateLoadProfile({ appliances, days = 28, end, seed = 7, standbyW = 35, noise = 0.1, anomalies } = {}) {
    const rnd = mulberry32(seed);
    const endD = end ? new Date(end) : new Date();
    const start = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate() - days, 0, 0, 0, 0);
    const items = (appliances || []).filter((a) => a && a.monthlyKwh > 0).map((a) => {
      const cat = classify(a.name);
      const w = HOUR_PATTERNS[cat] || HOUR_PATTERNS.other;
      const sumW = w.reduce((x, y) => x + y, 0) || 1;
      const boost = WEEKEND_BOOST[cat] || 1;
      // həftə üzrə orta 1 olsun deyə: (5·k + 2·k·boost)/7 = 1
      const k = 7 / (5 + 2 * boost);
      return { daily: a.monthlyKwh / 30, w, sumW, weekday: k, weekend: k * boost };
    });
    const extra = {};
    (anomalies || []).forEach((an) => an.hours.forEach((h) => { extra[an.day * 24 + h] = (extra[an.day * 24 + h] || 0) + an.extraKw; }));
    const points = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);
      const wknd = date.getDay() === 0 || date.getDay() === 6;
      for (let h = 0; h < 24; h++) {
        let kwh = standbyW / 1000;
        items.forEach((it) => { kwh += it.daily * (wknd ? it.weekend : it.weekday) * (it.w[h] / it.sumW); });
        kwh *= Math.max(0.3, 1 + noise * gauss(rnd));
        kwh += extra[d * 24 + h] || 0;
        points.push({ ts: new Date(date.getFullYear(), date.getMonth(), date.getDate(), h).getTime(), kwh: Math.round(kwh * 1000) / 1000 });
      }
    }
    return points;
  }

  // Nümunə: "Nümunə ev"in cihazları + 2 gecə unudulmuş elektrik qızdırıcısı (açıq şəkildə nümunə)
  function sampleMeterProfile(now) {
    const s = sampleData(now);
    const apps = s.appliances.concat([{ name: "Wi-Fi router", watts: 12, hours: 24, monthlyKwh: 8.64 }]);
    return simulateLoadProfile({ appliances: apps, days: 28, end: now, seed: 11,
      anomalies: [{ day: 19, hours: [0, 1, 2, 3, 4, 5], extraKw: 1.8 }, { day: 20, hours: [1, 2, 3, 4, 5], extraKw: 1.8 }] });
  }

  // "2026-10-01 13:00", "2026-10-01T13:00:00", "01.10.2026 13:00", "01/10/2026" (+ ayrıca saat sütunu)
  function parseMeterDate(s, hourCell) {
    s = String(s || "").trim();
    let y, mo, d, h = 0, mi = 0, m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2})(?::(\d{2}))?(?::\d{2}(?:\.\d+)?)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.exec(s))) {
      y = +m[1]; mo = +m[2]; d = +m[3]; if (m[4] != null) { h = +m[4]; mi = +(m[5] || 0); }
    } else if ((m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})(?:\s+(\d{1,2})(?::(\d{2}))?(?::\d{2})?)?$/.exec(s))) {
      d = +m[1]; mo = +m[2]; y = +m[3]; if (m[4] != null) { h = +m[4]; mi = +(m[5] || 0); }
    } else return NaN;
    if (hourCell != null) {
      const hm = /^(\d{1,2})(?::(\d{2}))?/.exec(String(hourCell).trim());
      if (!hm) return NaN;
      h = +hm[1]; mi = +(hm[2] || 0);
    }
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 24 || mi > 59) return NaN;
    return new Date(y, mo - 1, d, h, mi).getTime();
  }

  function parseMeterCsv(text, maxRows = 100000) {
    const lines = String(text || "").replace(/^﻿/, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, maxRows);
    if (!lines.length) return { points: [], skipped: 0, errorLines: [], unit: "kWh" };
    const first = lines[0];
    const delim = first.includes("\t") ? "\t" : first.split(";").length > first.split(",").length ? ";" : ",";
    const points = [], errorLines = [];
    let skipped = 0;
    lines.forEach((line, i) => {
      const cells = line.split(delim).map((c) => c.trim().replace(/^"(.*)"$/, "$1"));
      let ts = NaN, raw;
      if (cells.length >= 3 && /^\d{1,2}(:\d{2})?$/.test(cells[1])) { ts = parseMeterDate(cells[0], cells[1]); raw = cells[2]; }
      else if (cells.length >= 2) { ts = parseMeterDate(cells[0]); raw = cells[1]; }
      const v = parseFloat(String(raw == null ? "" : raw).replace(",", "."));
      if (!isFinite(ts) || !isFinite(v) || v < 0) {
        if (i === 0) return; // başlıq sətri
        skipped++; if (errorLines.length < 5) errorLines.push(i + 1);
        return;
      }
      points.push({ ts, kwh: v });
    });
    // Saatlıq məişət istifadəsi 20 kVt·saatdan çox ola bilməz — belə dəyərlər Vt·saatdır
    let unit = "kWh";
    if (points.length && median(points.map((p) => p.kwh)) > 20) { unit = "Wh"; points.forEach((p) => { p.kwh /= 1000; }); }
    return { points, skipped, errorLines, unit };
  }

  function profileToCsv(points) {
    const pad = (n) => String(n).padStart(2, "0");
    return "timestamp,kwh\n" + points.map((p) => {
      const d = new Date(p.ts);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00,${p.kwh.toFixed(3)}`;
    }).join("\n") + "\n";
  }

  function percentile(sorted, q) {
    if (!sorted.length) return 0;
    const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  // Saatlıq yük profilinin analizi (GridPulse robust z-score metodu saat səviyyəsində)
  function analyzeLoadProfile(points) {
    const agg = new Map();
    (points || []).forEach((p) => { if (p && isFinite(p.ts) && p.kwh >= 0) { const k = hourKey(p.ts); agg.set(k, (agg.get(k) || 0) + p.kwh); } });
    const hours = [...agg.entries()].sort((a, b) => a[0] - b[0]).map(([ts, kwh]) => ({ ts, kwh, h: new Date(ts).getHours(), dow: (new Date(ts).getDay() + 6) % 7 }));
    if (hours.length < 48) return null;
    const vals = hours.map((x) => x.kwh);
    const total = vals.reduce((a, b) => a + b, 0);
    const days = hours.length / 24;
    const avgDaily = total / days;
    const sorted = [...vals].sort((a, b) => a - b);

    const hod = new Array(24).fill(0), hodN = new Array(24).fill(0);
    const matrix = Array.from({ length: 7 }, () => new Array(24).fill(0)), matrixN = Array.from({ length: 7 }, () => new Array(24).fill(0));
    const byHod = Array.from({ length: 24 }, () => []);
    hours.forEach((x) => { hod[x.h] += x.kwh; hodN[x.h]++; matrix[x.dow][x.h] += x.kwh; matrixN[x.dow][x.h]++; byHod[x.h].push(x.kwh); });
    const hourlyAvgKw = hod.map((v, i) => (hodN[i] ? v / hodN[i] : 0));
    const weekHour = matrix.map((row, d) => row.map((v, h) => (matrixN[d][h] ? v / matrixN[d][h] : null)));

    const baseloadKw = percentile(sorted, 0.1);
    const peak = hours.reduce((m, x) => (x.kwh > m.kwh ? x : m), hours[0]);
    const peakHour = hourlyAvgKw.indexOf(Math.max(...hourlyAvgKw));
    const mean = total / hours.length;
    const sumWhere = (fn) => hours.filter(fn).reduce((a, x) => a + x.kwh, 0);
    const nightShare = total ? sumWhere((x) => x.h >= 23 || x.h < 7) / total : 0;
    const eveningShare = total ? sumWhere((x) => x.h >= 18 && x.h < 23) / total : 0;

    const daily = new Map();
    hours.forEach((x) => { const k = dayKey(x.ts); const e = daily.get(k) || { date: k, kwh: 0, wknd: x.dow >= 5 }; e.kwh += x.kwh; daily.set(k, e); });
    const dailyTotals = [...daily.values()].map((e) => ({ ...e, kwh: Math.round(e.kwh * 100) / 100 }));
    const avgOf = (arr) => (arr.length ? arr.reduce((a, e) => a + e.kwh, 0) / arr.length : 0);
    const weekendAvg = avgOf(dailyTotals.filter((e) => e.wknd)), weekdayAvg = avgOf(dailyTotals.filter((e) => !e.wknd));

    // Saatlıq anomaliyalar: eyni saat-of-day üzrə median/MAD bazasına görə
    const base = byHod.map((arr) => { const med = median(arr); return { med, mad: median(arr.map((v) => Math.abs(v - med))) }; });
    const flagged = hours.map((x) => {
      const b = base[x.h];
      const scale = Math.max(b.mad / 0.6745, 0.05 + 0.1 * b.med);
      const z = (x.kwh - b.med) / scale;
      return { ...x, z: round2(z), expected: b.med, flag: z >= 4 && x.kwh - b.med >= 0.25 };
    });
    const events = [];
    flagged.forEach((x, i) => {
      if (!x.flag) return;
      const prev = events[events.length - 1];
      if (prev && x.ts - prev.endTs <= 3600000) { prev.endTs = x.ts; prev.extraKwh += x.kwh - x.expected; prev.peakKw = Math.max(prev.peakKw, x.kwh); prev.hours.push(x.h); }
      else events.push({ startTs: x.ts, endTs: x.ts, extraKwh: x.kwh - x.expected, peakKw: x.kwh, hours: [x.h] });
    });
    events.forEach((e) => {
      const night = e.hours.filter((h) => h < 7 || h >= 23).length;
      e.type = night >= e.hours.length / 2 ? "night" : "day";
      e.extraKwh = round2(e.extraKwh); e.peakKw = round2(e.peakKw); e.durationH = e.hours.length;
      delete e.hours;
    });

    const monthKwh = avgDaily * 30;
    const month = calcTariff(monthKwh);
    const rate = marginalRate(monthKwh);
    const standbyYearKwh = baseloadKw * 8760;
    return {
      hours: hours.length, days: round2(days), from: hours[0].ts, to: hours[hours.length - 1].ts,
      totalKwh: round2(total), avgDailyKwh: round2(avgDaily),
      hourlyAvgKw: hourlyAvgKw.map((v) => Math.round(v * 1000) / 1000), weekHour,
      baseloadW: Math.round(baseloadKw * 1000), peakKw: round2(peak.kwh), peakTs: peak.ts, peakHour,
      loadFactor: round2(peak.kwh ? mean / peak.kwh : 0), nightShare: round2(nightShare), eveningShare: round2(eveningShare),
      weekendAvgKwh: round2(weekendAvg), weekdayAvgKwh: round2(weekdayAvg),
      dailyTotals, events,
      monthKwh: Math.round(monthKwh), monthCost: month.cost, monthTier: month.tier, marginalRate: rate,
      standbyYearKwh: Math.round(standbyYearKwh), standbyYearAzn: round2(standbyYearKwh * rate),
      co2MonthKg: Math.round(monthKwh * CO2_FACTOR),
    };
  }

  // Qayda-əsaslı "AI" tövsiyələri (hər biri ölçülə bilən göstəriciyə əsaslanır)
  function profileInsights(a) {
    if (!a) return [];
    const out = [];
    const add = (key, severity, vars) => out.push({ key, severity, vars: vars || {} });
    // Baza yükü soyuducu + router + gözləmə rejimidir. Faktiki ölçü: hər 10 Vt azalma = ildə 87.6 kVt·saat
    const per10 = { per10Kwh: 88, per10Azn: (87.6 * a.marginalRate).toFixed(1) };
    if (a.baseloadW > 120) add("baseload_high", "high", { w: a.baseloadW, yearKwh: a.standbyYearKwh, yearAzn: a.standbyYearAzn.toFixed(0), ...per10 });
    else if (a.baseloadW > 60) add("baseload_mid", "medium", { w: a.baseloadW, yearKwh: a.standbyYearKwh, yearAzn: a.standbyYearAzn.toFixed(0), ...per10 });
    else add("baseload_ok", "good", { w: a.baseloadW });
    if (a.events.length) {
      const extra = a.events.reduce((s, e) => s + e.extraKwh, 0);
      add(a.events.some((e) => e.type === "night") ? "anomaly_night" : "anomaly_day", "high", { n: a.events.length, kwh: extra.toFixed(1), azn: (extra * a.marginalRate).toFixed(2) });
    }
    if (a.monthTier !== "low") {
      const limit = a.monthTier === "high" ? 300 : 200;
      add("tier_projection", a.monthTier === "high" ? "high" : "medium", { kwh: a.monthKwh, cost: a.monthCost.toFixed(2), perDay: ((a.monthKwh - limit) / 30).toFixed(1), limit });
    }
    if (a.eveningShare > 0.4) add("evening_peak", "medium", { pct: Math.round(a.eveningShare * 100), hour: a.peakHour });
    if (a.nightShare > 0.35) add("night_heavy", "medium", { pct: Math.round(a.nightShare * 100) });
    if (a.loadFactor < 0.25) add("peaky", "low", { lf: a.loadFactor, peak: a.peakKw });
    if (a.weekdayAvgKwh && Math.abs(a.weekendAvgKwh / a.weekdayAvgKwh - 1) > 0.2) {
      add("weekend_diff", "low", { pct: Math.round((a.weekendAvgKwh / a.weekdayAvgKwh - 1) * 100) });
    }
    const order = { high: 0, medium: 1, low: 2, good: 3 };
    return out.sort((x, y) => order[x.severity] - order[y.severity]);
  }

  // ===== VİZUAL İZAH: pillələrin doldurulması =====
  function tierBreakdown(kwh) {
    kwh = Math.max(0, Number(kwh) || 0);
    const names = ["low", "mid", "high"];
    let prev = 0;
    return TIERS.map((t, i) => {
      const used = Math.max(0, Math.min(kwh, t.max) - prev);
      const row = { tier: names[i], from: prev, to: t.max, used: round2(used), rate: t.rate, cost: round2(used * t.rate) };
      prev = t.max;
      return row;
    });
  }

  // ===== VİZUAL İZAH: enerji axını (stansiya → şəbəkə itkisi → ev → cihazlar) =====
  function energyFlow(kwh, appliances, maxParts = 4) {
    kwh = Math.max(0, Number(kwh) || 0);
    const generated = kwh / (1 - AZ_TD_LOSS_PCT / 100);
    const byCat = {};
    (appliances || []).forEach((a) => { const c = classify(a.name); byCat[c] = (byCat[c] || 0) + (a.monthlyKwh || 0); });
    const appTotal = Object.values(byCat).reduce((s, v) => s + v, 0);
    const scale = appTotal > kwh && appTotal > 0 ? kwh / appTotal : 1;
    let parts = Object.entries(byCat).map(([key, v]) => ({ key, kwh: v * scale })).sort((a, b) => b.kwh - a.kwh);
    if (parts.length > maxParts) {
      const rest = parts.slice(maxParts).reduce((s, p) => s + p.kwh, 0);
      parts = parts.slice(0, maxParts).concat([{ key: "other", kwh: rest }]);
    }
    const known = parts.reduce((s, p) => s + p.kwh, 0);
    if (kwh - known > 0.5) parts.push({ key: "unknown", kwh: kwh - known });
    parts = parts.filter((p) => p.kwh > 0).map((p) => ({ ...p, kwh: round2(p.kwh), share: kwh ? round2(p.kwh / kwh) : 0 }));
    return { consumed: round2(kwh), generated: round2(generated), loss: round2(generated - kwh), co2Kg: Math.round(kwh * CO2_FACTOR), parts };
  }

  return {
    HOUR_PATTERNS, simulateLoadProfile, sampleMeterProfile, parseMeterDate, parseMeterCsv, profileToCsv,
    analyzeLoadProfile, profileInsights, tierBreakdown, energyFlow,
    billCheck, compareAppliances,
    SENSITIVITY, diagnoseMeter, syntheticHouseholds, validateDetector,
    GAS_TIERS, GAS_SEASON, GAS_CO2_KG_PER_M3, gasCost, gasForecast, gasLeakTest,
    outagePlan, badges, monthlyChallenge,
    TIERS, CO2_FACTOR, TREE_ABSORPTION_KG_YEAR, AZ_TD_LOSS_PCT, BAKU_TEMP_C, SEASON_FACTORS,
    calcTariff, marginalRate, kwhForBudget, seasonalFactor, parseMonth, monthKey, median,
    normalizeSeries, detectAnomalies, trendPctPerMonth, forecastYear, monthPace,
    classify, categoryKwh, healthScore, whatIf, investmentPlan, ecoImpact, sampleData,
  };
});
