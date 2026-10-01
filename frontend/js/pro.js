// ==========================================
// EnergyX Az — Analitika, Planlaşdırma, Təqdimat rejimi, PDF, Yedəkləmə
// Əsas skriptdən (index.html) SONRA yüklənir; onun qlobal dəyişənlərindən
// (slider, simSlider, appliances, translations, currentLang, getMeters,
// setMeters, renderMeters, renderAppliances, switchTab, esc) istifadə edir.
// ==========================================
(function () {
  "use strict";
  const E = window.EnergyEngine;

  // ===== TƏRCÜMƏLƏR =====
  const PT = {
    az: {
      present_btn: "▶ Təqdimat", tab_insights: "Analitika", tab_plan: "Planlaşdır",
      backup_export: "💾 Məlumatları ixrac et", backup_import: "📂 İdxal et",
      ins_title: "Enerji Analitikası",
      ins_lead: "Sayğac tarixçənizə əsaslanan sağlamlıq balı, anomaliya aşkarlanması, 12 aylıq proqnoz və ekoloji təsir. Hesablamalar yalnız sizin cihazınızda aparılır.",
      ins_source: "Məlumat mənbəyi:", ins_sample: "🧪 Nümunə məlumat yüklə", ins_sample_clear: "Nümunəni sil",
      src_current: "Kalkulyatordakı cari dəyər",
      ins_hint_nodata: "Anomaliya aşkarlanması üçün ən azı 4 aylıq oxunuş lazımdır. Kalkulyator bölməsində \"Sayğaclarım\"-a hər ay üçün ayrıca qeyd əlavə edin və ya nümunə məlumatı yükləyin.",
      health_title: "Enerji Sağlamlıq Balı", health_tag: "uzunmüddətli göstərici",
      health_factors: "Balı aşağı salan amillər (kök-səbəb payı)",
      health_perfect: "Heç bir mənfi amil aşkarlanmayıb — əla nəticə! 🌿",
      grade_A: "Əla", grade_B: "Yaxşı", grade_C: "Orta", grade_D: "Zəif", grade_E: "Kritik",
      factor_tier: "Yüksək tarif pilləsi", factor_trend: "Artan istifadə trendi", factor_anomaly: "Qeyri-adi aylar (anomaliya)",
      factor_devices: "Effektivsiz cihazlar", factor_budget: "Büdcə aşımı",
      anom_title: "Anomaliya Aşkarlayıcısı",
      anom_lead: "Hər ayın istifadəsi mövsümə görə düzəldilir və əvvəlki aylarla müqayisə olunur. Qırmızı — anomaliya, sarı — müşahidə.",
      timeline_title: "Hadisə xronologiyası", anom_none: "Qeyri-adi ay aşkarlanmayıb ✅",
      anom_level_anomaly: "Anomaliya", anom_level_watch: "Müşahidə", anom_sustained: "davamlı",
      anom_detail: "Gözlənilən ~{e} kVt, faktiki {a} kVt ({pct})",
      cause_up_spike: "Tək sıçrayış: yeni cihaz, qonaqlar və ya elektrik qızdırıcısı ola bilər.",
      cause_up_sustained: "Davamlı artım: cihaz nasazlığı (məs. su qızdırıcısının termostatı, soyuducunun kompressoru) və ya izolyasiya problemi ola bilər. Yoxlamağa dəyər.",
      cause_down_spike: "Kəskin azalma: evdə olmamaq və ya sayğac oxunuşunda səhv ola bilər.",
      cause_down_sustained: "Davamlı azalma: qənaət tədbirləri işləyir — və ya sayğacı yoxlatmağa dəyər.",
      chart_actual: "Faktiki", chart_expected: "Gözlənilən", chart_forecast: "Proqnoz", chart_band_lo: "Aşağı hədd", chart_band_hi: "Yuxarı hədd",
      fc_title: "12 Aylıq Proqnoz", fc_year: "Növbəti 12 ay, ₼", fc_range: "95% aralıq, ₼", fc_peak: "Ən baha ay",
      fc_basis_history: "Son aylarınızın mövsümə görə düzəldilmiş səviyyəsi + Bakının aylıq temperatur normaları əsasında.",
      fc_basis_current: "Tarixçə az olduğu üçün Kalkulyatordakı cari dəyər əsas götürülüb (±15% qeyri-müəyyənlik).",
      eco_title: "İllik Ekoloji İz", eco_co2: "kq CO₂ / il", eco_trees: "ağacın illik udumu", eco_car: "km avtomobil yolu", eco_loss: "kVt şəbəkədə itir",
      eco_note: "Mənbələr: CO₂ — 719 q/kVt (Asian Transport Outlook, 2022); şəbəkə itkisi — 7.6% (Dünya Bankı WDI, 2023); avtomobil — ~170 q/km (təxmini orta).",
      plan_title: "Planlaşdırma Mərkəzi",
      plan_lead: "Ay ərzində büdcənizi qoruyun, \"əgər...?\" ssenarilərini sınayın və hansı sərmayənin özünü ən tez ödədiyini görün.",
      pace_title: "Büdcə Mühafizəçisi", pace_tag: "ay içi geri sayım",
      pace_lead: "Sayğacınızdan bu ayın başından bəri yığılan kVt·saatı bir neçə dəfə qeyd edin — sistem templə hansı gün baha pilləyə və ya büdcə həddinə çatacağınızı hesablayır.",
      pace_budget: "Aylıq büdcə (₼)", pace_day: "Ayın günü", pace_cum: "Yığılmış kVt·saat", pace_add: "Qeyd et",
      pace_empty: "Hələ qeyd yoxdur. Məsələn: ayın 10-u, 120 kVt·saat.",
      pace_daily: "Gündəlik temp", pace_projected: "Ay sonu proqnozu",
      pace_cross: "{t} kVt həddi", pace_on_day: "ayın {d}-də", pace_not_this_month: "bu ay keçilməyəcək", pace_already: "artıq keçilib",
      pace_budget_over: "⚠️ Bu templə {b} ₼ büdcəniz ayın {d}-də bitəcək.", pace_budget_over_nod: "⚠️ Bu templə ay sonunda büdcəni aşacaqsınız.",
      pace_budget_ok: "✅ Büdcə daxilindəsiniz.", pace_safe: "Büdcədə qalmaq üçün gündə ≤ {n} kVt·saat.",
      toast_pace_over: "Büdcə xəbərdarlığı: ay sonu proqnozu {c} ₼ — büdcəniz {b} ₼.",
      toast_tier_soon: "Diqqət: bu templə ayın {d}-də 15 qəpiklik pilləyə keçəcəksiniz.",
      toast_anomaly: "Anomaliya aşkarlandı: {m} ayında istifadə gözləniləndən {pct} çox.",
      wi_title: "\"Əgər...?\" Simulyatoru", wi_tag: "real məlumatınız dəyişmir",
      wi_lead: "Vərdişlərinizi dəyişsəniz nə olar? Tədbirləri seçin — nəticə Kalkulyatordakı istifadəyə və Cihazlar siyahısına əsaslanır.",
      wi_ac: "Kondisioneri neçə °C yüksək qoyum", wi_top: "Ən çox yeyən cihazın işləmə vaxtını azalt",
      wi_led: "Bütün lampaları LED ilə əvəz et", wi_standby: "Gözləmə rejimindəki cihazları tam söndür",
      wi_washer: "Paltarı 30°C-də yu", wi_wh: "Su qızdırıcını 55°C-yə endir",
      wi_before: "İndi", wi_after: "Tədbirlərdən sonra", wi_saved_month: "Aylıq qənaət", wi_saved_year: "İllik qənaət",
      wi_co2: "Aylıq CO₂ azalması", wi_tier_change: "🎉 Daha ucuz pilləyə keçirsiniz: {from} → {to}",
      wi_none: "Yuxarıdan ən azı bir tədbir seçin.",
      wi_hint_devices: "Bəzi tədbirlər Cihazlar siyahısındakı uyğun cihazı tələb edir (kondisioner, lampa, paltaryuyan, su qızdırıcı). Cihazlar bölməsinə əlavə edin.",
      part_ac: "Kondisioner", part_led: "LED lampalar", part_washer: "30°C yuma", part_water_heater: "Su qızdırıcı", part_standby: "Gözləmə rejimi", part_top: "Az istifadə",
      inv_title: "Sərmayə Geri Ödəmə Planı", inv_tag: "prioritet sıralaması",
      inv_lead: "Qənaət pilləli tarifə görə real hesablanır (marjinal tarif). Qiymətlər fərziyyədir — öz bazar qiymətlərinizi yazın.",
      inv_led_count: "Közərmə lampa sayı", inv_plug_count: "Ağıllı rozetka sayı", inv_p_led: "LED lampa, ₼", inv_p_inv: "İnverter kondisioner, ₼",
      inv_p_fridge: "A+++ soyuducu, ₼", inv_p_plug: "Ağıllı rozetka, ₼",
      inv_key_led: "💡 LED lampalar", inv_key_inverter: "❄️ İnverter kondisioner", inv_key_fridge: "🧊 A+++ soyuducu", inv_key_plug: "🔌 Ağıllı rozetkalar",
      inv_col_measure: "Tədbir", inv_col_cost: "Xərc", inv_col_save: "Qənaət/ay", inv_col_payback: "Geri ödəmə", inv_col_net: "5 illik xalis",
      inv_months: "ay", inv_never: "—", inv_top: "1-ci prioritet",
      inv_empty: "Planı görmək üçün lampa sayını yazın və ya Cihazlar bölməsinə kondisioner/soyuducu əlavə edin.",
      backup_done: "Məlumatlar JSON faylı kimi endirildi.", backup_imported: "Məlumatlar uğurla bərpa olundu.",
      backup_invalid: "Fayl EnergyX Az yedəyi deyil və ya zədələnib.", backup_confirm: "Mövcud sayğac və cihaz məlumatları yedəkdəkilərlə əvəz olunsun?",
      sample_loaded: "Nümunə məlumat yükləndi (\"Nümunə ev\" — real deyil).", sample_cleared: "Nümunə məlumat silindi.",
      pres_stop: "Dayandır", pres_done: "Təqdimat bitdi — məlumatlarınız bərpa olundu.",
      pres_steps: [
        "1/7 · Kalkulyator: sürüşdürücü hərəkət etdikcə pillə, xərc və CO₂ anında yenilənir.",
        "2/7 · Ay sonu proqnozu və növbəti pilləyə geri sayım — istifadəçi bahalaşmanı əvvəlcədən görür.",
        "3/7 · Enerji Sağlamlıq Balı: problemlər kök-səbəb payı ilə sıralanır.",
        "4/7 · Anomaliya Aşkarlayıcısı: son 2 ayda davamlı artım tapıldı — ehtimal olunan səbəb izah olunur.",
        "5/7 · 12 aylıq proqnoz Bakının iqlim normalarına əsaslanır, 95% etibarlılıq aralığı ilə.",
        "6/7 · \"Əgər...?\" simulyatoru: bir neçə sadə vərdiş istifadəçini ucuz pilləyə qaytarır.",
        "7/7 · Sərmayə planı: hansı alış özünü ən tez ödəyir — pilləli tarifə görə real hesab.",
      ],
      local_prefix: "🤖 (Oflayn köməkçi) ",
      local_save: "Ən effektiv addımlar: {list}. Bunlarla ayda təxminən {azn} ₼ ({kwh} kVt) qənaət edə bilərsiniz.",
      local_save_none: "Cihazlar bölməsinə cihazlarınızı əlavə edin — onda konkret qənaət planı hazırlaya bilərəm. Ümumi məsləhət: LED lampalar, kondisioneri 24-25°C, gözləmə rejimini söndürmək.",
      local_tier: "Hazırda {kwh} kVt istifadə edirsiniz ({tier}). {countdown}",
      local_forecast: "Növbəti 12 ay üçün proqnoz: təxminən {cost} ₼ (95% aralıq {lo}–{hi} ₼). Ən baha ay — {peak}.",
      local_anomaly: "Son qeyri-adi ay: {m} — {detail}. {cause}",
      local_anomaly_none: "Sayğac tarixçənizdə qeyri-adi ay aşkarlanmayıb.",
      local_health: "Enerji sağlamlıq balınız {score}/100 ({grade}). Əsas amil: {factor}.",
      pdf_title: "Enerji Hesabatı", pdf_usage: "Bu ayın istifadəsi", pdf_cost: "Təxmini xərc", pdf_tier: "Tarif pilləsi",
      pdf_health: "Enerji sağlamlıq balı", pdf_forecast: "12 aylıq proqnoz", pdf_anomalies: "Aşkarlanan anomaliyalar",
      pdf_whatif: "Qənaət potensialı (seçilmiş tədbirlər)", pdf_eco: "İllik ekoloji iz", pdf_invest: "Ən yaxşı sərmayə",
      pdf_disclaimer: "Bu hesabat təxminidir və rəsmi Tarif Şurası tariflərinə əsaslanır. Sayğacınızın göstəricisi əsas mənbədir.",
      pdf_font_err: "PDF şrifti yüklənmədi. İnternet bağlantınızı yoxlayın.",
      offline_ready: "Tətbiq oflayn istifadəyə hazırdır.",
    },
    en: {
      present_btn: "▶ Demo", tab_insights: "Insights", tab_plan: "Plan",
      backup_export: "💾 Export data", backup_import: "📂 Import",
      ins_title: "Energy Insights",
      ins_lead: "Health score, anomaly detection, a 12-month forecast and environmental impact based on your meter history. All calculations run only on your device.",
      ins_source: "Data source:", ins_sample: "🧪 Load sample data", ins_sample_clear: "Remove sample",
      src_current: "Current Calculator value",
      ins_hint_nodata: "Anomaly detection needs at least 4 monthly readings. Add a separate entry per month under \"My Meters\" in the Calculator, or load the sample data.",
      health_title: "Energy Health Score", health_tag: "long-term indicator",
      health_factors: "What lowers your score (root-cause share)",
      health_perfect: "No negative factors detected — excellent! 🌿",
      grade_A: "Excellent", grade_B: "Good", grade_C: "Fair", grade_D: "Weak", grade_E: "Critical",
      factor_tier: "High tariff tier", factor_trend: "Rising usage trend", factor_anomaly: "Unusual months (anomalies)",
      factor_devices: "Inefficient appliances", factor_budget: "Over budget",
      anom_title: "Anomaly Detector",
      anom_lead: "Each month is adjusted for seasonality and compared with previous months. Red — anomaly, amber — watch.",
      timeline_title: "Incident timeline", anom_none: "No unusual months detected ✅",
      anom_level_anomaly: "Anomaly", anom_level_watch: "Watch", anom_sustained: "sustained",
      anom_detail: "Expected ~{e} kWh, actual {a} kWh ({pct})",
      cause_up_spike: "Single spike: could be a new appliance, guests or an electric heater.",
      cause_up_sustained: "Sustained increase: could be a faulty appliance (e.g. water-heater thermostat, fridge compressor) or insulation problem. Worth checking.",
      cause_down_spike: "Sharp drop: could be time away from home or a meter-reading error.",
      cause_down_sustained: "Sustained drop: your savings are working — or the meter is worth checking.",
      chart_actual: "Actual", chart_expected: "Expected", chart_forecast: "Forecast", chart_band_lo: "Lower bound", chart_band_hi: "Upper bound",
      fc_title: "12-Month Forecast", fc_year: "Next 12 months, ₼", fc_range: "95% range, ₼", fc_peak: "Most expensive month",
      fc_basis_history: "Based on your recent season-adjusted level + Baku's monthly temperature normals.",
      fc_basis_current: "Not enough history, so the current Calculator value is used (±15% uncertainty).",
      eco_title: "Annual Environmental Footprint", eco_co2: "kg CO₂ / year", eco_trees: "trees' yearly absorption", eco_car: "km of car driving", eco_loss: "kWh lost in the grid",
      eco_note: "Sources: CO₂ — 719 g/kWh (Asian Transport Outlook, 2022); grid losses — 7.6% (World Bank WDI, 2023); car — ~170 g/km (approximate average).",
      plan_title: "Planning Center",
      plan_lead: "Protect your budget during the month, try \"what if\" scenarios and see which investment pays back fastest.",
      pace_title: "Budget Guard", pace_tag: "in-month countdown",
      pace_lead: "Log the kWh accumulated on your meter since the start of the month a few times — the system works out on which day you'll hit the expensive tier or your budget.",
      pace_budget: "Monthly budget (₼)", pace_day: "Day of month", pace_cum: "Accumulated kWh", pace_add: "Log",
      pace_empty: "No entries yet. Example: day 10, 120 kWh.",
      pace_daily: "Daily pace", pace_projected: "Month-end forecast",
      pace_cross: "{t} kWh threshold", pace_on_day: "on day {d}", pace_not_this_month: "not this month", pace_already: "already crossed",
      pace_budget_over: "⚠️ At this pace your {b} ₼ budget runs out on day {d}.", pace_budget_over_nod: "⚠️ At this pace you'll exceed the budget by month-end.",
      pace_budget_ok: "✅ You're within budget.", pace_safe: "To stay within budget: ≤ {n} kWh per day.",
      toast_pace_over: "Budget alert: month-end forecast {c} ₼ — your budget is {b} ₼.",
      toast_tier_soon: "Heads up: at this pace you'll enter the 15-qapik tier on day {d}.",
      toast_anomaly: "Anomaly detected: usage in {m} was {pct} above expected.",
      wi_title: "\"What If\" Simulator", wi_tag: "your real data is unchanged",
      wi_lead: "What happens if you change your habits? Pick measures — results use your Calculator usage and Appliances list.",
      wi_ac: "Raise AC setpoint by °C", wi_top: "Cut run time of the biggest consumer",
      wi_led: "Replace all bulbs with LEDs", wi_standby: "Switch standby devices fully off",
      wi_washer: "Wash clothes at 30°C", wi_wh: "Lower water heater to 55°C",
      wi_before: "Now", wi_after: "After measures", wi_saved_month: "Monthly savings", wi_saved_year: "Yearly savings",
      wi_co2: "Monthly CO₂ reduction", wi_tier_change: "🎉 You move to a cheaper tier: {from} → {to}",
      wi_none: "Choose at least one measure above.",
      wi_hint_devices: "Some measures need a matching appliance in your Appliances list (AC, lamp, washing machine, water heater). Add them in the Appliances tab.",
      part_ac: "Air conditioner", part_led: "LED bulbs", part_washer: "30°C wash", part_water_heater: "Water heater", part_standby: "Standby", part_top: "Less use",
      inv_title: "Investment Payback Plan", inv_tag: "priority ranking",
      inv_lead: "Savings are computed on the tiered tariff (marginal rate). Prices are assumptions — enter your own market prices.",
      inv_led_count: "Incandescent bulbs", inv_plug_count: "Smart plugs", inv_p_led: "LED bulb, ₼", inv_p_inv: "Inverter AC, ₼",
      inv_p_fridge: "A+++ fridge, ₼", inv_p_plug: "Smart plug, ₼",
      inv_key_led: "💡 LED bulbs", inv_key_inverter: "❄️ Inverter AC", inv_key_fridge: "🧊 A+++ fridge", inv_key_plug: "🔌 Smart plugs",
      inv_col_measure: "Measure", inv_col_cost: "Cost", inv_col_save: "Saves/mo", inv_col_payback: "Payback", inv_col_net: "5-year net",
      inv_months: "mo", inv_never: "—", inv_top: "Top priority",
      inv_empty: "Enter a bulb count or add an AC/fridge in the Appliances tab to see the plan.",
      backup_done: "Data downloaded as a JSON file.", backup_imported: "Data restored successfully.",
      backup_invalid: "This file is not an EnergyX Az backup or is corrupted.", backup_confirm: "Replace current meter and appliance data with the backup?",
      sample_loaded: "Sample data loaded (\"Nümunə ev\" — not real).", sample_cleared: "Sample data removed.",
      pres_stop: "Stop", pres_done: "Demo finished — your data has been restored.",
      pres_steps: [
        "1/7 · Calculator: tier, cost and CO₂ update instantly as the slider moves.",
        "2/7 · Month-end forecast and next-tier countdown — users see price jumps coming.",
        "3/7 · Energy Health Score: problems ranked by root-cause share.",
        "4/7 · Anomaly Detector: a sustained rise over the last 2 months is found and explained.",
        "5/7 · 12-month forecast built on Baku's climate normals, with a 95% confidence range.",
        "6/7 · \"What if\" simulator: a few simple habits bring the user back to a cheaper tier.",
        "7/7 · Investment plan: which purchase pays back fastest — computed on the real tiered tariff.",
      ],
      local_prefix: "🤖 (Offline assistant) ",
      local_save: "Most effective steps: {list}. Together they could save about {azn} ₼ ({kwh} kWh) per month.",
      local_save_none: "Add your appliances in the Appliances tab and I can build a concrete plan. General tips: LED bulbs, AC at 24-25°C, switch off standby.",
      local_tier: "You currently use {kwh} kWh ({tier}). {countdown}",
      local_forecast: "Forecast for the next 12 months: about {cost} ₼ (95% range {lo}–{hi} ₼). Most expensive month — {peak}.",
      local_anomaly: "Latest unusual month: {m} — {detail}. {cause}",
      local_anomaly_none: "No unusual months found in your meter history.",
      local_health: "Your energy health score is {score}/100 ({grade}). Main factor: {factor}.",
      pdf_title: "Energy Report", pdf_usage: "This month's usage", pdf_cost: "Estimated cost", pdf_tier: "Tariff tier",
      pdf_health: "Energy health score", pdf_forecast: "12-month forecast", pdf_anomalies: "Detected anomalies",
      pdf_whatif: "Savings potential (selected measures)", pdf_eco: "Annual environmental footprint", pdf_invest: "Best investment",
      pdf_disclaimer: "This report is an estimate based on official Tariff Council rates. Your meter reading is the authoritative source.",
      pdf_font_err: "Could not load the PDF font. Check your internet connection.",
      offline_ready: "The app is ready for offline use.",
    },
    ru: {
      present_btn: "▶ Демо", tab_insights: "Аналитика", tab_plan: "План",
      backup_export: "💾 Экспорт данных", backup_import: "📂 Импорт",
      ins_title: "Энергоаналитика",
      ins_lead: "Индекс здоровья, обнаружение аномалий, прогноз на 12 месяцев и экологический след по истории вашего счётчика. Все расчёты выполняются только на вашем устройстве.",
      ins_source: "Источник данных:", ins_sample: "🧪 Загрузить пример", ins_sample_clear: "Удалить пример",
      src_current: "Текущее значение калькулятора",
      ins_hint_nodata: "Для обнаружения аномалий нужно минимум 4 месячных показания. Добавьте отдельную запись за каждый месяц в «Мои счётчики» или загрузите пример.",
      health_title: "Индекс энергоздоровья", health_tag: "долгосрочный показатель",
      health_factors: "Что снижает индекс (доля причин)",
      health_perfect: "Негативных факторов не найдено — отлично! 🌿",
      grade_A: "Отлично", grade_B: "Хорошо", grade_C: "Средне", grade_D: "Слабо", grade_E: "Критично",
      factor_tier: "Высокий тариф", factor_trend: "Рост потребления", factor_anomaly: "Необычные месяцы (аномалии)",
      factor_devices: "Неэффективные приборы", factor_budget: "Превышение бюджета",
      anom_title: "Детектор аномалий",
      anom_lead: "Потребление каждого месяца корректируется на сезон и сравнивается с предыдущими. Красный — аномалия, жёлтый — наблюдение.",
      timeline_title: "Хронология событий", anom_none: "Необычных месяцев не обнаружено ✅",
      anom_level_anomaly: "Аномалия", anom_level_watch: "Наблюдение", anom_sustained: "устойчиво",
      anom_detail: "Ожидалось ~{e} кВт·ч, факт {a} кВт·ч ({pct})",
      cause_up_spike: "Разовый скачок: новый прибор, гости или электрообогреватель.",
      cause_up_sustained: "Устойчивый рост: возможна неисправность прибора (термостат водонагревателя, компрессор холодильника) или проблема с утеплением. Стоит проверить.",
      cause_down_spike: "Резкое падение: отъезд или ошибка в показаниях счётчика.",
      cause_down_sustained: "Устойчивое снижение: меры экономии работают — или стоит проверить счётчик.",
      chart_actual: "Факт", chart_expected: "Ожидание", chart_forecast: "Прогноз", chart_band_lo: "Нижняя граница", chart_band_hi: "Верхняя граница",
      fc_title: "Прогноз на 12 месяцев", fc_year: "Следующие 12 мес., ₼", fc_range: "Диапазон 95%, ₼", fc_peak: "Самый дорогой месяц",
      fc_basis_history: "На основе вашего сезонно скорректированного уровня + климатических норм Баку.",
      fc_basis_current: "Истории мало, поэтому используется текущее значение калькулятора (±15%).",
      eco_title: "Годовой экологический след", eco_co2: "кг CO₂ / год", eco_trees: "годовое поглощение деревьев", eco_car: "км на автомобиле", eco_loss: "кВт·ч теряется в сети",
      eco_note: "Источники: CO₂ — 719 г/кВт·ч (Asian Transport Outlook, 2022); потери в сети — 7.6% (Всемирный банк WDI, 2023); автомобиль — ~170 г/км (приблизительно).",
      plan_title: "Центр планирования",
      plan_lead: "Контролируйте бюджет в течение месяца, пробуйте сценарии «что если» и смотрите, какая покупка окупится быстрее.",
      pace_title: "Страж бюджета", pace_tag: "обратный отсчёт",
      pace_lead: "Несколько раз запишите кВт·ч, накопленные на счётчике с начала месяца — система рассчитает, в какой день вы перейдёте на дорогой тариф или превысите бюджет.",
      pace_budget: "Месячный бюджет (₼)", pace_day: "День месяца", pace_cum: "Накоплено кВт·ч", pace_add: "Записать",
      pace_empty: "Записей пока нет. Пример: 10-й день, 120 кВт·ч.",
      pace_daily: "Темп в день", pace_projected: "Прогноз на конец месяца",
      pace_cross: "Порог {t} кВт·ч", pace_on_day: "{d}-го числа", pace_not_this_month: "не в этом месяце", pace_already: "уже пройден",
      pace_budget_over: "⚠️ При таком темпе бюджет {b} ₼ закончится {d}-го числа.", pace_budget_over_nod: "⚠️ При таком темпе к концу месяца бюджет будет превышен.",
      pace_budget_ok: "✅ Вы в рамках бюджета.", pace_safe: "Чтобы уложиться: ≤ {n} кВт·ч в день.",
      toast_pace_over: "Бюджет: прогноз на конец месяца {c} ₼ — ваш бюджет {b} ₼.",
      toast_tier_soon: "Внимание: при таком темпе {d}-го числа начнётся тариф 15 гяпиков.",
      toast_anomaly: "Обнаружена аномалия: в {m} потребление на {pct} выше ожидаемого.",
      wi_title: "Симулятор «Что если?»", wi_tag: "реальные данные не меняются",
      wi_lead: "Что будет, если изменить привычки? Выберите меры — расчёт основан на калькуляторе и списке приборов.",
      wi_ac: "Поднять температуру кондиционера на °C", wi_top: "Сократить работу самого прожорливого прибора",
      wi_led: "Заменить все лампы на LED", wi_standby: "Полностью выключать приборы в режиме ожидания",
      wi_washer: "Стирать при 30°C", wi_wh: "Снизить водонагреватель до 55°C",
      wi_before: "Сейчас", wi_after: "После мер", wi_saved_month: "Экономия в месяц", wi_saved_year: "Экономия в год",
      wi_co2: "Снижение CO₂ в месяц", wi_tier_change: "🎉 Вы переходите на более дешёвый тариф: {from} → {to}",
      wi_none: "Выберите хотя бы одну меру выше.",
      wi_hint_devices: "Некоторым мерам нужен соответствующий прибор в списке (кондиционер, лампа, стиральная машина, водонагреватель). Добавьте их во вкладке «Приборы».",
      part_ac: "Кондиционер", part_led: "LED-лампы", part_washer: "Стирка 30°C", part_water_heater: "Водонагреватель", part_standby: "Режим ожидания", part_top: "Меньше работы",
      inv_title: "План окупаемости", inv_tag: "приоритеты",
      inv_lead: "Экономия рассчитывается по ступенчатому тарифу (предельная ставка). Цены — допущения, введите свои.",
      inv_led_count: "Ламп накаливания", inv_plug_count: "Умных розеток", inv_p_led: "LED-лампа, ₼", inv_p_inv: "Инверторный кондиционер, ₼",
      inv_p_fridge: "Холодильник A+++, ₼", inv_p_plug: "Умная розетка, ₼",
      inv_key_led: "💡 LED-лампы", inv_key_inverter: "❄️ Инверторный кондиционер", inv_key_fridge: "🧊 Холодильник A+++", inv_key_plug: "🔌 Умные розетки",
      inv_col_measure: "Мера", inv_col_cost: "Цена", inv_col_save: "Экономия/мес", inv_col_payback: "Окупаемость", inv_col_net: "Итог за 5 лет",
      inv_months: "мес", inv_never: "—", inv_top: "Главный приоритет",
      inv_empty: "Укажите число ламп или добавьте кондиционер/холодильник во вкладке «Приборы».",
      backup_done: "Данные скачаны как JSON-файл.", backup_imported: "Данные успешно восстановлены.",
      backup_invalid: "Файл не является резервной копией EnergyX Az или повреждён.", backup_confirm: "Заменить текущие данные счётчиков и приборов данными из копии?",
      sample_loaded: "Пример загружен («Nümunə ev» — не реальные данные).", sample_cleared: "Пример удалён.",
      pres_stop: "Стоп", pres_done: "Демо завершено — ваши данные восстановлены.",
      pres_steps: [
        "1/7 · Калькулятор: тариф, стоимость и CO₂ обновляются мгновенно.",
        "2/7 · Прогноз на конец месяца и отсчёт до следующего тарифа.",
        "3/7 · Индекс энергоздоровья: проблемы ранжированы по доле причин.",
        "4/7 · Детектор аномалий: найден и объяснён устойчивый рост за 2 месяца.",
        "5/7 · Прогноз на 12 месяцев по климатическим нормам Баку с интервалом 95%.",
        "6/7 · «Что если?»: несколько простых привычек возвращают на дешёвый тариф.",
        "7/7 · План инвестиций: что окупится быстрее — по реальному ступенчатому тарифу.",
      ],
      local_prefix: "🤖 (Офлайн-помощник) ",
      local_save: "Самые эффективные шаги: {list}. Вместе они сэкономят около {azn} ₼ ({kwh} кВт·ч) в месяц.",
      local_save_none: "Добавьте приборы во вкладке «Приборы», и я составлю конкретный план. Общие советы: LED-лампы, кондиционер на 24-25°C, отключение режима ожидания.",
      local_tier: "Сейчас вы потребляете {kwh} кВт·ч ({tier}). {countdown}",
      local_forecast: "Прогноз на 12 месяцев: около {cost} ₼ (диапазон 95%: {lo}–{hi} ₼). Самый дорогой месяц — {peak}.",
      local_anomaly: "Последний необычный месяц: {m} — {detail}. {cause}",
      local_anomaly_none: "В истории счётчика необычных месяцев нет.",
      local_health: "Ваш индекс энергоздоровья {score}/100 ({grade}). Главный фактор: {factor}.",
      pdf_title: "Энергоотчёт", pdf_usage: "Потребление в этом месяце", pdf_cost: "Оценка стоимости", pdf_tier: "Тариф",
      pdf_health: "Индекс энергоздоровья", pdf_forecast: "Прогноз на 12 месяцев", pdf_anomalies: "Обнаруженные аномалии",
      pdf_whatif: "Потенциал экономии (выбранные меры)", pdf_eco: "Годовой экологический след", pdf_invest: "Лучшая инвестиция",
      pdf_disclaimer: "Отчёт является оценкой на основе официальных тарифов Тарифного совета. Показания счётчика — основной источник.",
      pdf_font_err: "Не удалось загрузить шрифт PDF. Проверьте подключение к интернету.",
      offline_ready: "Приложение готово к работе офлайн.",
    },
  };
  Object.keys(PT).forEach((l) => Object.assign(translations[l], PT[l]));

  const PRESETS = [
    { az: "Soyuducu", en: "Fridge", ru: "Холодильник", icon: "🧊", w: 150, h: 10 },
    { az: "Kondisioner", en: "Air conditioner", ru: "Кондиционер", icon: "❄️", w: 1000, h: 6 },
    { az: "Televizor", en: "TV", ru: "Телевизор", icon: "📺", w: 100, h: 5 },
    { az: "Paltaryuyan", en: "Washing machine", ru: "Стиральная машина", icon: "👕", w: 500, h: 1 },
    { az: "Su qızdırıcı", en: "Water heater", ru: "Водонагреватель", icon: "🚿", w: 1500, h: 2 },
    { az: "LED lampa", en: "LED light", ru: "LED лампа", icon: "💡", w: 9, h: 5 },
    { az: "Kompüter", en: "Computer", ru: "Компьютер", icon: "💻", w: 200, h: 6 },
    { az: "Mikrodalğa", en: "Microwave", ru: "Микроволновая печь", icon: "🍲", w: 800, h: 0.5 },
    { az: "Çaydan", en: "Kettle", ru: "Чайник", icon: "☕", w: 2000, h: 0.5 },
  ];

  // ===== KÖMƏKÇİLƏR =====
  const $ = (id) => document.getElementById(id);
  const T = () => translations[currentLang];
  function fmt(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : ""));
  }
  function locale() { return currentLang === "az" ? "az-AZ" : currentLang === "ru" ? "ru-RU" : "en-US"; }
  // Ay adları əl ilə verilir — bəzi brauzerlərdə "az-AZ" lokalı ay adlarını bilmir ("M09" göstərir)
  const MONTHS = {
    az: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  };
  // "İyun"/"İyul" kimi qısa adlar tam saxlanılır, yoxsa ikisi də "İyu" olur
  function shortMonth(name) { return name.length <= 4 ? name : name.slice(0, 3); }
  function monthLabel(key, long) {
    const p = E.parseMonth(key);
    if (!p) return key;
    const name = (MONTHS[currentLang] || MONTHS.az)[p.m];
    return long ? `${name} ${p.y}` : `${shortMonth(name)} '${String(p.y).slice(2)}`;
  }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function pctStr(x) { return (x >= 0 ? "+" : "") + Math.round(x) + "%"; }
  function currentKwh() { return parseInt(slider.value, 10) || 0; }

  // ===== BİLDİRİŞLƏR (PanoPulse NotificationToast) =====
  function toast(text, level, onceKey) {
    if (onceKey) {
      try {
        if (sessionStorage.getItem("toast_" + onceKey)) return;
        sessionStorage.setItem("toast_" + onceKey, "1");
      } catch {}
    }
    let box = $("toastBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "toastBox"; box.className = "toast-box";
      box.setAttribute("role", "status"); box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    while (box.children.length >= 3) box.firstChild.remove(); // ekranda ən çox 3 bildiriş
    const el = document.createElement("div");
    el.className = "toast " + (level || "info");
    el.textContent = text;
    const close = document.createElement("button");
    close.className = "toast-x"; close.textContent = "✕"; close.setAttribute("aria-label", "close");
    close.onclick = () => el.remove();
    el.appendChild(close);
    box.appendChild(el);
    setTimeout(() => el.classList.add("out"), 6000);
    setTimeout(() => el.remove(), 6500);
  }

  // ===== MƏLUMAT MƏNBƏYİ =====
  function monthFromTs(ts) { const d = new Date(ts || Date.now()); return E.monthKey(d.getFullYear(), d.getMonth()); }
  function meterNames() {
    const names = [];
    getMeters().forEach((m) => { if (!names.includes(m.name)) names.push(m.name); });
    return names;
  }
  function selectedSource() {
    const sel = $("insMeter");
    return sel && sel.value ? sel.value : "__current";
  }
  function readingsFor(name) {
    if (!name || name === "__current") return [];
    return getMeters().filter((m) => m.name === name).map((m) => ({ month: m.month || monthFromTs(m.ts), kwh: m.kwh, ts: m.ts }));
  }
  function renderSourceSelect() {
    const sel = $("insMeter");
    const names = meterNames();
    const prev = sel.value || load("energyx_ins_source", "");
    sel.innerHTML = `<option value="__current">${esc(T().src_current)}</option>` +
      names.map((n) => `<option value="${esc(n)}">${esc(n)} (${readingsFor(n).length})</option>`).join("");
    let pick = prev === "__current" || names.includes(prev) ? prev : "";
    if (!pick) pick = names.find((n) => readingsFor(n).length >= 4) || "__current";
    sel.value = pick;
    const hasSample = getMeters().some((m) => m.sample);
    $("sampleClearBtn").hidden = !hasSample;
    $("sampleBtn").hidden = hasSample;
  }

  // ===== HESABLAMALARIN VAHİD NƏTİCƏSİ =====
  let state = {};
  function compute() {
    const kwh = currentKwh();
    const source = selectedSource();
    const readings = readingsFor(source);
    const pace = load("energyx_pace", { month: "", readings: [], budget: 0 });
    const budget = Number(pace.budget) || 0;
    const sensKey = load("energyx_sens", "balanced");
    const sensitivity = E.SENSITIVITY[sensKey] || E.SENSITIVITY.balanced;
    const anomalies = E.detectAnomalies(readings, sensitivity);
    const health = E.healthScore({ kwh, readings, appliances, budget, sensitivity });
    const forecast = E.forecastYear(readings, kwh, new Date());
    const eco = E.ecoImpact(forecast.totalKwh);
    state = { kwh, source, readings, anomalies, health, forecast, eco, budget, sensKey, sensitivity };
    return state;
  }

  // ===== SAĞLAMLIQ BALI =====
  function renderHealth() {
    const t = T(), h = state.health;
    const color = h.score >= 70 ? cssVar("--low") : h.score >= 45 ? cssVar("--mid") : cssVar("--high");
    $("healthRing").style.background = `conic-gradient(${color} ${h.score}%, var(--track) ${h.score}%)`;
    $("healthRing").setAttribute("aria-label", `${t.health_title}: ${h.score}/100`);
    $("healthScore").textContent = h.score;
    $("healthScore").style.color = color;
    $("healthGrade").textContent = `${h.grade} · ${t["grade_" + h.grade]}`;
    $("healthFactors").innerHTML = h.factors.length
      ? h.factors.map((f) => `
        <div class="factor">
          <div class="factor-top"><span>${esc(t["factor_" + f.key])}</span><b>−${f.penalty} · ${f.share}%</b></div>
          <div class="factor-bar"><div style="width:${f.share}%"></div></div>
        </div>`).join("")
      : `<div class="factor-ok">${esc(t.health_perfect)}</div>`;
  }

  // ===== ANOMALİYA QRAFİKİ + XRONOLOGİYA =====
  let anomChart = null, fcChart = null;
  function chartBase() {
    return {
      responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
      plugins: { legend: { labels: { color: cssVar("--text-hi"), font: { family: "SG" }, boxWidth: 12 } } },
      scales: {
        x: { ticks: { color: cssVar("--text-lo") }, grid: { color: cssVar("--track") } },
        y: { ticks: { color: cssVar("--text-lo") }, grid: { color: cssVar("--track") }, beginAtZero: true },
      },
    };
  }
  function renderAnomalies(drawChart) {
    const t = T(), pts = state.anomalies;
    const hint = $("insHint");
    hint.hidden = pts.length >= 4;
    hint.textContent = t.ins_hint_nodata;

    const flagged = pts.filter((p) => p.level !== "none").reverse();
    $("anomTimeline").innerHTML = pts.length < 4 ? "" : flagged.length ? flagged.map((p) => {
      const pct = p.expected ? pctStr(((p.kwh - p.expected) / p.expected) * 100) : "";
      return `<div class="tl-item ${p.level}">
        <div class="tl-dot"></div>
        <div class="tl-body">
          <div class="tl-head"><b>${esc(monthLabel(p.month, true))}</b>
            <span class="tl-badge ${p.level}">${esc(t["anom_level_" + p.level])}${p.sustained ? " · " + esc(t.anom_sustained) : ""}</span>
            <span class="tl-z">z = ${p.z}</span></div>
          <div class="tl-detail">${esc(fmt(t.anom_detail, { e: p.expected, a: p.kwh, pct }))}</div>
          <div class="tl-cause">${esc(t["cause_" + p.cause])}</div>
        </div></div>`;
    }).join("") : `<div class="factor-ok">${esc(t.anom_none)}</div>`;

    // Son ay anomaliyadırsa — bir dəfəlik bildiriş
    const last = pts[pts.length - 1];
    if (last && last.level === "anomaly" && last.direction > 0 && last.expected) {
      toast(fmt(t.toast_anomaly, { m: monthLabel(last.month, true), pct: pctStr(((last.kwh - last.expected) / last.expected) * 100) }),
        "warn", "anom_" + state.source + "_" + last.month);
    }

    if (!drawChart || typeof Chart === "undefined") return;
    const colors = pts.map((p) => (p.level === "anomaly" ? cssVar("--high") : p.level === "watch" ? cssVar("--mid") : cssVar("--low")));
    const data = {
      labels: pts.map((p) => monthLabel(p.month)),
      datasets: [
        { type: "bar", label: t.chart_actual, data: pts.map((p) => p.kwh), backgroundColor: colors, borderRadius: 4, order: 2 },
        { type: "line", label: t.chart_expected, data: pts.map((p) => p.expected), borderColor: cssVar("--line2"), borderDash: [5, 4],
          pointRadius: 0, borderWidth: 2, spanGaps: true, order: 1 },
      ],
    };
    if (anomChart) { anomChart.data = data; anomChart.options = chartBase(); anomChart.update(); }
    else anomChart = new Chart($("anomChart"), { type: "bar", data, options: chartBase() });
  }

  // ===== PROQNOZ =====
  function renderForecast(drawChart) {
    const t = T(), f = state.forecast;
    $("fcBasis").textContent = f.basis === "history" ? t.fc_basis_history : t.fc_basis_current;
    $("fcYear").textContent = f.totalCost.toFixed(0);
    $("fcRange").textContent = `${f.totalCostLow.toFixed(0)}–${f.totalCostHigh.toFixed(0)}`;
    $("fcPeak").textContent = `${monthLabel(f.peak.month)} · ${f.peak.cost.toFixed(0)} ₼`;
    const e = state.eco;
    $("ecoCo2").textContent = e.co2Kg.toLocaleString(locale());
    $("ecoTrees").textContent = Math.round(e.trees);
    $("ecoCar").textContent = e.carKm.toLocaleString(locale());
    $("ecoLoss").textContent = e.gridLossKwh;

    if (!drawChart || typeof Chart === "undefined") return;
    const low = cssVar("--low");
    const data = {
      labels: f.months.map((m) => monthLabel(m.month)),
      datasets: [
        { label: t.chart_band_hi, data: f.months.map((m) => m.high), borderWidth: 0, pointRadius: 0, fill: "+1", backgroundColor: "rgba(0,217,163,0.12)" },
        { label: t.chart_band_lo, data: f.months.map((m) => m.low), borderWidth: 0, pointRadius: 0, fill: false },
        { label: t.chart_forecast, data: f.months.map((m) => m.kwh), borderColor: low, backgroundColor: low, borderWidth: 2.5, tension: 0.35, pointRadius: 3 },
      ],
    };
    const opts = chartBase();
    opts.plugins.legend.labels.filter = (item) => item.datasetIndex === 2;
    opts.plugins.tooltip = { callbacks: { afterBody: (items) => {
      const m = f.months[items[0].dataIndex];
      return `${m.cost.toFixed(2)} ₼ (${m.costLow.toFixed(0)}–${m.costHigh.toFixed(0)})`;
    } } };
    if (fcChart) { fcChart.data = data; fcChart.options = opts; fcChart.update(); }
    else fcChart = new Chart($("fcChart"), { type: "line", data, options: opts });
  }

  // ===== BÜDCƏ MÜHAFİZƏÇİSİ =====
  function paceState() {
    const now = new Date();
    const month = E.monthKey(now.getFullYear(), now.getMonth());
    const p = load("energyx_pace", { month, readings: [], budget: 0 });
    if (p.month !== month) { p.month = month; p.readings = []; }
    if (!Array.isArray(p.readings)) p.readings = [];
    return p;
  }
  function daysInThisMonth() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(); }
  function addPaceReading() {
    const p = paceState();
    const day = parseInt($("paceDay").value, 10);
    const cum = parseFloat($("paceCum").value);
    if (!(day >= 1 && day <= daysInThisMonth()) || !(cum >= 0 && cum < 100000)) return;
    p.readings = p.readings.filter((r) => r.day !== day);
    p.readings.push({ day, cum });
    p.readings.sort((a, b) => a.day - b.day);
    store("energyx_pace", p);
    $("paceCum").value = "";
    renderPace();
    refreshSoon();
  }
  function removePaceReading(day) {
    const p = paceState();
    p.readings = p.readings.filter((r) => r.day !== day);
    store("energyx_pace", p);
    renderPace();
  }
  function renderPace() {
    const t = T(), p = paceState();
    const budgetInput = $("paceBudget");
    if (document.activeElement !== budgetInput) budgetInput.value = p.budget || "";
    if (!$("paceDay").value) $("paceDay").value = new Date().getDate();
    $("paceList").innerHTML = p.readings.map((r) =>
      `<span class="chip">${r.day} → ${r.cum} kVt <button aria-label="delete" onclick="EnergyPro.removePaceReading(${r.day})">✕</button></span>`).join("");

    const dim = daysInThisMonth();
    const res = E.monthPace(p.readings, dim, Number(p.budget) || 0);
    if (!res) { $("paceResult").innerHTML = `<div class="pace-empty">${esc(t.pace_empty)}</div>`; $("paceBar").innerHTML = ""; return; }

    const crossText = (c) => c.day == null ? t.pace_not_this_month : c.day <= res.lastDay && res.lastCum >= c.threshold ? t.pace_already : fmt(t.pace_on_day, { d: c.day });
    let budgetHtml = "";
    if (res.budget) {
      budgetHtml = res.budget.over
        ? `<div class="pace-alert bad">${esc(res.budget.day ? fmt(t.pace_budget_over, { b: res.budget.amount, d: res.budget.day }) : t.pace_budget_over_nod)}<br>${esc(fmt(t.pace_safe, { n: res.budget.safeDailyKwh }))}</div>`
        : `<div class="pace-alert ok">${esc(t.pace_budget_ok)} ${esc(fmt(t.pace_safe, { n: res.budget.safeDailyKwh }))}</div>`;
    }
    $("paceResult").innerHTML = `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${res.dailyKwh}</div><div class="kpi-label">${esc(t.pace_daily)}, kVt</div></div>
        <div class="kpi"><div class="kpi-val ${res.projected.tier}">${res.projectedKwh} kVt</div><div class="kpi-label">${esc(t.pace_projected)} · ${res.projected.cost.toFixed(2)} ₼</div></div>
        <div class="kpi"><div class="kpi-val small">${res.crossings.map((c) => `${c.threshold}: ${esc(crossText(c))}`).join("<br>")}</div><div class="kpi-label">${esc(fmt(t.pace_cross, { t: "200/300" }))}</div></div>
      </div>${budgetHtml}`;

    // Proqres zolağı: yığılan (dolu) + proqnoz (zolaqlı) + hədd markerləri
    const limit = res.budget ? res.budget.limitKwh : 0;
    const max = Math.max(res.projectedKwh, 330, limit) * 1.08;
    const pct = (v) => Math.min(100, (v / max) * 100).toFixed(1);
    const markers = [[200, cssVar("--mid"), "200", ""], [300, cssVar("--high"), "300", ""]];
    if (limit) markers.push([limit, cssVar("--line2"), res.budget.amount + "₼", " budget"]);
    $("paceBar").innerHTML = `<div class="pace-proj ${res.projected.tier}" style="width:${pct(res.projectedKwh)}%"></div>
      <div class="pace-fill" style="width:${pct(res.lastCum)}%"></div>` +
      markers.map(([v, c, l, cls]) => `<div class="pace-mark${cls}" style="left:${pct(v)}%; border-color:${c}"><span style="color:${c}">${esc(l)}</span></div>`).join("");

    // Bildirişlər (hər vəziyyət üçün bir dəfə)
    if (res.budget && res.budget.over) toast(fmt(t.toast_pace_over, { c: res.projected.cost.toFixed(2), b: res.budget.amount }), "bad", `pace_${p.month}_${res.budget.amount}`);
    const hi = res.crossings[1];
    if (hi.day && res.lastCum < 300) toast(fmt(t.toast_tier_soon, { d: hi.day }), "warn", `tier_${p.month}`);
  }

  // ===== WHAT-IF =====
  function wiLevers() {
    return {
      acDegrees: +$("wiAc").value, topDeviceCut: +$("wiTop").value,
      led: $("wiLed").checked, standby: $("wiStandby").checked, washer30: $("wiWasher").checked, waterHeater: $("wiWh").checked,
    };
  }
  function renderWhatIf() {
    const t = T(), lv = wiLevers();
    $("wiAcVal").textContent = "+" + lv.acDegrees + "°C";
    $("wiTopVal").textContent = lv.topDeviceCut + "%";
    const r = E.whatIf({ kwh: state.kwh, appliances, levers: lv });
    state.whatIf = r;
    const anyLever = lv.acDegrees || lv.topDeviceCut || lv.led || lv.standby || lv.washer30 || lv.waterHeater;
    const missing = (lv.acDegrees && !E.categoryKwh(appliances, "ac")) || (lv.led && !E.categoryKwh(appliances, "lighting")) ||
      (lv.washer30 && !E.categoryKwh(appliances, "washer")) || (lv.waterHeater && !E.categoryKwh(appliances, "water_heater")) ||
      (lv.topDeviceCut && !appliances.length);
    $("wiHint").hidden = !missing;
    $("wiHint").textContent = t.wi_hint_devices;
    if (!anyLever) { $("wiResult").innerHTML = `<div class="pace-empty">${esc(t.wi_none)}</div>`; return; }
    const parts = r.parts.map((p) => `<span class="chip">${esc(t["part_" + p.key])}${p.name ? " (" + esc(p.name) + ")" : ""}: −${p.kwh} kVt</span>`).join("");
    $("wiResult").innerHTML = `
      <div class="wi-compare">
        <div><div class="kpi-label">${esc(t.wi_before)}</div><div class="kpi-val ${r.before.tier}">${state.kwh} kVt · ${r.before.cost.toFixed(2)} ₼</div></div>
        <div class="wi-arrow">→</div>
        <div><div class="kpi-label">${esc(t.wi_after)}</div><div class="kpi-val ${r.after.tier}">${r.newKwh} kVt · ${r.after.cost.toFixed(2)} ₼</div></div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val low">${r.savedAzn.toFixed(2)} ₼</div><div class="kpi-label">${esc(t.wi_saved_month)}</div></div>
        <div class="kpi"><div class="kpi-val low">${r.yearlyAzn.toFixed(0)} ₼</div><div class="kpi-label">${esc(t.wi_saved_year)}</div></div>
        <div class="kpi"><div class="kpi-val">${r.co2SavedKg} kq</div><div class="kpi-label">${esc(t.wi_co2)}</div></div>
      </div>
      ${r.tierChanged ? `<div class="pace-alert ok">${esc(fmt(t.wi_tier_change, { from: t["tier_" + r.before.tier], to: t["tier_" + r.after.tier] }))}</div>` : ""}
      <div class="chip-list">${parts}</div>`;
  }

  // ===== SƏRMAYƏ PLANI =====
  function renderInvest() {
    const t = T();
    const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
    const rows = E.investmentPlan({
      kwh: state.kwh, appliances, ledCount: num("invLed"), plugCount: num("invPlug"),
      prices: { led: num("invPLed"), inverter: num("invPInv"), fridge: num("invPFridge"), plug: num("invPPlug") },
    });
    state.invest = rows;
    store("energyx_invest", ["invLed", "invPlug", "invPLed", "invPInv", "invPFridge", "invPPlug"].map((id) => $(id).value));
    if (!rows.length) { $("invTable").innerHTML = `<div class="pace-empty">${esc(t.inv_empty)}</div>`; return; }
    $("invTable").innerHTML = `<div class="table-scroll"><table class="inv-table">
      <thead><tr><th>${esc(t.inv_col_measure)}</th><th>${esc(t.inv_col_cost)}</th><th>${esc(t.inv_col_save)}</th><th>${esc(t.inv_col_payback)}</th><th>${esc(t.inv_col_net)}</th></tr></thead>
      <tbody>${rows.map((r, i) => `<tr class="${i === 0 ? "top" : ""}">
        <td>${esc(t["inv_key_" + r.key])}${i === 0 ? ` <span class="tl-badge ok">${esc(t.inv_top)}</span>` : ""}<div class="inv-sub">${r.kwh} kVt/ay · ${r.co2Year} kq CO₂/il</div></td>
        <td>${r.cost.toFixed(0)} ₼</td>
        <td>${r.monthlyAzn.toFixed(2)} ₼</td>
        <td>${r.paybackMonths == null ? t.inv_never : r.paybackMonths + " " + esc(t.inv_months)}</td>
        <td class="${r.fiveYearNet >= 0 ? "pos" : "neg"}">${r.fiveYearNet >= 0 ? "+" : ""}${r.fiveYearNet.toFixed(0)} ₼</td>
      </tr>`).join("")}</tbody></table></div>`;
  }

  // ===== CİHAZ ŞABLONLARI =====
  function renderPresets() {
    $("presetRow").innerHTML = PRESETS.map((p, i) =>
      `<button class="chip-btn" onclick="EnergyPro.addPreset(${i})">${p.icon} ${esc(p[currentLang] || p.az)} <small>${p.w}W·${p.h}h</small></button>`).join("");
  }
  function addPreset(i) {
    const p = PRESETS[i];
    $("appName").value = p[currentLang] || p.az;
    $("appWatts").value = p.w;
    $("appHours").value = p.h;
    addAppliance();
  }

  // ===== YENİLƏMƏ =====
  let activeTab = "calc", timer = null;
  function refresh() {
    renderSourceSelect();
    compute();
    renderPresets();
    const ins = activeTab === "insights"; // qrafiklər yalnız görünən paneldə çəkilir
    renderHealth(); renderAnomalies(ins); renderForecast(ins);
    renderPace(); renderWhatIf(); renderInvest();
    if (window.EnergyExtras) EnergyExtras.refresh(state, activeTab);
  }
  function refreshSoon() { clearTimeout(timer); timer = setTimeout(refresh, 120); }
  function onTab(tab) { activeTab = tab; refresh(); }

  // ===== NÜMUNƏ MƏLUMAT =====
  function loadSample() {
    const s = E.sampleData(new Date());
    const meters = getMeters().filter((m) => !m.sample);
    s.readings.forEach((r) => {
      const c = E.calcTariff(r.kwh);
      meters.push({ name: s.meterName, kwh: r.kwh, cost: c.cost, tier: c.tier, month: r.month, ts: r.ts, sample: true,
        date: r.month.slice(5) + "." + r.month.slice(0, 4) });
    });
    setMeters(meters);
    if (!appliances.length) { s.appliances.forEach((a) => appliances.push({ ...a, sample: true })); renderAppliances(); }
    store("energyx_ins_source", s.meterName);
    $("insMeter").value = s.meterName;
    slider.value = s.readings[s.readings.length - 1].kwh;
    updateCalc(); updateSim(); renderMeters();
    renderSourceSelect(); $("insMeter").value = s.meterName;
    refresh();
    toast(T().sample_loaded, "info");
  }
  function clearSample() {
    setMeters(getMeters().filter((m) => !m.sample));
    for (let i = appliances.length - 1; i >= 0; i--) if (appliances[i].sample) appliances.splice(i, 1);
    store("energyx_ins_source", "");
    renderAppliances(); renderMeters(); refresh();
    toast(T().sample_cleared, "info");
  }

  // ===== YEDƏKLƏMƏ (GridPulse backup ideyası — burada istifadəçi tərəfində) =====
  function exportBackup() {
    const payload = { app: "energyx-az", version: 1, exportedAt: new Date().toISOString(),
      data: { meters: getMeters(), appliances, pace: load("energyx_pace", null), lang: currentLang } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `energyx-az-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(T().backup_done, "info");
  }
  function cleanMeter(m) {
    if (!m || typeof m.name !== "string" || !(Number(m.kwh) >= 0)) return null;
    const kwh = Math.min(100000, Number(m.kwh));
    const c = E.calcTariff(kwh);
    const month = E.parseMonth(m.month) ? m.month : monthFromTs(m.ts);
    return { name: m.name.slice(0, 40), kwh, cost: c.cost, tier: c.tier, month, ts: Number(m.ts) || Date.now(),
      date: typeof m.date === "string" ? m.date.slice(0, 30) : month, sample: !!m.sample };
  }
  function cleanAppliance(a) {
    if (!a || typeof a.name !== "string") return null;
    const watts = Number(a.watts), hours = Number(a.hours);
    if (!(watts > 0 && watts <= 50000 && hours > 0 && hours <= 24)) return null;
    const name = a.name.slice(0, 60);
    const cat = E.classify(name);
    return { name, watts, hours, monthlyKwh: (watts / 1000) * hours * 30, typicalWatts: findTypicalWatts(name) || null, sample: !!a.sample, _cat: cat };
  }
  function importBackup(input) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file || file.size > 2 * 1024 * 1024) { toast(T().backup_invalid, "bad"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj || obj.app !== "energyx-az" || !obj.data) throw new Error("format");
        if (!confirm(T().backup_confirm)) return;
        const meters = (Array.isArray(obj.data.meters) ? obj.data.meters : []).map(cleanMeter).filter(Boolean);
        const apps = (Array.isArray(obj.data.appliances) ? obj.data.appliances : []).map(cleanAppliance).filter(Boolean)
          .map(({ _cat, ...a }) => a);
        setMeters(meters);
        appliances.splice(0, appliances.length, ...apps);
        if (obj.data.pace && Array.isArray(obj.data.pace.readings)) {
          store("energyx_pace", { month: String(obj.data.pace.month || ""), budget: Math.max(0, Number(obj.data.pace.budget) || 0),
            readings: obj.data.pace.readings.filter((r) => r && r.day >= 1 && r.day <= 31 && r.cum >= 0).map((r) => ({ day: +r.day, cum: +r.cum })) });
        }
        renderMeters(); renderAppliances(); refresh();
        toast(T().backup_imported, "info");
      } catch { toast(T().backup_invalid, "bad"); }
    };
    reader.readAsText(file);
  }

  // ===== AI KONTEKSTİ + OFLAYN KÖMƏKÇİ =====
  function aiContext() {
    compute();
    const flagged = state.anomalies.filter((p) => p.level !== "none").slice(-3)
      .map((p) => ({ month: p.month, kwh: p.kwh, expected: p.expected, level: p.level }));
    const top = [...appliances].sort((a, b) => b.monthlyKwh - a.monthlyKwh).slice(0, 3)
      .map((a) => ({ name: String(a.name).slice(0, 40), kwh: Math.round(a.monthlyKwh) }));
    return {
      healthScore: state.health.score, healthFactors: state.health.factors.map((f) => f.key),
      forecastYearCost: state.forecast.totalCost, peakMonth: state.forecast.peak.month,
      anomalies: flagged, topDevices: top, budget: state.budget || 0,
    };
  }
  function localAnswer(question) {
    compute();
    const t = T(), q = String(question || "").toLowerCase();
    const has = (...words) => words.some((w) => q.includes(w));
    let ans;
    if (has("qənaət", "qenaet", "save", "saving", "эконом", "сэконом", "azalt", "reduce")) {
      const r = E.whatIf({ kwh: state.kwh, appliances, levers: { acDegrees: 2, led: true, standby: true, washer30: true, waterHeater: true, topDeviceCut: 20 } });
      ans = r.parts.length > 1
        ? fmt(t.local_save, { list: r.parts.sort((a, b) => b.kwh - a.kwh).slice(0, 3).map((p) => t["part_" + p.key]).join(", "), azn: r.savedAzn.toFixed(2), kwh: Math.round(r.savedKwh) })
        : t.local_save_none;
    } else if (has("pillə", "pille", "tier", "тариф", "ступен", "qəpik", "qepik")) {
      const { tier } = E.calcTariff(state.kwh);
      const cd = state.kwh <= 300 ? fmt(t.countdown_template, { n: (state.kwh <= 200 ? 200 : 300) - state.kwh, tier: t[state.kwh <= 200 ? "tier_mid" : "tier_high"] }) : t.countdown_maxed;
      ans = fmt(t.local_tier, { kwh: state.kwh, tier: t["tier_" + tier], countdown: cd });
    } else if (has("anomal", "niyə", "niye", "why", "почему", "artıb", "artib", "qeyri-adi", "unusual")) {
      const last = state.anomalies.filter((p) => p.level !== "none").pop();
      ans = last ? fmt(t.local_anomaly, { m: monthLabel(last.month, true),
        detail: fmt(t.anom_detail, { e: last.expected, a: last.kwh, pct: pctStr(((last.kwh - last.expected) / last.expected) * 100) }), cause: t["cause_" + last.cause] })
        : t.local_anomaly_none;
    } else if (has("proqnoz", "forecast", "прогноз", "illik", "gələn il", "year", "год")) {
      const f = state.forecast;
      ans = fmt(t.local_forecast, { cost: f.totalCost.toFixed(0), lo: f.totalCostLow.toFixed(0), hi: f.totalCostHigh.toFixed(0), peak: monthLabel(f.peak.month, true) });
    } else {
      const h = state.health;
      ans = fmt(t.local_health, { score: h.score, grade: t["grade_" + h.grade], factor: h.factors.length ? t["factor_" + h.factors[0].key] : "—" });
    }
    return t.local_prefix + ans;
  }

  // ===== PDF HESABAT (şrift lazım olanda yüklənir — səhifə 1 MB yüngülləşdi) =====
  let fontB64 = null;
  async function loadFont() {
    if (fontB64) return fontB64;
    const res = await fetch("fonts/DejaVuSans.ttf");
    if (!res.ok) throw new Error("font");
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    fontB64 = btoa(bin);
    return fontB64;
  }
  async function exportPdf() {
    const t = T();
    let b64;
    try { b64 = await loadFont(); } catch { toast(t.pdf_font_err, "bad"); return; }
    compute(); renderWhatIf(); renderInvest();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.addFileToVFS("DejaVuSans.ttf", b64);
    doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
    doc.setFont("DejaVu");
    const kwh = state.kwh, c = E.calcTariff(kwh);
    let y = 22;
    const line = (a, b) => { if (y > 266) { doc.addPage(); y = 22; } doc.text(String(a), 20, y); if (b !== undefined) doc.text(String(b), 120, y); y += 8; };
    const head = (txt) => {
      if (y > 245) { doc.addPage(); y = 22; }
      y += 4; doc.setFontSize(13); doc.setTextColor(0, 140, 110); doc.text(txt, 20, y); y += 8;
      doc.setFontSize(11); doc.setTextColor(30);
    };
    const para = (txt) => { const ls = doc.splitTextToSize(txt, 170); ls.forEach((l) => { if (y > 266) { doc.addPage(); y = 22; } doc.text(l, 20, y); y += 6; }); };

    doc.setFontSize(20); doc.setTextColor(20); doc.text("EnergyX Az — " + t.pdf_title, 20, y); y += 8;
    doc.setFontSize(10); doc.setTextColor(120); doc.text(new Date().toLocaleDateString(locale()), 20, y); y += 4;
    doc.setDrawColor(220); doc.line(20, y, 190, y); y += 6;
    doc.setFontSize(11); doc.setTextColor(30);
    line(t.pdf_usage + ":", kwh + " kWh");
    line(t.pdf_cost + ":", c.cost.toFixed(2) + " AZN");
    line(t.pdf_tier + ":", t["tier_" + c.tier]);
    line("CO₂:", (kwh * E.CO2_FACTOR).toFixed(1) + " kg");

    head(t.pdf_health);
    line(`${state.health.score}/100 — ${state.health.grade} (${t["grade_" + state.health.grade]})`);
    state.health.factors.forEach((f) => line(`• ${t["factor_" + f.key]}`, `−${f.penalty} (${f.share}%)`));

    head(t.pdf_forecast);
    const f = state.forecast;
    line(`${f.totalCost.toFixed(0)} AZN`, `95%: ${f.totalCostLow.toFixed(0)}–${f.totalCostHigh.toFixed(0)} AZN`);
    line(t.fc_peak + ":", `${monthLabel(f.peak.month, true)} · ${f.peak.cost.toFixed(2)} AZN`);

    const flagged = state.anomalies.filter((p) => p.level !== "none");
    if (flagged.length) {
      head(t.pdf_anomalies);
      flagged.slice(-5).forEach((p) => {
        para(`• ${monthLabel(p.month, true)} — ${t["anom_level_" + p.level]}: ${fmt(t.anom_detail, { e: p.expected, a: p.kwh, pct: pctStr(((p.kwh - p.expected) / p.expected) * 100) })}`);
        para(`  ${t["cause_" + p.cause]}`);
      });
    }
    if (state.whatIf && state.whatIf.parts.length) {
      head(t.pdf_whatif);
      line(`${kwh} → ${state.whatIf.newKwh} kWh`, `−${state.whatIf.savedAzn.toFixed(2)} AZN / ${t.inv_months}`);
      line(t.wi_saved_year + ":", state.whatIf.yearlyAzn.toFixed(0) + " AZN");
    }
    if (state.invest && state.invest.length) {
      head(t.pdf_invest);
      const r = state.invest[0];
      para(`${t["inv_key_" + r.key].replace(/^\S+\s/, "")}: ${r.cost.toFixed(0)} AZN → ${r.monthlyAzn.toFixed(2)} AZN/${t.inv_months}, ${t.inv_col_payback}: ${r.paybackMonths ?? "—"} ${t.inv_months}`);
    }
    head(t.pdf_eco);
    const e = state.eco;
    para(`${e.co2Kg} kg CO₂ · ≈ ${Math.round(e.trees)} ${t.eco_trees} · ${e.carKm} ${t.eco_car} · ${e.gridLossKwh} ${t.eco_loss}`);

    doc.setFontSize(8.5); doc.setTextColor(150);
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.text(doc.splitTextToSize(t.pdf_disclaimer + " " + t.footer_p1, 170), 20, 280);
    }
    doc.save(`energyx-az-hesabat-${kwh}kwh.pdf`);
    trackEvent("pdf_export");
  }

  // ===== TƏQDİMAT REJİMİ (PanoPulse Presentation Mode) =====
  // İstifadəçinin məlumatı əvvəlcə yadda saxlanılır, demo bitəndə tam bərpa olunur.
  const SNAP_KEYS = ["energyx_meters", "energyx_appliances", "energyx_pace", "energyx_ins_source", "energyx_invest", "energyx_sens", "energyx_gas", "energyx_outage"];
  let pres = null;
  function startPresentation() {
    if (pres) return stopPresentation();
    const snap = {};
    SNAP_KEYS.forEach((k) => { try { snap[k] = localStorage.getItem(k); } catch {} });
    pres = { snap, slider: slider.value, sim: simSlider.value, appliances: appliances.map((a) => ({ ...a })), timers: [],
      levers: wiLevers(), tab: activeTab };

    // Demo məlumatı
    appliances.splice(0, appliances.length);
    setMeters([]);
    loadSample();
    const now = new Date();
    store("energyx_pace", { month: E.monthKey(now.getFullYear(), now.getMonth()), budget: 30,
      readings: [{ day: 5, cum: 62 }, { day: 10, cum: 128 }] });

    const bar = document.createElement("div");
    bar.className = "pres-bar"; bar.id = "presBar";
    bar.innerHTML = `<div class="pres-progress"><div id="presProg"></div></div>
      <div class="pres-row"><span id="presCaption" aria-live="polite"></span><button id="presStop">${esc(T().pres_stop)}</button></div>`;
    document.body.appendChild(bar);
    $("presStop").onclick = stopPresentation;
    document.addEventListener("keydown", presKey);
    $("presentBtn").classList.add("on");

    const steps = T().pres_steps;
    const STEP_MS = 5500;
    const actions = [
      () => { switchTab("calc"); window.scrollTo({ top: 0, behavior: "smooth" }); animateSlider(120, 330, 2600); },
      () => { document.querySelector(".forecast-card").scrollIntoView({ behavior: "smooth", block: "center" }); },
      () => { switchTab("insights"); window.scrollTo({ top: 0, behavior: "smooth" }); },
      () => { $("anomTimeline").scrollIntoView({ behavior: "smooth", block: "center" }); },
      () => { $("fcChart").scrollIntoView({ behavior: "smooth", block: "center" }); },
      () => { switchTab("plan"); $("wiResult").scrollIntoView({ behavior: "smooth", block: "center" });
              [["wiLed", 600], ["wiStandby", 1300], ["wiWh", 2000]].forEach(([id, d]) => later(() => { $(id).checked = true; renderWhatIf(); }, d));
              later(() => { $("wiAc").value = 2; renderWhatIf(); }, 2700); },
      () => { $("invTable").scrollIntoView({ behavior: "smooth", block: "center" }); },
    ];
    actions.forEach((fn, i) => later(() => {
      $("presCaption").textContent = steps[i];
      $("presProg").style.width = ((i + 1) / actions.length) * 100 + "%";
      fn();
    }, i * STEP_MS));
    later(() => stopPresentation(true), actions.length * STEP_MS + 1500);
  }
  function later(fn, ms) { if (pres) pres.timers.push(setTimeout(() => { if (pres) fn(); }, ms)); }
  function presKey(e) { if (e.key === "Escape") stopPresentation(); }
  function animateSlider(from, to, ms) {
    const t0 = performance.now();
    const step = (now) => {
      if (!pres) return;
      const k = Math.min(1, (now - t0) / ms);
      slider.value = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      updateCalc(); updateSim();
      if (k < 1) requestAnimationFrame(step); else refreshSoon();
    };
    requestAnimationFrame(step);
  }
  function stopPresentation(finished) {
    if (!pres) return;
    const p = pres; pres = null;
    p.timers.forEach(clearTimeout);
    SNAP_KEYS.forEach((k) => { try { if (p.snap[k] == null) localStorage.removeItem(k); else localStorage.setItem(k, p.snap[k]); } catch {} });
    appliances.splice(0, appliances.length, ...p.appliances);
    slider.value = p.slider; simSlider.value = p.sim;
    $("wiAc").value = p.levers.acDegrees; $("wiTop").value = p.levers.topDeviceCut;
    $("wiLed").checked = p.levers.led; $("wiStandby").checked = p.levers.standby; $("wiWasher").checked = p.levers.washer30; $("wiWh").checked = p.levers.waterHeater;
    const bar = $("presBar"); if (bar) bar.remove();
    document.removeEventListener("keydown", presKey);
    $("presentBtn").classList.remove("on");
    updateCalc(); updateSim(); renderMeters(); renderAppliances();
    switchTab(p.tab || "calc");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (finished) toast(T().pres_done, "info");
  }

  // ===== HADİSƏ BAĞLANTILARI =====
  $("insMeter").addEventListener("change", () => { store("energyx_ins_source", $("insMeter").value); refresh(); });
  $("paceBudget").addEventListener("input", () => {
    const p = paceState(); p.budget = Math.max(0, parseFloat($("paceBudget").value) || 0); store("energyx_pace", p); renderPace();
  });
  ["wiAc", "wiTop", "wiLed", "wiStandby", "wiWasher", "wiWh"].forEach((id) => $(id).addEventListener("input", renderWhatIf));
  const savedInv = load("energyx_invest", null);
  ["invLed", "invPlug", "invPLed", "invPInv", "invPFridge", "invPPlug"].forEach((id, i) => {
    if (Array.isArray(savedInv) && savedInv[i] !== undefined && savedInv[i] !== "") $(id).value = savedInv[i];
    $(id).addEventListener("input", renderInvest);
  });
  $("paceCum").addEventListener("keypress", (e) => { if (e.key === "Enter") addPaceReading(); });
  document.querySelectorAll("label.ghost-btn").forEach((l) => l.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); l.querySelector("input").click(); }
  }));

  // ===== PWA: oflayn dəstək =====
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  window.EnergyPro = {
    refresh, refreshSoon, onTab, addPaceReading, removePaceReading, addPreset, loadSample, clearSample,
    exportBackup, importBackup, aiContext, localAnswer, exportPdf, startPresentation, stopPresentation, toast,
    getState: () => state, monthLabel, shortMonth, fmt, load, store, cssVar, chartBase, compute,
  };
  applyTranslations(currentLang);
  refresh();
})();
