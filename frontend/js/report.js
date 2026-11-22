// ==========================================
// EnergyX Az: istifadə hesabatı (Statistika bölməsi)
// Ümumi göstəricilər, gün üzrə qrafik, aylar üzrə cədvəl, dil bölgüsü, CSV və PDF (Gənclər Fondu üçün).
// Səfər bir sessiyada bir dəfə sayılır; heç bir şəxsi məlumat göndərilmir.
// ==========================================
(function () {
  "use strict";
  const P = window.EnergyPro;
  const $ = (id) => document.getElementById(id);
  const T = () => translations[currentLang];
  const fmt = P.fmt;

  const RT = {
    az: {
      rep_30: "30 gün", rep_90: "90 gün", rep_365: "1 il", rep_csv: "CSV yüklə", rep_pdf: "PDF hesabat",
      rep_daily_title: "Gün üzrə istifadə", rep_months_title: "Aylar üzrə", rep_lang_title: "İnterfeys dili",
      rep_privacy: "Saylar anonimdir: IP ünvanı, cihaz identifikatoru və ya şəxsi məlumat saxlanılmır.",
      rep_visits: "Səfər", rep_calcs: "Hesablama", rep_ai: "Məsləhətçiyə sual", rep_pdfs: "PDF hesabat",
      rep_savings: "Hesablanmış qənaət, ₼", rep_feedback: "Faydalı cavab",
      rep_in_period: "seçilmiş dövrdə: {n}", rep_total_note: "Ümumi, {since} tarixindən",
      rep_month: "Ay", rep_none: "Bu dövrdə hələ məlumat yoxdur.",
      rep_loading: "Statistika yüklənir...", rep_error: "Statistika hazırda əlçatmazdır. Server oyanırsa, bir dəqiqə sonra yenidən yoxlayın.",
      rep_retry: "Yenidən yoxla",
      rep_temp: "Statistika hələ müvəqqəti yaddaşdadır və server yenidən başlayanda sıfırlanır. Qalıcı saxlama qoşulandan sonra bu qeyd itəcək.",
      rep_pdf_title: "EnergyX Az: istifadə hesabatı", rep_pdf_period: "Dövr: {from} - {to}", rep_pdf_generated: "Hazırlanıb: {d}",
      rep_pdf_totals: "Ümumi göstəricilər", rep_pdf_period_totals: "Seçilmiş dövr üzrə", rep_pdf_months: "Aylar üzrə",
      rep_pdf_langs: "İnterfeys dili (səfərlər)", rep_pdf_note: "Saylar anonimdir. Statistika {since} tarixindən toplanır.",
      rep_feedback_val: "{p}% ({n} rəy)",
    },
    en: {
      rep_30: "30 days", rep_90: "90 days", rep_365: "1 year", rep_csv: "Download CSV", rep_pdf: "PDF report",
      rep_daily_title: "Daily usage", rep_months_title: "By month", rep_lang_title: "Interface language",
      rep_privacy: "All counts are anonymous: no IP address, device ID or personal data is stored.",
      rep_visits: "Visits", rep_calcs: "Calculations", rep_ai: "Advisor questions", rep_pdfs: "PDF reports",
      rep_savings: "Savings calculated, ₼", rep_feedback: "Helpful answers",
      rep_in_period: "in selected period: {n}", rep_total_note: "Total since {since}",
      rep_month: "Month", rep_none: "No data for this period yet.",
      rep_loading: "Loading statistics...", rep_error: "Statistics are unavailable right now. If the server is waking up, try again in a minute.",
      rep_retry: "Try again",
      rep_temp: "Statistics are still kept in temporary storage and reset when the server restarts. This note disappears once permanent storage is connected.",
      rep_pdf_title: "EnergyX Az: usage report", rep_pdf_period: "Period: {from} - {to}", rep_pdf_generated: "Generated: {d}",
      rep_pdf_totals: "Totals", rep_pdf_period_totals: "Selected period", rep_pdf_months: "By month",
      rep_pdf_langs: "Interface language (visits)", rep_pdf_note: "All counts are anonymous. Statistics collected since {since}.",
      rep_feedback_val: "{p}% ({n} ratings)",
    },
    ru: {
      rep_30: "30 дней", rep_90: "90 дней", rep_365: "1 год", rep_csv: "Скачать CSV", rep_pdf: "PDF-отчёт",
      rep_daily_title: "Использование по дням", rep_months_title: "По месяцам", rep_lang_title: "Язык интерфейса",
      rep_privacy: "Все данные анонимны: IP-адреса, идентификаторы устройств и личные данные не хранятся.",
      rep_visits: "Посещения", rep_calcs: "Расчёты", rep_ai: "Вопросы консультанту", rep_pdfs: "PDF-отчёты",
      rep_savings: "Рассчитанная экономия, ₼", rep_feedback: "Полезные ответы",
      rep_in_period: "за выбранный период: {n}", rep_total_note: "Всего с {since}",
      rep_month: "Месяц", rep_none: "За этот период данных пока нет.",
      rep_loading: "Загрузка статистики...", rep_error: "Статистика сейчас недоступна. Если сервер просыпается, попробуйте через минуту.",
      rep_retry: "Повторить",
      rep_temp: "Статистика пока хранится во временной памяти и обнуляется при перезапуске сервера. Это сообщение исчезнет после подключения постоянного хранилища.",
      rep_pdf_title: "EnergyX Az: отчёт об использовании", rep_pdf_period: "Период: {from} - {to}", rep_pdf_generated: "Подготовлен: {d}",
      rep_pdf_totals: "Общие показатели", rep_pdf_period_totals: "За выбранный период", rep_pdf_months: "По месяцам",
      rep_pdf_langs: "Язык интерфейса (посещения)", rep_pdf_note: "Все данные анонимны. Статистика собирается с {since}.",
      rep_feedback_val: "{p}% ({n} оценок)",
    },
  };
  Object.keys(RT).forEach((l) => Object.assign(translations[l], RT[l]));

  let days = 30, data = null, chart = null, loading = false;
  const METRICS = [
    ["visits", "rep_visits", "--accent"], ["calculations", "rep_calcs", "--low"], ["aiQuestions", "rep_ai", "--mid"],
  ];
  const sum = (rows, k) => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  // Minlik ayırıcı dilə görə (brauzerin dil məlumatından asılı olmadan): az 1.534 · ru 1 534 · en 1,534
  const num = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, { az: ".", ru: "\u00a0", en: "," }[currentLang] || ".");
  const dateLabel = (iso) => { const [y, m, d] = iso.split("-").map(Number); return d + " " + P.shortMonth(P.monthLabel(`${y}-${String(m).padStart(2, "0")}`, true).replace(/\s*\d{4}$/, "")); };

  function note(text, cls, retry) {
    const n = $("repNote");
    n.hidden = !text;
    n.className = "hint-box" + (cls ? " " + cls : "");
    n.textContent = text || "";
    if (retry) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "ghost-btn report-retry"; b.textContent = T().rep_retry;
      b.addEventListener("click", load);
      n.appendChild(b);
    }
  }

  async function load() {
    if (loading) return;
    loading = true;
    note(T().rep_loading);
    try {
      const [s, d] = await Promise.all([
        fetch(`${API_BASE}/stats`).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
        fetch(`${API_BASE}/stats/daily?days=${days}`).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      ]);
      data = { totals: s, rows: Array.isArray(d.days) ? d.days : [] };
      note(s.storage === "file" ? T().rep_temp : "", "warn");
      render();
    } catch (e) {
      data = null;
      note(T().rep_error, "warn", true);
      $("repKpis").innerHTML = "";
      $("repMonths").innerHTML = "";
      $("repLangs").innerHTML = "";
      $("repPeriod").textContent = "";
      if (chart) { chart.destroy(); chart = null; }
    } finally {
      loading = false;
    }
  }

  function months(rows) {
    const m = new Map();
    rows.forEach((r) => {
      const k = r.date.slice(0, 7);
      const a = m.get(k) || { month: k, visits: 0, calculations: 0, aiQuestions: 0, pdfExports: 0, savings: 0 };
      ["visits", "calculations", "aiQuestions", "pdfExports", "savings"].forEach((f) => (a[f] += Number(r[f]) || 0));
      m.set(k, a);
    });
    return [...m.values()];
  }

  function render() {
    if (!data) return;
    const t = T(), s = data.totals, rows = data.rows;
    const up = Number(s.aiFeedbackUp) || 0, down = Number(s.aiFeedbackDown) || 0;
    const fb = up + down ? fmt(t.rep_feedback_val, { p: Math.round((up / (up + down)) * 100), n: up + down }) : "-";
    const kpis = [
      [t.rep_visits, num(s.totalVisits), sum(rows, "visits")],
      [t.rep_calcs, num(s.totalCalculations), sum(rows, "calculations")],
      [t.rep_ai, num(s.totalAiQuestions), sum(rows, "aiQuestions")],
      [t.rep_pdfs, num(s.totalPdfExports), sum(rows, "pdfExports")],
      [t.rep_savings, num(Math.round(s.totalSavingsIdentified || 0)), Math.round(sum(rows, "savings"))],
      [t.rep_feedback, fb, null],
    ];
    $("repKpis").innerHTML = kpis.map(([label, val, period]) => `<div class="stat-card">
        <div class="stat-num">${esc(val)}</div><div class="stat-label">${esc(label)}</div>
        ${period == null ? "" : `<div class="stat-sub">${esc(fmt(t.rep_in_period, { n: num(period) }))}</div>`}
      </div>`).join("");
    $("repPeriod").textContent = rows.length ? `${dateLabel(rows[0].date)} - ${dateLabel(rows[rows.length - 1].date)}` : "";

    // Aylar üzrə cədvəl (ən yeni ay yuxarıda)
    const ms = months(rows).reverse();
    const has = ms.some((m) => m.visits || m.calculations || m.aiQuestions);
    $("repMonths").innerHTML = has ? `<thead><tr><th>${esc(t.rep_month)}</th><th>${esc(t.rep_visits)}</th><th>${esc(t.rep_calcs)}</th>
        <th>${esc(t.rep_ai)}</th><th>${esc(t.rep_pdfs)}</th></tr></thead><tbody>` +
      ms.map((m) => `<tr><td>${esc(P.monthLabel(m.month))}</td><td>${num(m.visits)}</td><td>${num(m.calculations)}</td>
        <td>${num(m.aiQuestions)}</td><td>${num(m.pdfExports)}</td></tr>`).join("") + "</tbody>"
      : `<tbody><tr><td>${esc(t.rep_none)}</td></tr></tbody>`;

    // Dil bölgüsü (bütün dövr)
    const langs = s.languages || {}, totalL = ["az", "en", "ru"].reduce((a, l) => a + (Number(langs[l]) || 0), 0);
    $("repLangs").innerHTML = ["az", "en", "ru"].map((l) => {
      const n = Number(langs[l]) || 0, p = totalL ? Math.round((n / totalL) * 100) : 0;
      return `<div class="rep-lang"><span class="rep-lang-name">${l.toUpperCase()}</span>
        <span class="rep-lang-bar"><span style="width:${p}%"></span></span><span class="rep-lang-val">${num(n)} · ${p}%</span></div>`;
    }).join("") + (s.since ? `<p class="pro-note">${esc(fmt(t.rep_total_note, { since: s.since }))}</p>` : "");

    drawChart();
  }

  function drawChart() {
    if (!data || typeof Chart === "undefined" || !$("panel-stats").classList.contains("active")) return;
    const t = T(), rows = data.rows;
    const cfg = {
      labels: rows.map((r) => dateLabel(r.date)),
      datasets: METRICS.map(([k, label, color]) => ({ label: t[label], data: rows.map((r) => r[k] || 0), borderColor: P.cssVar(color),
        backgroundColor: P.tint(color, 0.12), borderWidth: 2, pointRadius: rows.length > 60 ? 0 : 2, tension: 0.3, fill: k === "visits" })),
    };
    const opts = P.chartBase();
    opts.scales.y.ticks.precision = 0;
    opts.scales.x.ticks.maxTicksLimit = 10;
    opts.interaction = { mode: "index", intersect: false };
    if (chart) { chart.data = cfg; chart.options = opts; chart.update(); }
    else chart = new Chart($("repChart"), { type: "line", data: cfg, options: opts });
  }

  // ===== CSV =====
  function csv() {
    if (!data) return;
    const t = T(), dec = currentLang === "en" ? "." : ",";
    const head = ["date", t.rep_visits, t.rep_calcs, t.rep_ai, t.rep_pdfs, "feedback_up", "feedback_down", t.rep_savings];
    const lines = [head.join(";")].concat(data.rows.map((r) => [r.date, r.visits, r.calculations, r.aiQuestions, r.pdfExports,
      r.feedbackUp, r.feedbackDown, String(r.savings || 0).replace(".", dec)].join(";")));
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `energyx-az-statistika-${data.rows.length ? data.rows[0].date + "_" + data.rows[data.rows.length - 1].date : "bos"}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ===== PDF (Fond üçün) =====
  async function pdf() {
    if (!data) return;
    const t = T(), k = P.pdfKit;
    let b64;
    try { [b64] = await Promise.all([k.loadFont(), k.loadJsPdf()]); } catch { P.toast(t.pdf_font_err, "bad"); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.addFileToVFS("DejaVuSans.ttf", b64);
    doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
    doc.setFont("DejaVu");
    try { doc.addImage(await k.loadLogo(), "JPEG", 128, 10, 62, 12.2); } catch {}
    const s = data.totals, rows = data.rows;
    let y = 18;
    doc.setFontSize(17); doc.setTextColor(20); doc.text(t.rep_pdf_title, 20, y); y += 9;
    doc.setFontSize(10); doc.setTextColor(90);
    if (rows.length) { doc.text(fmt(t.rep_pdf_period, { from: rows[0].date, to: rows[rows.length - 1].date }), 20, y); y += 5; }
    doc.text(fmt(t.rep_pdf_generated, { d: new Date().toISOString().slice(0, 10) }), 20, y); y += 10;
    const head = (h) => { doc.setFontSize(13); doc.setTextColor(20); doc.text(h, 20, y); y += 7; doc.setFontSize(10.5); doc.setTextColor(40); };
    const line = (a, b) => { doc.text(String(a), 24, y); doc.text(String(b), 120, y); y += 6; };
    const up = Number(s.aiFeedbackUp) || 0, down = Number(s.aiFeedbackDown) || 0;
    head(t.rep_pdf_totals);
    line(t.rep_visits, num(s.totalVisits)); line(t.rep_calcs, num(s.totalCalculations)); line(t.rep_ai, num(s.totalAiQuestions));
    line(t.rep_pdfs, num(s.totalPdfExports)); line(t.rep_savings, num(Math.round(s.totalSavingsIdentified || 0)));
    line(t.rep_feedback, up + down ? fmt(t.rep_feedback_val, { p: Math.round((up / (up + down)) * 100), n: up + down }) : "-");
    y += 4;
    head(t.rep_pdf_period_totals);
    line(t.rep_visits, num(sum(rows, "visits"))); line(t.rep_calcs, num(sum(rows, "calculations")));
    line(t.rep_ai, num(sum(rows, "aiQuestions"))); line(t.rep_pdfs, num(sum(rows, "pdfExports")));
    y += 4;
    head(t.rep_pdf_months);
    const cols = [24, 70, 100, 130, 165];
    doc.setTextColor(90);
    [t.rep_month, t.rep_visits, t.rep_calcs, t.rep_ai, t.rep_pdfs].forEach((h, i) => doc.text(h, cols[i], y));
    y += 6; doc.setTextColor(40);
    months(rows).reverse().forEach((m) => {
      if (y > 262) { doc.addPage(); y = 20; }
      [P.monthLabel(m.month), num(m.visits), num(m.calculations), num(m.aiQuestions), num(m.pdfExports)].forEach((v, i) => doc.text(String(v), cols[i], y));
      y += 6;
    });
    y += 4;
    if (y > 240) { doc.addPage(); y = 20; }
    head(t.rep_pdf_langs);
    const langs = s.languages || {};
    ["az", "en", "ru"].forEach((l) => line(l.toUpperCase(), num(langs[l])));
    y += 2; doc.setFontSize(9.5); doc.setTextColor(110);
    doc.text(doc.splitTextToSize(fmt(t.rep_pdf_note, { since: s.since || "-" }) + " " + t.rep_privacy, 170), 20, y);
    doc.setFontSize(8.5); doc.setTextColor(150);
    for (let i = 1, n = doc.getNumberOfPages(); i <= n; i++) {
      doc.setPage(i);
      doc.text(doc.splitTextToSize(t.fund_disclaimer, 170), 20, 280);
    }
    doc.save(`energyx-az-hesabat-statistika-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ===== HADİSƏLƏR =====
  $("repRange").addEventListener("click", (e) => {
    const b = e.target.closest("[data-days]");
    if (!b || loading) return;
    days = Number(b.dataset.days);
    $("repRange").querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
    load();
  });
  $("repCsv").addEventListener("click", csv);
  $("repPdf").addEventListener("click", pdf);

  // Dil / tema dəyişəndə yenidən çəkilir; bölmə açılanda qrafik görünən ölçüdə qurulur
  const origRefresh = window.EnergyExtras.refresh;
  window.EnergyExtras.refresh = function (state, tab) {
    origRefresh(state, tab);
    if (data && $("panel-stats").classList.contains("active")) render();
  };

  // Səfər: bir sessiyada bir dəfə (yalnız interfeys dili göndərilir)
  try {
    if (!sessionStorage.getItem("energyx_visit")) {
      sessionStorage.setItem("energyx_visit", "1");
      setTimeout(() => trackEvent("visit"), 2500);
    }
  } catch (e) {}

  window.EnergyReport = { load, render };
  applyTranslations(currentLang);
  if ($("panel-stats").classList.contains("active")) load();
})();
