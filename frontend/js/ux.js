// ==========================================
// EnergyX Az v2.2 — Tətbiq qabığı: tema, naviqasiya (yan panel / aşağı panel),
// ümumi baxış zolağı, hesab yoxlayıcısı, köhnə vs yeni cihaz müqayisəsi
// extras.js-dən SONRA yüklənir.
// ==========================================
(function () {
  "use strict";
  const E = window.EnergyEngine, P = window.EnergyPro;
  const $ = (id) => document.getElementById(id);
  const T = () => translations[currentLang];
  const fmt = P.fmt;

  const UT = {
    az: {
      nav_more: "Daha çox", theme_light: "Açıq tema", theme_dark: "Tünd tema",
      ov_health: "Sağlamlıq balı", ov_year: "12 ay proqnozu", ov_budget: "Büdcə", ov_gas: "Qaz (tipik il)",
      ov_budget_none: "təyin edilməyib", ov_budget_ok: "daxilindəsiniz", ov_budget_over: "aşılacaq",
      ov_no_data: "məlumat az", ov_go: "→",
      bill_title: "Hesab Yoxlayıcısı", bill_tag: "faktura",
      bill_lead: "Azərişıq hesabındakı kVt·saatı və məbləği yazın — rəsmi tariflə uyğun gəlib-gəlmədiyini yoxlayaq.",
      bill_kwh: "Hesabdakı kVt·saat", bill_amount: "Hesabdakı məbləğ (₼)",
      bill_ok: "✅ Hesab rəsmi tariflə uyğundur: {kwh} kVt = {exp} ₼.",
      bill_over: "⚠️ Hesab rəsmi tarifdən {d} ₼ ({p}%) çoxdur. {kwh} kVt üçün gözlənilən: {exp} ₼. Bu məbləğ ≈ {imp} kVt-a uyğundur.",
      bill_under: "ℹ️ Hesab rəsmi tarifdən {d} ₼ azdır. {kwh} kVt üçün gözlənilən: {exp} ₼.",
      bill_note: "Fərqin səbəbi əvvəlki aydan qalan borc/avans, cərimə və ya oxunuş xətası ola bilər. Sual yaranarsa 199-a müraciət edin.",
      cmp_title: "Köhnə vs Yeni Cihaz", cmp_tag: "alışdan əvvəl",
      cmp_lead: "Yeni cihaz almağa dəyərmi? Hər ikisinin gücünü yazın — illik fərqi və geri ödəmə müddətini pilləli tarifə görə hesablayaq.",
      cmp_old: "Köhnə cihaz (W)", cmp_new: "Yeni cihaz (W)", cmp_hours: "Saat/gün", cmp_price: "Yeni cihazın qiyməti (₼)",
      cmp_saved: "Aylıq qənaət", cmp_year: "İllik qənaət", cmp_payback: "Geri ödəmə", cmp_net: "10 illik xalis",
      cmp_months: "ay", cmp_years: "il", cmp_never: "ödəmir",
      cmp_good: "✅ Yeni cihaz {y} ildə özünü ödəyir və 10 ildə {n} ₼ qazandırır.",
      cmp_slow: "⏳ Yeni cihaz özünü 10 ildən gec ödəyir — yalnız köhnə cihaz xarab olduqda dəyişmək daha sərfəlidir.",
      cmp_worse: "❌ Yeni cihaz köhnədən çox enerji işlədir.",
      cmp_based: "Hesablama Kalkulyatordakı {kwh} kVt istifadəyə əsaslanır (pilləli tarif).",
    },
    en: {
      nav_more: "More", theme_light: "Light theme", theme_dark: "Dark theme",
      ov_health: "Health score", ov_year: "12-month forecast", ov_budget: "Budget", ov_gas: "Gas (typical year)",
      ov_budget_none: "not set", ov_budget_ok: "on track", ov_budget_over: "will be exceeded",
      ov_no_data: "little data", ov_go: "→",
      bill_title: "Bill Checker", bill_tag: "invoice",
      bill_lead: "Enter the kWh and amount from your Azerishig bill — we'll check that they match the official tariff.",
      bill_kwh: "kWh on the bill", bill_amount: "Amount on the bill (₼)",
      bill_ok: "✅ The bill matches the official tariff: {kwh} kWh = {exp} ₼.",
      bill_over: "⚠️ The bill is {d} ₼ ({p}%) above the official tariff. Expected for {kwh} kWh: {exp} ₼. This amount matches ≈ {imp} kWh.",
      bill_under: "ℹ️ The bill is {d} ₼ below the official tariff. Expected for {kwh} kWh: {exp} ₼.",
      bill_note: "The difference may come from a previous balance/advance, a penalty or a reading error. If in doubt, call 199.",
      cmp_title: "Old vs New Appliance", cmp_tag: "before you buy",
      cmp_lead: "Is a new appliance worth it? Enter both power ratings — we'll compute the yearly difference and payback on the tiered tariff.",
      cmp_old: "Old appliance (W)", cmp_new: "New appliance (W)", cmp_hours: "Hours/day", cmp_price: "New appliance price (₼)",
      cmp_saved: "Monthly savings", cmp_year: "Yearly savings", cmp_payback: "Payback", cmp_net: "10-year net",
      cmp_months: "mo", cmp_years: "yr", cmp_never: "never",
      cmp_good: "✅ The new appliance pays back in {y} years and earns {n} ₼ over 10 years.",
      cmp_slow: "⏳ The new appliance takes over 10 years to pay back — replacing only when the old one breaks is wiser.",
      cmp_worse: "❌ The new appliance uses more energy than the old one.",
      cmp_based: "Based on the {kwh} kWh in the Calculator (tiered tariff).",
    },
    ru: {
      nav_more: "Ещё", theme_light: "Светлая тема", theme_dark: "Тёмная тема",
      ov_health: "Индекс здоровья", ov_year: "Прогноз на 12 мес", ov_budget: "Бюджет", ov_gas: "Газ (типичный год)",
      ov_budget_none: "не задан", ov_budget_ok: "в рамках", ov_budget_over: "будет превышен",
      ov_no_data: "мало данных", ov_go: "→",
      bill_title: "Проверка счёта", bill_tag: "квитанция",
      bill_lead: "Введите кВт·ч и сумму из счёта Azərişıq — проверим соответствие официальному тарифу.",
      bill_kwh: "кВт·ч в счёте", bill_amount: "Сумма в счёте (₼)",
      bill_ok: "✅ Счёт соответствует официальному тарифу: {kwh} кВт·ч = {exp} ₼.",
      bill_over: "⚠️ Счёт на {d} ₼ ({p}%) выше официального тарифа. Ожидалось за {kwh} кВт·ч: {exp} ₼. Эта сумма соответствует ≈ {imp} кВт·ч.",
      bill_under: "ℹ️ Счёт на {d} ₼ ниже официального тарифа. Ожидалось за {kwh} кВт·ч: {exp} ₼.",
      bill_note: "Разница может быть из-за долга/аванса, штрафа или ошибки показаний. При сомнениях звоните 199.",
      cmp_title: "Старый vs новый прибор", cmp_tag: "перед покупкой",
      cmp_lead: "Стоит ли покупать новый прибор? Введите мощность обоих — рассчитаем годовую разницу и окупаемость по ступенчатому тарифу.",
      cmp_old: "Старый прибор (Вт)", cmp_new: "Новый прибор (Вт)", cmp_hours: "Часов/день", cmp_price: "Цена нового (₼)",
      cmp_saved: "Экономия в месяц", cmp_year: "Экономия в год", cmp_payback: "Окупаемость", cmp_net: "Итог за 10 лет",
      cmp_months: "мес", cmp_years: "лет", cmp_never: "не окупится",
      cmp_good: "✅ Новый прибор окупится за {y} лет и сэкономит {n} ₼ за 10 лет.",
      cmp_slow: "⏳ Окупаемость больше 10 лет — выгоднее менять, только когда старый сломается.",
      cmp_worse: "❌ Новый прибор потребляет больше старого.",
      cmp_based: "Расчёт на основе {kwh} кВт·ч из калькулятора (ступенчатый тариф).",
    },
  };
  Object.keys(UT).forEach((l) => Object.assign(translations[l], UT[l]));

  const TABS = ["calc", "app", "gas", "insights", "plan", "ready", "stats", "learn", "about"];
  let currentTab = (document.querySelector(".tab-btn.active") || { dataset: {} }).dataset.tab || "calc";

  // ===== TEMA =====
  function theme() { return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function renderThemeBtn() {
    const t = T(), b = $("themeBtn");
    b.textContent = theme() === "light" ? "🌙" : "☀️";
    b.title = theme() === "light" ? t.theme_dark : t.theme_light;
    b.setAttribute("aria-label", b.title);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", P.cssVar("--bg"));
  }
  function toggleTheme() {
    const next = theme() === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("energyx_theme", next); } catch {}
    renderThemeBtn();
    // Qrafiklər və gauge yeni rənglərlə yenidən çəkilir
    updateCalc(); renderAppliances(); P.refresh();
  }

  // ===== NAVİQASİYA =====
  // Aşağı panel və mobil menyu index.html-də statikdir (JS olmasa da işləyir);
  // burada yalnız əlavə davranış var: aktiv düyməni görünən etmək, URL-də bölmə.
  const origSwitch = window.switchTab;
  window.switchTab = function (tab) {
    if (!document.getElementById("panel-" + tab)) return;
    origSwitch(tab);
    currentTab = tab;
    const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (btn && window.innerWidth < 1100) btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    if (!document.getElementById("presBar")) window.scrollTo({ top: 0, behavior: "auto" });
    try { history.replaceState(null, "", tab === "calc" ? location.pathname + location.search : "#" + tab); } catch {}
  };

  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { switchTab(go.dataset.go); return; }
  });
  document.addEventListener("keydown", (e) => {
    // Alt + 1..9 — bölmələr arasında sürətli keçid
    if (e.altKey && !e.ctrlKey && !e.metaKey && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      switchTab(TABS[+e.key - 1]);
    }
  });

  // ===== ÜMUMİ BAXIŞ ZOLAĞI =====
  function renderOverview(state) {
    const t = T();
    const h = state.health;
    const hTier = h.score >= 70 ? "low" : h.score >= 45 ? "mid" : "high";
    const f = state.forecast;
    const pace = P.load("energyx_pace", { readings: [], budget: 0 });
    const n = new Date();
    const pr = E.monthPace(pace.readings || [], new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(), Number(pace.budget) || 0);
    let bVal = "—", bSub = t.ov_budget_none, bTier = "";
    if (Number(pace.budget) > 0) {
      bVal = `${pace.budget} ₼`;
      if (pr && pr.budget) { bSub = `${pr.projected.cost.toFixed(0)} ₼ · ${pr.budget.over ? t.ov_budget_over : t.ov_budget_ok}`; bTier = pr.budget.over ? "high" : "low"; }
      else bSub = t.ov_no_data;
    }
    const g = Object.assign({ m3: 120, prior: 0, month: n.getMonth() }, P.load("energyx_gas", {}));
    const gf = E.gasForecast(g.m3, g.month, g.prior);
    const tiles = [
      { go: "insights", label: t.ov_health, val: `${h.score}/100`, cls: hTier, sub: `${h.grade} · ${t["grade_" + h.grade]}` },
      { go: "insights", label: t.ov_year, val: `${f.totalCost.toFixed(0)} ₼`, cls: "", sub: `${f.totalCostLow.toFixed(0)}–${f.totalCostHigh.toFixed(0)} ₼ · ${f.totalKwh} kVt` },
      { go: "plan", label: t.ov_budget, val: bVal, cls: bTier, sub: bSub },
      { go: "gas", label: t.ov_gas, val: `${gf.typicalYearCost.toFixed(0)} ₼`, cls: "", sub: `~${gf.typicalYearM3} m³` },
    ];
    $("overview").innerHTML = tiles.map((x) => `<button class="ov-tile" data-go="${x.go}" type="button">
      <span class="ov-top"><span>${esc(x.label)}</span><span>${t.ov_go}</span></span>
      <span class="ov-val ${x.cls}">${esc(x.val)}</span><span class="ov-sub">${esc(x.sub)}</span></button>`).join("");
  }

  // ===== HESAB YOXLAYICISI =====
  function renderBill() {
    const t = T();
    const kwh = $("billKwh").value, amt = $("billAmount").value;
    if (kwh === "" || amt === "") { $("billResult").innerHTML = ""; return; }
    const r = E.billCheck(kwh, amt);
    if (!r) { $("billResult").innerHTML = ""; return; }
    const vars = { kwh: Math.round(+kwh), exp: r.expected.toFixed(2), d: Math.abs(r.diff).toFixed(2), p: Math.abs(r.diffPct).toFixed(1), imp: r.impliedKwh };
    const cls = r.status === "ok" ? "ok" : r.status === "over" ? "bad" : "ok";
    $("billResult").innerHTML = `<div class="pace-alert ${cls}">${esc(fmt(t["bill_" + r.status], vars))}</div>` +
      (r.status === "ok" ? "" : `<p class="pro-note">${esc(t.bill_note)}</p>`);
  }

  // ===== KÖHNƏ vs YENİ CİHAZ =====
  function renderCompare() {
    const t = T();
    const r = E.compareAppliances({ oldW: $("cmpOld").value, newW: $("cmpNew").value, hours: $("cmpHours").value,
      price: $("cmpPrice").value, baseKwh: +slider.value });
    P.store("energyx_cmp", ["cmpOld", "cmpNew", "cmpHours", "cmpPrice"].map((id) => $(id).value));
    let verdict;
    if (r.savedKwhMonth <= 0) verdict = `<div class="pace-alert bad">${esc(t.cmp_worse)}</div>`;
    else if (r.paybackMonths != null && r.paybackMonths <= 120) verdict = `<div class="pace-alert ok">${esc(fmt(t.cmp_good, { y: (r.paybackMonths / 12).toFixed(1), n: Math.max(0, r.tenYearNet).toFixed(0) }))}</div>`;
    else verdict = `<div class="pace-alert bad">${esc(t.cmp_slow)}</div>`;
    const pb = r.paybackMonths == null ? t.cmp_never : r.paybackMonths >= 24 ? `${(r.paybackMonths / 12).toFixed(1)} ${t.cmp_years}` : `${r.paybackMonths} ${t.cmp_months}`;
    $("cmpResult").innerHTML = `<div class="kpi-grid four">
        <div class="kpi"><div class="kpi-val ${r.monthlyAzn > 0 ? "low" : "high"}">${r.monthlyAzn.toFixed(2)} ₼</div><div class="kpi-label">${esc(t.cmp_saved)} · ${r.savedKwhMonth} kVt</div></div>
        <div class="kpi"><div class="kpi-val">${r.yearlyAzn.toFixed(0)} ₼</div><div class="kpi-label">${esc(t.cmp_year)}</div></div>
        <div class="kpi"><div class="kpi-val">${esc(pb)}</div><div class="kpi-label">${esc(t.cmp_payback)}</div></div>
        <div class="kpi"><div class="kpi-val ${r.tenYearNet >= 0 ? "low" : "high"}">${r.tenYearNet >= 0 ? "+" : ""}${r.tenYearNet.toFixed(0)} ₼</div><div class="kpi-label">${esc(t.cmp_net)}</div></div>
      </div>${verdict}<p class="pro-note">${esc(fmt(t.cmp_based, { kwh: slider.value }))}</p>`;
  }

  // ===== YENİLƏMƏ (EnergyPro.refresh → EnergyExtras.refresh → burası) =====
  function refreshUx(state) {
    // Cihaz yoxdursa boş qrafik kartı göstərilmir
    const chartCard = $("appChart").closest(".app-chart-card");
    if (chartCard) chartCard.hidden = !appliances.length;
    renderOverview(state);
    renderBill();
    renderCompare();
    renderThemeBtn();
  }
  const origExtras = window.EnergyExtras.refresh;
  window.EnergyExtras.refresh = function (state, tab) {
    origExtras(state, tab);
    refreshUx(state);
  };

  // ===== HADİSƏLƏR =====
  $("themeBtn").addEventListener("click", toggleTheme);
  ["billKwh", "billAmount"].forEach((id) => $(id).addEventListener("input", renderBill));
  const savedCmp = P.load("energyx_cmp", null);
  ["cmpOld", "cmpNew", "cmpHours", "cmpPrice"].forEach((id, i) => {
    if (Array.isArray(savedCmp) && savedCmp[i] !== undefined && savedCmp[i] !== "") $(id).value = savedCmp[i];
    $(id).addEventListener("input", renderCompare);
  });
  // Sistem teması dəyişəndə (istifadəçi əl ilə seçməyibsə) izlə
  try {
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
      if (localStorage.getItem("energyx_theme")) return;
      document.documentElement.setAttribute("data-theme", e.matches ? "light" : "dark");
      renderThemeBtn(); updateCalc(); renderAppliances(); P.refresh();
    });
  } catch {}

  window.EnergyUx = { toggleTheme };
  applyTranslations(currentLang);
  // URL-dəki #bölmə ilə birbaşa açılış
  const hashTab = location.hash.replace("#", "");
  if (TABS.includes(hashTab)) switchTab(hashTab);
  P.refresh();
})();
