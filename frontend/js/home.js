// ==========================================
// EnergyX Az: Ana səhifə
// Sürətli hesablama, rəsmi tariflər cədvəli, bölmələrə keçidlər.
// Başlanğıc bölməsini ünvandan (#calc, #gas ...) seçir. Bütün modullardan SONRA yüklənir.
// ==========================================
(function () {
  "use strict";
  const E = window.EnergyEngine, P = window.EnergyPro;
  const $ = (id) => document.getElementById(id);
  const T = () => translations[currentLang];
  const fmt = P.fmt;

  const HT = {
    az: {
      tab_home: "Ana səhifə", home_overview: "Sizin göstəriciləriniz",
      home_title: "Elektrik və qaz xərcinizi ay bitməmiş bilin",
      home_lead: "EnergyX Az Azərbaycanın rəsmi pilləli tarifləri ilə aylıq ödənişinizi hesablayır, hansı cihazın nə qədər işlətdiyini göstərir və qənaət üçün konkret addımlar təklif edir.",
      home_cta_calc: "Hesablamağa başla", home_cta_demo: "Necə işlədiyinə bax",
      home_fact1: "Qeydiyyat tələb olunmur", home_fact2: "Məlumatlar yalnız sizin brauzerinizdə saxlanılır",
      home_fact3: "Azərbaycan, ingilis və rus dillərində",
      home_quick_label: "Bu ay sayğacınız neçə kVt·saat göstərir?", home_unit: "kVt·saat",
      home_quick_go: "Ətraflı hesablamaya keç",
      home_q_next: "Növbəti pilləyə {n} kVt·saat qalıb.", home_q_top: "Ən yüksək pillədəsiniz: hər əlavə kVt·saat 15 qəpikdir.",
      home_q_avg: "Orta qiymət: {p} qəp / kVt·saat",
      home_sections: "Saytda nə var",
      home_d_calc: "Aylıq kVt·saata görə pillə, məbləğ və ay sonu proqnozu.",
      home_d_app: "Cihazlarınızı əlavə edin, hansının nə qədər işlətdiyini görün.",
      home_d_meter: "Saatlıq sayğac məlumatını (CSV) yükləyin və ya nümunə ilə yoxlayın.",
      home_d_gas: "Qaz sərfiyyatı, illik pillələr və sızma testi.",
      home_d_insights: "Aylıq qeydlərə görə qeyri-adi artımlar və 12 aylıq proqnoz.",
      home_d_plan: "Büdcə təyin edin, qənaət addımlarının nə qədər qazandıracağını görün.",
      home_d_ready: "İşıq kəsiləndə vacib cihazlar üçün nə qədər ehtiyat enerji lazımdır.",
      home_d_learn: "Qənaət məsləhətləri və tez-tez verilən suallar.",
      home_tariff_title: "Əhali üçün tariflər",
      home_el: "Elektrik enerjisi (aylıq)", home_gas: "Təbii qaz (illik)",
      home_up_to: "{n}-ə qədər", home_from: "{a}-{b}", home_over: "{n}-dən çox",
      home_kwh_unit: "kVt·saat", home_m3_unit: "m³", home_qep: "qəp",
      home_tariff_src: "Mənbə: Azərbaycan Respublikasının Tarif (qiymət) Şurası. Qaz pillələri illik istehlaka görə hesablanır.",
      home_steps_title: "Necə istifadə etməli",
      home_step1_t: "Sayğac göstəricisini yazın",
      home_step1: "Kalkulyatorda bu ayın kVt·saatını seçin və ya hesabınızdakı rəqəmi daxil edin.",
      home_step2_t: "Cihazlarınızı əlavə edin",
      home_step2: "Gücünü və gündə neçə saat işlədiyini yazın, xərcin haradan gəldiyini görün.",
      home_step3_t: "Hər ay qeyd saxlayın",
      home_step3: "Bir neçə aylıq qeyddən sonra proqnoz və müqayisələr daha dəqiq olur.",
    },
    en: {
      tab_home: "Home", home_overview: "Your numbers",
      home_title: "Know your electricity and gas bill before the month ends",
      home_lead: "EnergyX Az calculates your monthly bill with Azerbaijan's official tiered tariffs, shows how much each appliance uses and suggests concrete ways to save.",
      home_cta_calc: "Start calculating", home_cta_demo: "See how it works",
      home_fact1: "No sign-up", home_fact2: "Your data stays in your browser",
      home_fact3: "Azerbaijani, English and Russian",
      home_quick_label: "What does your meter show this month?", home_unit: "kWh",
      home_quick_go: "Open the full calculator",
      home_q_next: "{n} kWh left until the next tier.", home_q_top: "You are in the top tier: every extra kWh costs 15 qepik.",
      home_q_avg: "Average price: {p} qepik / kWh",
      home_sections: "What you can do here",
      home_d_calc: "Tier, amount and end-of-month estimate for your monthly kWh.",
      home_d_app: "Add your appliances and see how much each one uses.",
      home_d_meter: "Upload hourly smart meter data (CSV) or try the sample.",
      home_d_gas: "Gas use, yearly tiers and a simple leak test.",
      home_d_insights: "Unusual jumps in your monthly readings and a 12-month forecast.",
      home_d_plan: "Set a budget and see what each saving step is worth.",
      home_d_ready: "How much backup power your essential devices need during an outage.",
      home_d_learn: "Saving tips and frequently asked questions.",
      home_tariff_title: "Household tariffs",
      home_el: "Electricity (monthly)", home_gas: "Natural gas (yearly)",
      home_up_to: "up to {n}", home_from: "{a}-{b}", home_over: "over {n}",
      home_kwh_unit: "kWh", home_m3_unit: "m³", home_qep: "qepik",
      home_tariff_src: "Source: Tariff (Price) Council of the Republic of Azerbaijan. Gas tiers are based on yearly use.",
      home_steps_title: "How to use it",
      home_step1_t: "Enter your meter reading",
      home_step1: "Pick this month's kWh in the calculator or type the number from your bill.",
      home_step2_t: "Add your appliances",
      home_step2: "Enter the power and daily hours to see where the cost comes from.",
      home_step3_t: "Save a reading every month",
      home_step3: "After a few months the forecast and comparisons become more accurate.",
    },
    ru: {
      tab_home: "Главная", home_overview: "Ваши показатели",
      home_title: "Узнайте счёт за свет и газ до конца месяца",
      home_lead: "EnergyX Az считает ваш ежемесячный счёт по официальным ступенчатым тарифам Азербайджана, показывает, сколько потребляет каждый прибор, и предлагает конкретные шаги для экономии.",
      home_cta_calc: "Начать расчёт", home_cta_demo: "Посмотреть, как это работает",
      home_fact1: "Без регистрации", home_fact2: "Данные хранятся только в вашем браузере",
      home_fact3: "На азербайджанском, английском и русском",
      home_quick_label: "Сколько кВт·ч показывает счётчик в этом месяце?", home_unit: "кВт·ч",
      home_quick_go: "Открыть подробный расчёт",
      home_q_next: "До следующей ступени осталось {n} кВт·ч.", home_q_top: "Вы на самой высокой ступени: каждый дополнительный кВт·ч стоит 15 гяпиков.",
      home_q_avg: "Средняя цена: {p} гяп. / кВт·ч",
      home_sections: "Что есть на сайте",
      home_d_calc: "Ступень, сумма и прогноз на конец месяца по вашему кВт·ч.",
      home_d_app: "Добавьте приборы и посмотрите, сколько потребляет каждый.",
      home_d_meter: "Загрузите почасовые данные счётчика (CSV) или попробуйте пример.",
      home_d_gas: "Расход газа, годовые ступени и проверка на утечку.",
      home_d_insights: "Необычные скачки в ежемесячных показаниях и прогноз на 12 месяцев.",
      home_d_plan: "Задайте бюджет и посмотрите, сколько даст каждый шаг экономии.",
      home_d_ready: "Сколько резервной энергии нужно важным приборам при отключении.",
      home_d_learn: "Советы по экономии и частые вопросы.",
      home_tariff_title: "Тарифы для населения",
      home_el: "Электроэнергия (в месяц)", home_gas: "Природный газ (в год)",
      home_up_to: "до {n}", home_from: "{a}-{b}", home_over: "свыше {n}",
      home_kwh_unit: "кВт·ч", home_m3_unit: "м³", home_qep: "гяп.",
      home_tariff_src: "Источник: Тарифный (ценовой) совет Азербайджанской Республики. Ступени газа считаются по годовому потреблению.",
      home_steps_title: "Как пользоваться",
      home_step1_t: "Введите показание счётчика",
      home_step1: "Выберите кВт·ч за этот месяц в калькуляторе или введите число из счёта.",
      home_step2_t: "Добавьте приборы",
      home_step2: "Укажите мощность и часы работы в день, чтобы увидеть, откуда берутся расходы.",
      home_step3_t: "Сохраняйте показание каждый месяц",
      home_step3: "Через несколько месяцев прогноз и сравнения становятся точнее.",
    },
  };
  Object.keys(HT).forEach((l) => Object.assign(translations[l], HT[l]));

  const SECTIONS = ["calc", "app", "meter", "gas", "insights", "plan", "ready", "learn"];

  function renderGrid() {
    const t = T();
    $("homeGrid").innerHTML = SECTIONS.map((s) => `<button type="button" class="home-card" data-go="${s}">
        <span class="ico ico-${s}" aria-hidden="true"></span>
        <span class="home-card-t">${esc(t["tab_" + s])}</span>
        <span class="home-card-d">${esc(t["home_d_" + s])}</span>
      </button>`).join("");
  }

  function tierRows(tiers, unit) {
    const t = T();
    let prev = 0;
    return tiers.map((x) => {
      const range = x.max === Infinity ? fmt(t.home_over, { n: prev }) : prev === 0 ? fmt(t.home_up_to, { n: x.max }) : fmt(t.home_from, { a: prev, b: x.max });
      prev = x.max;
      const qep = +(x.rate * 100).toFixed(1);
      return `<tr><td>${esc(range)} ${esc(unit)}</td><td class="num">${qep} ${esc(t.home_qep)}</td></tr>`;
    }).join("");
  }
  function renderTariffs() {
    const t = T();
    // Elektrik pillələri engine.calcTariff ilə eyni mənbədən: 200 / 300 kVt·saat
    const EL = [{ max: 200, rate: E.calcTariff(200).cost / 200 }, { max: 300, rate: (E.calcTariff(300).cost - E.calcTariff(200).cost) / 100 },
      { max: Infinity, rate: E.calcTariff(301).cost - E.calcTariff(300).cost }];
    $("homeTariffs").innerHTML = `<table class="home-table">
        <caption>${esc(t.home_el)}</caption>${tierRows(EL, t.home_kwh_unit)}</table>
      <table class="home-table">
        <caption>${esc(t.home_gas)}</caption>${tierRows(E.GAS_TIERS, t.home_m3_unit)}</table>`;
  }

  function quickValue() {
    const v = Math.round(Number($("homeKwh").value));
    return Number.isFinite(v) ? Math.min(5000, Math.max(0, v)) : 0;
  }
  function renderQuick() {
    const t = T(), kwh = quickValue(), r = E.calcTariff(kwh);
    const next = kwh < 200 ? 200 - kwh : kwh < 300 ? 300 - kwh : 0;
    const avg = kwh > 0 ? ((r.cost / kwh) * 100).toFixed(1) : "0";
    $("homeQuickOut").innerHTML = `<div class="home-q-cost">${r.cost.toFixed(2)} <span>₼</span></div>
      <div class="home-q-tier ${r.tier}">${esc(t["tier_" + r.tier])}</div>
      <p class="home-q-note">${esc(next ? fmt(t.home_q_next, { n: next }) : t.home_q_top)}<br>${esc(fmt(t.home_q_avg, { p: avg }))}</p>`;
  }

  // İcmal yalnız istifadəçinin öz məlumatı (sayğac qeydi və ya cihaz) olanda göstərilir
  function renderOverviewBox() {
    const meters = P.load("energyx_meters", []);
    $("homeOverview").hidden = !((Array.isArray(meters) && meters.length) || appliances.length);
  }
  function renderHome() { renderGrid(); renderTariffs(); renderQuick(); renderOverviewBox(); }

  // ===== HADİSƏLƏR =====
  $("homeKwh").addEventListener("input", renderQuick);
  $("homeKwh").addEventListener("keydown", (e) => { if (e.key === "Enter") $("homeQuickGo").click(); });
  $("homeQuickGo").addEventListener("click", () => {
    const kwh = quickValue();
    slider.value = Math.min(Number(slider.max) || 600, kwh);
    updateCalc(); updateSim(); P.refreshSoon();
    switchTab("calc");
  });
  // Kartlardakı data-go kliki ux.js-də ümumi qaydada işlənir
  $("brandLink").addEventListener("click", (e) => { e.preventDefault(); switchTab("home"); });

  const origRefresh = window.EnergyExtras.refresh;
  window.EnergyExtras.refresh = function (state, tab) {
    origRefresh(state, tab);
    renderHome();
  };

  // Başlanğıc bölməsi: ünvanda #bölmə və ya ?tab= varsa o açılır, yoxsa ana səhifə
  applyTranslations(currentLang);
  renderHome();
  const want = (location.hash || "").slice(1) || new URLSearchParams(location.search).get("tab") || "home";
  const start = $("panel-" + want) ? want : "home";
  switchTab(start, { fromHistory: true });
  try { history.replaceState({ tab: start }, "", start === "home" ? location.pathname + location.search : "#" + start); } catch (e) {}
})();
