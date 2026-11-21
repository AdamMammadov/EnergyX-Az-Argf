// ==========================================
// EnergyX Az v2.4 - Ağıllı Sayğac AI Laboratoriyası, canlı sayğac,
// tarif pillələrinin animasiyalı izahı, enerji axını diaqramı,
// Gənclər Fondu ilə bağlı mətnlər. ux.js-dən SONRA yüklənir.
// ==========================================
(function () {
  "use strict";
  const E = window.EnergyEngine, P = window.EnergyPro;
  const $ = (id) => document.getElementById(id);
  const T = () => translations[currentLang];
  const fmt = P.fmt;

  const LT = {
    az: {
      supported_by: "Dəstəkləyən", supported_by_long: "Azərbaycan Respublikasının Gənclər Fondunun dəstəyi ilə",
      fund_disclaimer: "Bu nəşr Azərbaycan Respublikasının Gənclər Fondunun maliyyə yardımı ilə hazırlanmışdır. Fond nəşrin məzmununa görə məsuliyyət daşımır.",
      sugg3: "Gecə nə qədər enerji itirirəm?",
      tab_meter: "Ağıllı sayğac",
      tv_replay: "Animasiyanı təkrarla",
      tv_seg: "{used} kVt × {rate} qəp = {cost} ₼", tv_empty: "bu pilləyə çatmamısınız", tv_total: "Cəmi: {kwh} kVt·saat = {cost} ₼",
      tv_explain_low: "Bütün {kwh} kVt·saat ən ucuz, 8.4 qəpiklik pillədədir.",
      tv_explain_up: "Pilləli tarif belə işləyir: {kwh} kVt·saatın hamısı bahalı qiymətlə hesablanmır. İlk 200 kVt həmişə 8.4 qəpik, növbəti 100 kVt 10 qəpik, yalnız {over} kVt {rate} qəpikdir. Orta qiymətiniz: {avg} qəpik/kVt.",
      flow_title: "Enerjiniz haradan gəlir, hara gedir?", flow_tag: "canlı axın",
      flow_lead: "Stansiyada istehsal olunan enerjinin bir hissəsi şəbəkədə itir, qalanı sayğacınızdan keçib cihazlarınıza paylanır. Xəttlərin qalınlığı enerji miqdarına mütənasibdir.",
      flow_plant: "Elektrik stansiyası", flow_grid: "Ötürücü şəbəkə", flow_home: "Sizin sayğac", flow_loss: "Şəbəkə itkisi",
      flow_note: "Cihaz bölgüsü Cihazlar siyahınıza əsaslanır. Siyahı boşdursa, bütün istifadə \"naməlum\" kimi göstərilir. İtki: 7.6% (Dünya Bankı, 2023).",
      cat_ac: "Kondisioner", cat_lighting: "İşıqlandırma", cat_washer: "Paltaryuyan", cat_fridge: "Soyuducu", cat_water_heater: "Su qızdırıcı",
      cat_heater: "Qızdırıcı", cat_tv: "Televizor", cat_computer: "Kompüter", cat_microwave: "Mikrodalğa", cat_kettle: "Çaydan",
      cat_other: "Digər cihazlar", cat_unknown: "Naməlum / siyahıda yoxdur",
      lab_title: "Ağıllı sayğac analizi",
      lab_lead: "Ağıllı sayğac enerjini saat-saat ölçür. Burada saatlıq məlumatdan gün ərzində yük əyrisi, heç vaxt sönməyən baza yükü, pik saatlar və gecə artımları çıxarılır. Məlumatı cihazlarınızdan simulyasiya etmək, nümunədən götürmək və ya sayğacdan CSV kimi yükləmək olar.",
      lab_src_sim: "Cihazlarımdan simulyasiya", lab_src_sample: "Nümunə sayğac datası", lab_src_csv: "CSV yüklə", lab_csv_download: "CSV-ni endir",
      lab_src_label_sim: "Mənbə: Cihazlar siyahınızdan 4 həftəlik saatlıq simulyasiya",
      lab_src_label_sample: "Mənbə: nümunə ağıllı sayğac məlumatı (real deyil), iki gecə unudulmuş qızdırıcı ilə",
      lab_src_label_csv: "Mənbə: yüklədiyiniz CSV faylı ({n} saatlıq nöqtə{unit})",
      lab_no_apps: "Cihaz siyahınız boşdur, ona görə nümunə məlumat göstərilir. Simulyasiya üçün Cihazlar bölməsinə cihaz əlavə edin.",
      lab_csv_bad: "CSV oxunmadı: ən azı 48 düzgün saatlıq sətir lazımdır. Aşağıdakı formata baxın.",
      lab_csv_ok: "CSV yükləndi: {n} saatlıq nöqtə{skip}.", lab_csv_skipped: ", {n} sətir buraxıldı",
      lab_unit_wh: ", Vt·saatdan çevrildi",
      lab_live: "Canlı güc (simulyasiya)", lab_live_sub: "Bu saat üçün orta: {avg} W · baza yükü: {base} W",
      lab_kpi_daily: "Orta gündəlik", lab_kpi_base: "Baza yükü (həmişə açıq)", lab_kpi_peak: "Pik saat", lab_kpi_lf: "Yük əmsalı",
      lab_kpi_month: "Ay proqnozu", lab_kpi_standby: "Baza yükünün illik xərci",
      lab_period: "{from} - {to}",
      lab_curve_title: "Gün ərzində yük əyrisi",
      lab_curve_lead: "Hər saat üçün orta güc. Qırıq xətt baza yükünü göstərir: heç vaxt sönməyən cihazların (soyuducu, router, gözləmə rejimi) gücü.",
      lab_chart_avg: "Orta güc, kVt", lab_chart_base: "Baza yükü", lab_chart_daily: "Gündəlik kVt·saat", lab_chart_event: "Qeyri-adi gün",
      lab_ai_title: "Tövsiyələr", lab_ai_tag: "ölçülə bilən",
      lab_heat_title: "Həftə × saat xəritəsi", lab_heat_lead: "Rəng nə qədər tünddürsə, həmin gün və saatda istifadə bir o qədər çoxdur.",
      lab_daily_title: "Gündəlik istifadə", lab_events_title: "Qeyri-adi saatlar",
      lab_events_none: "Qeyri-adi saat aşkarlanmayıb",
      lab_event: "{date} {from}-{to} · {h} saat · +{kwh} kVt·saat · pik {peak} kVt",
      lab_event_night: "Gecə ərzində gözlənilməz yük: elektrik qızdırıcısı, kondisioner və ya su qızdırıcısı açıq qalmış ola bilər.",
      lab_event_day: "Gündüz qeyri-adi yüksək yük: eyni anda bir neçə güclü cihaz və ya nasaz cihaz ola bilər.",
      lab_csv_title: "CSV formatı",
      lab_csv_lead: "Ağıllı sayğacınızın və ya Azərişıq kabinetinin saatlıq məlumatını CSV kimi yükləyin. Dəstəklənən formatlar (vergül, nöqtəli vergül və ya tab ilə ayrılmış):",
      lab_csv_note: "Dəyərlər Vt·saat ilədirsə, avtomatik kVt·saata çevrilir. 15 dəqiqəlik məlumat saatlıq cəmlənir. Fayl yalnız brauzerinizdə oxunur, heç yerə göndərilmir.",
      dow: ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"],
      ins_baseload_high: "Evinizdə gecə-gündüz {w} Vt heç vaxt sönmür, bu ildə {yearKwh} kVt·saat (≈ {yearAzn} ₼) edir. Soyuducu və router normaldır, amma gözləmə rejimindəki TV, konsol, köhnə adapterlər bu rəqəmi şişirdir. Hər 10 Vt azalma ildə ~{per10Kwh} kVt·saat (≈ {per10Azn} ₼) qənaətdir.",
      ins_baseload_mid: "Baza yükünüz {w} Vt-dır (ildə {yearKwh} kVt·saat ≈ {yearAzn} ₼), bu orta səviyyədir. Gecə işlənməyən cihazları rozetkadan ayırsanız, hər 10 Vt üçün ildə təxminən {per10Azn} ₼ qənaət edərsiniz.",
      ins_baseload_ok: "Baza yükünüz cəmi {w} Vt-dır, gözləmə rejimi itkisi azdır.",
      ins_anomaly_night: "{n} dəfə gecə saatlarında gözlənilməz yük aşkarlandı (+{kwh} kVt·saat ≈ {azn} ₼). Qızdırıcı və ya kondisioner gecə açıq qalıbmı? Taymerli rozetka bu riski aradan qaldırır.",
      ins_anomaly_day: "{n} qeyri-adi yüksək yük epizodu aşkarlandı (+{kwh} kVt·saat ≈ {azn} ₼). Hadisələr siyahısında saatlarına baxın.",
      ins_tier_projection: "Bu templə ay sonu ~{kwh} kVt·saat ({cost} ₼) olacaq və {limit} kVt həddini keçəcəksiniz. Gündə ~{perDay} kVt·saat azaltmaq sizi ucuz pillədə saxlayar.",
      ins_evening_peak: "İstifadənin {pct}%-i axşam 18:00-23:00 arasındadır (pik saat {hour}:00). Paltaryuyan və su qızdırıcısını gündüzə keçirmək şəbəkə yükünü azaldır.",
      ins_night_heavy: "Enerjinin {pct}%-i gecə (23:00-07:00) işlənir. Bu adətən gecə açıq qalan qızdırıcı və ya kondisionerdən olur.",
      ins_peaky: "Yük əmsalınız {lf}-dir: istifadə qısa, kəskin piklərlə gəlir ({peak} kVt-a qədər). Güclü cihazları eyni anda işlətməmək elektrik xəttini də qoruyur.",
      ins_weekend_diff: "Həftəsonu istifadəniz iş günlərindən {pct}% fərqlidir.",
      sev_good: "Yaxşı",
      local_profile: "Ağıllı sayğac analizinə görə: baza yükü {base} Vt, pik saat {hour}:00, gündəlik orta {daily} kVt·saat. {tip}",
    },
    en: {
      supported_by: "Supported by", supported_by_long: "Supported by the Youth Foundation of the Republic of Azerbaijan",
      fund_disclaimer: "This publication was prepared with the financial support of the Youth Foundation of the Republic of Azerbaijan. The Foundation is not responsible for its content.",
      sugg3: "How much energy do I waste at night?",
      tab_meter: "Smart meter",
      tv_replay: "Replay animation",
      tv_seg: "{used} kWh × {rate} q = {cost} ₼", tv_empty: "not reached", tv_total: "Total: {kwh} kWh = {cost} ₼",
      tv_explain_low: "All {kwh} kWh are in the cheapest 8.4-qapik tier.",
      tv_explain_up: "This is how tiered pricing works: not all {kwh} kWh are charged at the higher price. The first 200 kWh always cost 8.4 qapik, the next 100 kWh 10 qapik, and only {over} kWh cost {rate} qapik. Your average price: {avg} qapik/kWh.",
      flow_title: "Where does your energy come from and go?", flow_tag: "live flow",
      flow_lead: "Part of the energy generated at the power plant is lost in the grid; the rest passes through your meter to your appliances. Line thickness is proportional to energy.",
      flow_plant: "Power plant", flow_grid: "Transmission grid", flow_home: "Your meter", flow_loss: "Grid losses",
      flow_note: "The appliance split is based on your Appliances list. If it is empty, all usage is shown as \"unknown\". Losses: 7.6% (World Bank, 2023).",
      cat_ac: "Air conditioner", cat_lighting: "Lighting", cat_washer: "Washing machine", cat_fridge: "Fridge", cat_water_heater: "Water heater",
      cat_heater: "Heater", cat_tv: "TV", cat_computer: "Computer", cat_microwave: "Microwave", cat_kettle: "Kettle",
      cat_other: "Other appliances", cat_unknown: "Unknown / not listed",
      lab_title: "Smart meter analysis",
      lab_lead: "Smart meters measure energy hour by hour. This lab analyses hourly data: the daily load curve, the always-on baseload, peak hours, night anomalies and concrete recommendations. Data can be simulated from your appliances, taken from a sample, or uploaded from a smart meter as CSV.",
      lab_src_sim: "Simulate from my appliances", lab_src_sample: "Sample meter data", lab_src_csv: "Upload CSV", lab_csv_download: "Download CSV",
      lab_src_label_sim: "Source: 4-week hourly simulation from your Appliances list",
      lab_src_label_sample: "Source: sample smart meter data (not real), with a heater left on for two nights",
      lab_src_label_csv: "Source: your uploaded CSV ({n} hourly points{unit})",
      lab_no_apps: "Your Appliances list is empty. Showing sample data. Add appliances to simulate your own home.",
      lab_csv_bad: "Could not read the CSV: at least 48 valid hourly rows are needed. Check the format.",
      lab_csv_ok: "CSV loaded: {n} hourly points{skip}.", lab_csv_skipped: ", {n} rows skipped",
      lab_unit_wh: ", converted from Wh",
      lab_live: "Live power (simulated)", lab_live_sub: "Average for this hour: {avg} W · baseload: {base} W",
      lab_kpi_daily: "Average per day", lab_kpi_base: "Baseload (always on)", lab_kpi_peak: "Peak hour", lab_kpi_lf: "Load factor",
      lab_kpi_month: "Month forecast", lab_kpi_standby: "Yearly cost of baseload",
      lab_period: "{from} - {to}",
      lab_curve_title: "Daily load curve",
      lab_curve_lead: "Average power for each hour. Dashed line: baseload: the power of devices that never switch off (fridge, router, standby).",
      lab_chart_avg: "Average power, kW", lab_chart_base: "Baseload", lab_chart_daily: "Daily kWh", lab_chart_event: "Unusual day",
      lab_ai_title: "Recommendations", lab_ai_tag: "measurable",
      lab_heat_title: "Week × hour map", lab_heat_lead: "The darker the cell, the more energy used on that day and hour.",
      lab_daily_title: "Daily usage", lab_events_title: "Unusual hours",
      lab_events_none: "No unusual hours detected",
      lab_event: "{date} {from}-{to} · {h} h · +{kwh} kWh · peak {peak} kW",
      lab_event_night: "Unexpected night-time load: a heater, AC or water heater may have been left on.",
      lab_event_day: "Unusually high daytime load: several powerful appliances at once, or a faulty one.",
      lab_csv_title: "CSV format",
      lab_csv_lead: "Upload hourly data from your smart meter or Azerishig account as CSV. Supported formats (comma, semicolon or tab separated):",
      lab_csv_note: "Values in Wh are converted to kWh automatically. 15-minute data is summed per hour. The file is processed only in your browser. It is never uploaded.",
      dow: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      ins_baseload_high: "{w} W in your home never switches off. {yearKwh} kWh a year (≈ {yearAzn} ₼). The fridge and router are normal, but TVs, consoles and old adapters on standby inflate it. Every 10 W less saves ~{per10Kwh} kWh (≈ {per10Azn} ₼) a year.",
      ins_baseload_mid: "Your baseload is {w} W ({yearKwh} kWh/year ≈ {yearAzn} ₼), which is average. Unplugging unused devices at night saves ~{per10Azn} ₼ a year per 10 W.",
      ins_baseload_ok: "Your baseload is only {w} W, so standby losses are small.",
      ins_anomaly_night: "Unexpected load was detected {n} times at night (+{kwh} kWh ≈ {azn} ₼). Was a heater or AC left on? A timer plug removes this risk.",
      ins_anomaly_day: "{n} unusually high load episodes detected (+{kwh} kWh ≈ {azn} ₼). See the event list for the hours.",
      ins_tier_projection: "At this pace the month will end at ~{kwh} kWh ({cost} ₼), above the {limit} kWh threshold. Cutting ~{perDay} kWh a day keeps you in the cheaper tier.",
      ins_evening_peak: "{pct}% of your usage is between 18:00 and 23:00 (peak at {hour}:00). Moving the washer and water heater to daytime eases grid load.",
      ins_night_heavy: "{pct}% of your energy is used at night (23:00-07:00): usually a heater or AC running overnight.",
      ins_peaky: "Your load factor is {lf}: usage comes in short, sharp peaks (up to {peak} kW). Not running powerful appliances at the same time also protects your wiring.",
      ins_weekend_diff: "Your weekend usage differs from weekdays by {pct}%.",
      sev_good: "Good",
      local_profile: "From the smart meter analysis: baseload {base} W, peak hour {hour}:00, average {daily} kWh/day. {tip}",
    },
    ru: {
      supported_by: "При поддержке", supported_by_long: "При поддержке Фонда молодёжи Азербайджанской Республики",
      fund_disclaimer: "Это издание подготовлено при финансовой поддержке Фонда молодёжи Азербайджанской Республики. Фонд не несёт ответственности за его содержание.",
      sugg3: "Сколько энергии я теряю ночью?",
      tab_meter: "Умный счётчик",
      tv_replay: "Повторить анимацию",
      tv_seg: "{used} кВт·ч × {rate} гяп = {cost} ₼", tv_empty: "не достигнут", tv_total: "Итого: {kwh} кВт·ч = {cost} ₼",
      tv_explain_low: "Все {kwh} кВт·ч - в самом дешёвом тарифе 8.4 гяпика.",
      tv_explain_up: "Так работает ступенчатый тариф: не все {kwh} кВт·ч считаются по высокой цене. Первые 200 кВт·ч всегда стоят 8.4 гяпика, следующие 100 - 10 гяпиков, и только {over} кВт·ч - {rate} гяпиков. Ваша средняя цена: {avg} гяпика/кВт·ч.",
      flow_title: "Откуда приходит и куда уходит ваша энергия?", flow_tag: "живой поток",
      flow_lead: "Часть энергии, произведённой на станции, теряется в сети, остальное проходит через ваш счётчик к приборам. Толщина линий пропорциональна энергии.",
      flow_plant: "Электростанция", flow_grid: "Сеть передачи", flow_home: "Ваш счётчик", flow_loss: "Потери в сети",
      flow_note: "Распределение по приборам основано на вашем списке приборов. Если он пуст, всё показано как «неизвестно». Потери: 7.6% (Всемирный банк, 2023).",
      cat_ac: "Кондиционер", cat_lighting: "Освещение", cat_washer: "Стиральная машина", cat_fridge: "Холодильник", cat_water_heater: "Водонагреватель",
      cat_heater: "Обогреватель", cat_tv: "Телевизор", cat_computer: "Компьютер", cat_microwave: "Микроволновка", cat_kettle: "Чайник",
      cat_other: "Другие приборы", cat_unknown: "Неизвестно / нет в списке",
      lab_title: "Анализ умного счётчика",
      lab_lead: "Умные счётчики измеряют энергию каждый час. Лаборатория анализирует почасовые данные: суточную кривую нагрузки, постоянную базовую нагрузку, пиковые часы, ночные аномалии и даёт конкретные рекомендации. Данные можно смоделировать по вашим приборам, взять пример или загрузить CSV со счётчика.",
      lab_src_sim: "Моделировать по приборам", lab_src_sample: "Пример данных", lab_src_csv: "Загрузить CSV", lab_csv_download: "Скачать CSV",
      lab_src_label_sim: "Источник: 4-недельная почасовая модель по вашему списку приборов",
      lab_src_label_sample: "Источник: пример данных умного счётчика (не реальные), обогреватель забыт на две ночи",
      lab_src_label_csv: "Источник: ваш CSV-файл ({n} почасовых точек{unit})",
      lab_no_apps: "Список приборов пуст - показан пример. Добавьте приборы, чтобы смоделировать свой дом.",
      lab_csv_bad: "CSV не прочитан: нужно минимум 48 корректных почасовых строк. Проверьте формат.",
      lab_csv_ok: "CSV загружен: {n} почасовых точек{skip}.", lab_csv_skipped: ", пропущено строк: {n}",
      lab_unit_wh: ", переведено из Вт·ч",
      lab_live: "Мощность сейчас (модель)", lab_live_sub: "Среднее для этого часа: {avg} Вт · базовая нагрузка: {base} Вт",
      lab_kpi_daily: "В среднем за день", lab_kpi_base: "Базовая нагрузка", lab_kpi_peak: "Пиковый час", lab_kpi_lf: "Коэф. нагрузки",
      lab_kpi_month: "Прогноз на месяц", lab_kpi_standby: "Годовая стоимость базовой нагрузки",
      lab_period: "{from} - {to}",
      lab_curve_title: "Суточная кривая нагрузки",
      lab_curve_lead: "Средняя мощность для каждого часа. Пунктир - базовая нагрузка: приборы, которые никогда не выключаются (холодильник, роутер, режим ожидания).",
      lab_chart_avg: "Средняя мощность, кВт", lab_chart_base: "Базовая нагрузка", lab_chart_daily: "кВт·ч в день", lab_chart_event: "Необычный день",
      lab_ai_title: "Рекомендации", lab_ai_tag: "измеримо",
      lab_heat_title: "Карта неделя × час", lab_heat_lead: "Чем темнее ячейка, тем больше потребление в этот день и час.",
      lab_daily_title: "Потребление по дням", lab_events_title: "Необычные часы",
      lab_events_none: "Необычных часов не обнаружено",
      lab_event: "{date} {from}-{to} · {h} ч · +{kwh} кВт·ч · пик {peak} кВт",
      lab_event_night: "Неожиданная ночная нагрузка: возможно, оставлен включённым обогреватель, кондиционер или водонагреватель.",
      lab_event_day: "Необычно высокая дневная нагрузка: несколько мощных приборов одновременно или неисправный прибор.",
      lab_csv_title: "Формат CSV",
      lab_csv_lead: "Загрузите почасовые данные умного счётчика или кабинета Azərişıq в CSV. Поддерживаемые форматы (запятая, точка с запятой или табуляция):",
      lab_csv_note: "Значения в Вт·ч автоматически переводятся в кВт·ч. 15-минутные данные суммируются по часам. Файл обрабатывается только в браузере и никуда не отправляется.",
      dow: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      ins_baseload_high: "В вашем доме {w} Вт никогда не выключаются - {yearKwh} кВт·ч в год (≈ {yearAzn} ₼). Холодильник и роутер - норма, но телевизоры, приставки и старые адаптеры в режиме ожидания завышают это число. Каждые 10 Вт меньше - экономия ~{per10Kwh} кВт·ч (≈ {per10Azn} ₼) в год.",
      ins_baseload_mid: "Базовая нагрузка {w} Вт ({yearKwh} кВт·ч в год ≈ {yearAzn} ₼) - средняя. Отключая неиспользуемые приборы на ночь, вы экономите ~{per10Azn} ₼ в год на каждые 10 Вт.",
      ins_baseload_ok: "Базовая нагрузка всего {w} Вт, потери в режиме ожидания невелики.",
      ins_anomaly_night: "Ночью {n} раза обнаружена неожиданная нагрузка (+{kwh} кВт·ч ≈ {azn} ₼). Не оставался ли обогреватель или кондиционер включённым? Розетка с таймером устранит этот риск.",
      ins_anomaly_day: "Обнаружено {n} эпизодов необычно высокой нагрузки (+{kwh} кВт·ч ≈ {azn} ₼). Часы - в списке событий.",
      ins_tier_projection: "При таком темпе месяц закончится на ~{kwh} кВт·ч ({cost} ₼) - выше порога {limit} кВт·ч. Сокращение на ~{perDay} кВт·ч в день удержит вас в дешёвом тарифе.",
      ins_evening_peak: "{pct}% потребления приходится на 18:00-23:00 (пик в {hour}:00). Перенос стирки и нагрева воды на день снижает нагрузку на сеть.",
      ins_night_heavy: "{pct}% энергии расходуется ночью (23:00-07:00) - обычно это обогреватель или кондиционер.",
      ins_peaky: "Коэффициент нагрузки {lf}: потребление идёт короткими резкими пиками (до {peak} кВт). Не включайте мощные приборы одновременно - это бережёт и проводку.",
      ins_weekend_diff: "Потребление в выходные отличается от будних дней на {pct}%.",
      sev_good: "Хорошо",
      local_profile: "По анализу умного счётчика: базовая нагрузка {base} Вт, пиковый час {hour}:00, в среднем {daily} кВт·ч в день. {tip}",
    },
  };
  Object.keys(LT).forEach((l) => Object.assign(translations[l], LT[l]));

  const CAT_COLOR = { ac: "#3A86D4", lighting: "#CDB43A", washer: "#8C6BC8", fridge: "#2D9FB0", water_heater: "#D2574E",
    heater: "#D9773A", tv: "#7FA14A", computer: "#C8678F", microwave: "#D69A2D", kettle: "#A57BD6", other: "#7D8893", unknown: "#5A6B66" };
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const num = (v, d) => Number(v).toLocaleString(currentLang === "en" ? "en-US" : currentLang === "ru" ? "ru-RU" : "az-AZ", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d || 0 });

  // =========================================================
  // 1) TARİF PİLLƏLƏRİNİN ANİMASİYALI İZAHI
  // =========================================================
  let lastTierKwh = null;
  function renderTierViz(force) {
    const box = $("tierViz");
    if (!box) return;
    const t = T(), kwh = parseInt(slider.value, 10) || 0;
    const rows = E.tierBreakdown(kwh);
    const scaleMax = Math.max(400, Math.ceil(kwh / 50) * 50 + 50);
    const spans = rows.map((r) => (r.to === Infinity ? scaleMax - r.from : r.to - r.from));
    const total = E.calcTariff(kwh).cost;
    if (!box.dataset.built) {
      box.innerHTML = `<div class="tv-track">${rows.map((r, i) => `
        <div class="tv-seg ${r.tier}" style="flex-grow:${spans[i]}"><div class="tv-fill" style="transition-delay:${i * 0.35}s"></div>
          <span class="tv-range">${r.from}-${r.to === Infinity ? "" : r.to}</span></div>`).join("")}</div>
        <div class="tv-legend">${rows.map((r) => `<div class="tv-cell ${r.tier}"><span class="tier-dot ${r.tier}"></span><span class="tv-val"></span></div>`).join("")}</div>
        <div class="tv-total"></div>`;
      box.dataset.built = "1";
    }
    const segs = box.querySelectorAll(".tv-seg"), vals = box.querySelectorAll(".tv-val");
    rows.forEach((r, i) => {
      segs[i].style.flexGrow = spans[i];
      if (r.to === Infinity) segs[i].querySelector(".tv-range").textContent = r.from + "+";
      vals[i].textContent = r.used > 0 ? fmt(t.tv_seg, { used: num(r.used), rate: (r.rate * 100).toFixed(1).replace(".0", ""), cost: r.cost.toFixed(2) }) : t.tv_empty;
      vals[i].parentElement.classList.toggle("off", r.used <= 0);
    });
    box.querySelector(".tv-total").innerHTML = esc(fmt(t.tv_total, { kwh, cost: total.toFixed(2) }));
    const top = rows.filter((r) => r.used > 0).pop();
    $("tierExplain").textContent = kwh <= 200 ? fmt(t.tv_explain_low, { kwh }) :
      fmt(t.tv_explain_up, { kwh, over: num(top.used), rate: (top.rate * 100).toFixed(1).replace(".0", ""), avg: kwh ? ((total / kwh) * 100).toFixed(1) : "0" });
    const fills = box.querySelectorAll(".tv-fill");
    const apply = () => rows.forEach((r, i) => { fills[i].style.width = (spans[i] ? Math.min(100, (r.used / spans[i]) * 100) : 0) + "%"; });
    if (force || lastTierKwh === null) {
      // Sıfırdan yenidən doldur (pillə-pillə animasiya)
      fills.forEach((f) => { f.style.transition = "none"; f.style.width = "0%"; });
      void box.offsetWidth;
      fills.forEach((f, i) => { f.style.transition = ""; f.style.transitionDelay = (reduceMotion ? 0 : i * 0.35) + "s"; });
      requestAnimationFrame(apply);
    } else {
      fills.forEach((f) => { f.style.transitionDelay = "0s"; });
      apply();
    }
    lastTierKwh = kwh;
  }

  // =========================================================
  // 2) ENERJİ AXINI DİAQRAMI (SVG, animasiyalı)
  // =========================================================
  // Diaqram ikonları (24x24 xətt): elektrik stansiyası, şəbəkə, ev
  const FLOW_ICON = {
    plant: "M3 21V11l5 3v-3l5 3V8l8 4v9zM3 21h18M7 17h2M12 17h2M17 17h2",
    grid: "M12 2 7.5 22M12 2l4.5 20M8.5 8h7M7.2 13h9.6M6 18h12M10 5h4",
    home: "M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5",
  };
  function renderFlow() {
    const box = $("flowViz");
    if (!box) return;
    const t = T(), kwh = parseInt(slider.value, 10) || 0;
    const f = E.energyFlow(kwh, appliances, 4);
    const narrow = box.clientWidth < 560;
    const maxW = narrow ? 26 : 34;
    const wOf = (v) => Math.max(2, (v / Math.max(1, f.generated)) * maxW);
    const parts = f.parts.length ? f.parts : [{ key: "unknown", kwh, share: 1 }];
    const label = (k) => t["cat_" + k] || k;
    const line = (d, w, color, cls) => `<path class="flow-base ${cls || ""}" d="${d}" stroke="${color}" stroke-width="${w}"/>` +
      `<path class="flow-line ${cls || ""}" d="${d}" stroke="${color}" stroke-width="${Math.max(2, Math.min(6, w * 0.3))}"/>`;
    let svg;
    if (!narrow) {
      // Üfüqi: stansiya → şəbəkə → sayğac → cihazlar
      const H = Math.max(250, parts.length * 54 + 40), cy = H / 2 - 10;
      const X = { plant: 70, grid: 270, home: 470, app: 640 };
      const gap = (H - 40) / parts.length;
      const branches = parts.map((p, i) => {
        const y = 20 + gap * i + gap / 2, w = wOf(p.kwh), c = CAT_COLOR[p.key] || "#7C9088";
        return `${line(`M${X.home + 34},${cy} C${X.home + 110},${cy} ${X.app - 70},${y} ${X.app - 14},${y}`, w, c)}
          <circle cx="${X.app + 6}" cy="${y}" r="14" fill="${c}" opacity=".18"/><circle cx="${X.app + 6}" cy="${y}" r="5" fill="${c}"/>
          <text x="${X.app + 28}" y="${y - 3}" class="flow-t">${esc(label(p.key))}</text>
          <text x="${X.app + 28}" y="${y + 14}" class="flow-s">${num(p.kwh)} kVt · ${Math.round(p.share * 100)}%</text>`;
      }).join("");
      svg = `<svg viewBox="0 0 860 ${H}" class="flow-svg" xmlns="http://www.w3.org/2000/svg">
        ${line(`M${X.plant + 34},${cy} L${X.grid - 34},${cy}`, wOf(f.generated), "var(--low)")}
        ${line(`M${X.grid + 34},${cy} L${X.home - 34},${cy}`, wOf(f.consumed), "var(--low)")}
        ${line(`M${X.grid + 20},${cy + 28} C${X.grid + 40},${cy + 70} ${X.grid + 60},${H - 26} ${X.grid + 96},${H - 26}`, wOf(f.loss), "var(--high)", "loss")}
        <text x="${X.grid + 106}" y="${H - 30}" class="flow-t loss-t">${esc(t.flow_loss)}</text>
        <text x="${X.grid + 106}" y="${H - 14}" class="flow-s">${num(f.loss)} kVt · 7.6%</text>
        ${branches}
        ${node(X.plant, cy, "plant", t.flow_plant, num(f.generated) + " kVt")}
        ${node(X.grid, cy, "grid", t.flow_grid, "", false, true)}
        ${node(X.home, cy, "home", t.flow_home, num(f.consumed) + " kVt")}
        <text x="${X.plant}" y="${cy - 48}" text-anchor="middle" class="flow-s co2">${num(f.co2Kg)} kq CO₂</text>
      </svg>`;
    } else {
      // Şaquli (mobil): yuxarıdan aşağı
      const W = 360, rows = parts.length, H = 360 + rows * 52;
      const Y = { plant: 50, grid: 160, home: 270 };
      const branches = parts.map((p, i) => {
        const y = 372 + i * 52, w = Math.min(wOf(p.kwh), 14), c = CAT_COLOR[p.key] || "#7C9088";
        // Budaqlar sol kənar boyunca enir - mətnlərin üstündən keçmir
        return `${line(`M${W / 2 - 30},${Y.home + 14} C30,${Y.home + 14} 30,${Y.home + 30} 30,${Y.home + 60} L30,${y - 14} Q30,${y} 48,${y}`, w, c)}
          <circle cx="66" cy="${y}" r="15" fill="${c}" opacity=".18"/><circle cx="66" cy="${y}" r="5" fill="${c}"/>
          <text x="92" y="${y - 2}" class="flow-t">${esc(label(p.key))}</text>
          <text x="92" y="${y + 15}" class="flow-s">${num(p.kwh)} kVt · ${Math.round(p.share * 100)}%</text>`;
      }).join("");
      svg = `<svg viewBox="0 0 ${W} ${H}" class="flow-svg" xmlns="http://www.w3.org/2000/svg">
        ${line(`M${W / 2},${Y.plant + 34} L${W / 2},${Y.grid - 34}`, wOf(f.generated), "var(--low)")}
        ${line(`M${W / 2},${Y.grid + 34} L${W / 2},${Y.home - 34}`, wOf(f.consumed), "var(--low)")}
        ${line(`M${W / 2 + 34},${Y.grid} C${W / 2 + 80},${Y.grid} ${W - 60},${Y.grid + 10} ${W - 40},${Y.grid + 40}`, wOf(f.loss), "var(--high)", "loss")}
        <text x="${W - 8}" y="${Y.grid + 62}" text-anchor="end" class="flow-t loss-t">${esc(t.flow_loss)}</text>
        <text x="${W - 8}" y="${Y.grid + 78}" text-anchor="end" class="flow-s">${num(f.loss)} kVt</text>
        ${branches}
        ${node(W / 2, Y.plant, "plant", t.flow_plant, num(f.generated) + " kVt", true)}
        ${node(W / 2, Y.grid, "grid", t.flow_grid, "", true)}
        ${node(W / 2, Y.home, "home", t.flow_home, num(f.consumed) + " kVt", true)}
        <text x="16" y="${Y.plant + 4}" class="flow-s co2">${num(f.co2Kg)} kq CO₂</text>
      </svg>`;
    }
    box.innerHTML = svg + `<p class="pro-note">${esc(t.flow_note)}</p>`;
    function node(x, y, ico, title, sub, side, above) {
      const lx = side ? x + 46 : x, ly = side ? y - 4 : above ? y - 46 : y + 54;
      return `<circle cx="${x}" cy="${y}" r="34" class="flow-node"/><g transform="translate(${x - 13} ${y - 13}) scale(1.08)" class="flow-ic"><path d="${FLOW_ICON[ico]}"/></g>
        <text x="${lx}" y="${ly}" text-anchor="${side ? "start" : "middle"}" class="flow-t">${esc(title)}</text>
        ${sub ? `<text x="${lx}" y="${ly + 17}" text-anchor="${side ? "start" : "middle"}" class="flow-s">${esc(sub)}</text>` : ""}`;
    }
  }

  // =========================================================
  // 3) AĞILLI SAYĞAC AI LABORATORİYASI
  // =========================================================
  const LAB_KEY = "energyx_lab";
  let lab = { src: null, points: null, analysis: null, unit: "kWh" }, curveChart = null, dailyChart = null, liveTimer = null, activeTab = "calc";

  function labState() { return P.load(LAB_KEY, { src: null, csv: null }); }
  function computeLab() {
    const st = labState();
    const t = T();
    let src = st.src || (appliances.length ? "sim" : "sample"), points, hint = "";
    if (src === "csv" && Array.isArray(st.csv) && st.csv.length >= 48) {
      points = st.csv.map(([ts, kwh]) => ({ ts, kwh }));
    } else if (src === "sim" && appliances.length) {
      points = E.simulateLoadProfile({ appliances, days: 28, end: new Date(), seed: 7 });
    } else {
      if (src === "sim") hint = t.lab_no_apps;
      if (src === "csv") src = "sample";
      points = E.sampleMeterProfile(new Date());
      if (src === "sim") src = "sample";
    }
    lab = { src, points, analysis: E.analyzeLoadProfile(points), unit: st.unit || "kWh", hint };
    return lab;
  }

  function dateLabel(ts, withTime) {
    const d = new Date(ts);
    const s = d.getDate() + " " + P.shortMonth(P.monthLabel(E.monthKey(d.getFullYear(), d.getMonth()), true).replace(/\s*\d{4}$/, ""));
    return withTime ? s + " " + String(d.getHours()).padStart(2, "0") + ":00" : s;
  }

  function renderLab(draw) {
    const t = T(), a = lab.analysis;
    document.querySelectorAll("[data-lab-src]").forEach((b) => b.classList.toggle("active", b.dataset.labSrc === lab.src));
    const csvBtn = $("labCsv").closest("label");
    if (csvBtn) csvBtn.classList.toggle("active", lab.src === "csv");
    const hint = $("labHint");
    const srcLabel = lab.src === "csv" ? fmt(t.lab_src_label_csv, { n: lab.points.length, unit: lab.unit === "Wh" ? t.lab_unit_wh : "" })
      : t["lab_src_label_" + lab.src];
    hint.hidden = false;
    hint.textContent = (lab.hint ? lab.hint + " " : "") + srcLabel;
    if (!a) return;
    $("labPeriod").textContent = fmt(t.lab_period, { from: dateLabel(a.from), to: dateLabel(a.to) });

    const kpi = (val, label, cls) => `<div class="kpi"><div class="kpi-val ${cls || ""}">${val}</div><div class="kpi-label">${esc(label)}</div></div>`;
    $("labKpis").innerHTML =
      kpi(`${num(a.avgDailyKwh, 1)} kVt·s`, t.lab_kpi_daily) +
      kpi(`${num(a.baseloadW)} W`, t.lab_kpi_base, a.baseloadW > 120 ? "high" : a.baseloadW > 60 ? "mid" : "low") +
      kpi(`${String(a.peakHour).padStart(2, "0")}:00`, t.lab_kpi_peak) +
      kpi(a.loadFactor.toFixed(2), t.lab_kpi_lf) +
      kpi(`${num(a.monthKwh)} kVt · ${a.monthCost.toFixed(0)} ₼`, t.lab_kpi_month, a.monthTier) +
      kpi(`${num(a.standbyYearAzn)} ₼`, t.lab_kpi_standby);

    // AI tövsiyələri
    const ins = E.profileInsights(a);
    $("labInsights").innerHTML = ins.map((i) => `<div class="diag-item sev-${i.severity === "good" ? "low" : i.severity}">
      <div class="tl-head"><span class="sev-badge sev-${i.severity === "good" ? "low" : i.severity}">${esc(i.severity === "good" ? t.sev_good : t["sev_" + i.severity])}</span></div>
      <div class="tl-cause">${esc(fmt(t["ins_" + i.key], i.vars))}</div></div>`).join("");

    // Həftə × saat istilik xəritəsi
    let max = 0;
    a.weekHour.forEach((row) => row.forEach((v) => { if (v != null && v > max) max = v; }));
    let html = `<div class="wk-row wk-head"><span></span>${Array.from({ length: 24 }, (_, h) => `<span>${h % 3 === 0 ? String(h).padStart(2, "0") : ""}</span>`).join("")}</div>`;
    a.weekHour.forEach((row, d) => {
      html += `<div class="wk-row"><span class="wk-day">${esc(t.dow[d])}</span>` + row.map((v, h) => {
        if (v == null) return `<span class="wk-cell none"></span>`;
        const k = max ? v / max : 0;
        return `<span class="wk-cell" style="--k:${k.toFixed(3)}" title="${esc(t.dow[d])} ${String(h).padStart(2, "0")}:00 - ${num(v * 1000)} W"></span>`;
      }).join("") + `</div>`;
    });
    $("labHeat").innerHTML = html;

    // Hadisələr
    $("labEvents").innerHTML = a.events.length ? a.events.map((e) => {
      const toH = (new Date(e.endTs).getHours() + 1) % 24;
      return `<div class="tl-item anomaly"><div class="tl-dot"></div><div class="tl-body">
        <div class="tl-head"><b>${esc(fmt(t.lab_event, { date: dateLabel(e.startTs), from: String(new Date(e.startTs).getHours()).padStart(2, "0") + ":00",
          to: String(toH).padStart(2, "0") + ":00", h: e.durationH, kwh: num(e.extraKwh, 1), peak: num(e.peakKw, 2) }))}</b></div>
        <div class="tl-cause">${esc(e.type === "night" ? t.lab_event_night : t.lab_event_day)}</div></div></div>`;
    }).join("") : `<div class="factor-ok">${esc(t.lab_events_none)}</div>`;

    if (!draw || typeof Chart === "undefined") return;
    const low = P.cssVar("--low"), high = P.cssVar("--high");
    // 24 saatlıq əyri
    const curveData = {
      labels: Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")),
      datasets: [
        { label: t.lab_chart_avg, data: a.hourlyAvgKw, borderColor: low, backgroundColor: P.tint("--low", 0.18), fill: true, tension: 0.35, pointRadius: 2, borderWidth: 2.5 },
        { label: t.lab_chart_base, data: new Array(24).fill(a.baseloadW / 1000), borderColor: P.cssVar("--line2"), borderDash: [6, 5], pointRadius: 0, borderWidth: 1.5, fill: false },
      ],
    };
    const o1 = P.chartBase();
    if (curveChart) { curveChart.data = curveData; curveChart.options = o1; curveChart.update(); }
    else curveChart = new Chart($("labCurve"), { type: "line", data: curveData, options: o1 });
    // Gündəlik cəmlər
    const evDays = new Set(a.events.map((e) => new Date(e.startTs).toDateString()));
    const dd = a.dailyTotals;
    const dailyData = {
      labels: dd.map((d) => { const [y, m, day] = d.date.split("-").map(Number); return dateLabel(new Date(y, m - 1, day).getTime()); }),
      datasets: [{ label: t.lab_chart_daily, data: dd.map((d) => d.kwh), borderRadius: 4,
        backgroundColor: dd.map((d) => { const [y, m, day] = d.date.split("-").map(Number); return evDays.has(new Date(y, m - 1, day).toDateString()) ? high : d.wknd ? P.tint("--low", 0.55) : low; }) }],
    };
    const o2 = P.chartBase();
    if (dailyChart) { dailyChart.data = dailyData; dailyChart.options = o2; dailyChart.update(); }
    else dailyChart = new Chart($("labDaily"), { type: "bar", data: dailyData, options: o2 });
  }

  // Canlı sayğac: hazırkı saatın orta gücü + kiçik dalğalanma (yalnız bölmə açıq olanda)
  function tickLive() {
    const a = lab.analysis;
    if (!a) return;
    const t = T(), now = new Date();
    const h = now.getHours(), next = (h + 1) % 24, f = now.getMinutes() / 60;
    const avgKw = a.hourlyAvgKw[h] * (1 - f) + a.hourlyAvgKw[next] * f;
    const w = Math.max(a.baseloadW * 0.9, avgKw * 1000 * (1 + (Math.random() - 0.5) * 0.16));
    const peakW = Math.max(...a.hourlyAvgKw) * 1000 * 1.25;
    $("liveW").textContent = num(w) + " W";
    $("liveBar").style.width = Math.min(100, (w / peakW) * 100) + "%";
    $("liveBase").style.left = Math.min(100, (a.baseloadW / peakW) * 100) + "%";
    $("liveSub").textContent = fmt(t.lab_live_sub, { avg: num(a.hourlyAvgKw[h] * 1000), base: num(a.baseloadW) });
  }
  function setLive(on) {
    clearInterval(liveTimer); liveTimer = null;
    if (on) { tickLive(); if (!reduceMotion) liveTimer = setInterval(() => { if (!document.hidden) tickLive(); }, 1500); }
  }

  function setSource(src) {
    const st = labState();
    st.src = src;
    P.store(LAB_KEY, st);
    computeLab(); renderLab(activeTab === "meter"); setLive(activeTab === "meter");
  }

  function importCsv(input) {
    const file = input.files && input.files[0];
    input.value = "";
    const t = T();
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { P.toast(t.lab_csv_bad, "bad"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const r = E.parseMeterCsv(reader.result);
      const a = r.points.length >= 48 ? E.analyzeLoadProfile(r.points) : null;
      if (!a) { P.toast(t.lab_csv_bad, "bad"); return; }
      // Saatlıq cəmlənmiş formada saxlanılır (ən çox 2 il)
      const hourly = new Map();
      r.points.forEach((p) => { const d = new Date(p.ts); d.setMinutes(0, 0, 0); hourly.set(d.getTime(), (hourly.get(d.getTime()) || 0) + p.kwh); });
      const csv = [...hourly.entries()].sort((x, y) => x[0] - y[0]).slice(-17520).map(([ts, kwh]) => [ts, Math.round(kwh * 1000) / 1000]);
      P.store(LAB_KEY, { src: "csv", csv, unit: r.unit });
      P.toast(fmt(t.lab_csv_ok, { n: csv.length, skip: r.skipped ? fmt(t.lab_csv_skipped, { n: r.skipped }) : "" }), "info");
      setSource("csv");
    };
    reader.readAsText(file);
  }

  function downloadCsv() {
    if (!lab.points) computeLab();
    const blob = new Blob([E.profileToCsv(lab.points)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `energyx-az-meter-${lab.src}.csv`; // ASCII ad - bəzi brauzerlər "ğ"-li adı nəzərə almır
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // =========================================================
  // 4) AI KONTEKSTİ + OFLAYN KÖMƏKÇİ GENİŞLƏNMƏSİ
  // =========================================================
  const origCtx = P.aiContext;
  P.aiContext = function () {
    const ctx = origCtx();
    if (!lab.analysis) computeLab();
    const a = lab.analysis;
    if (a) ctx.profile = { baseloadW: a.baseloadW, peakHour: a.peakHour, avgDailyKwh: a.avgDailyKwh, nightSharePct: Math.round(a.nightShare * 100),
      events: a.events.length, source: lab.src };
    return ctx;
  };
  const origLocal = P.localAnswer;
  P.localAnswer = function (q) {
    const s = String(q || "").toLowerCase();
    if (/baza|gecə|gece|standby|gözləmə|sayğac|saatlıq|night|baseload|hourly|ночь|базов|ожидан|счётчик/.test(s)) {
      if (!lab.analysis) computeLab();
      const a = lab.analysis, t = T();
      if (a) {
        const tip = E.profileInsights(a)[0];
        return t.local_prefix + fmt(t.local_profile, { base: a.baseloadW, hour: String(a.peakHour).padStart(2, "0"), daily: num(a.avgDailyKwh, 1),
          tip: tip ? fmt(t["ins_" + tip.key], tip.vars) : "" });
      }
    }
    return origLocal(q);
  };

  // =========================================================
  // 5) YENİLƏMƏ ZƏNCİRİ
  // =========================================================
  let flowWidth = 0;
  const origRefresh = window.EnergyExtras.refresh;
  window.EnergyExtras.refresh = function (state, tab) {
    origRefresh(state, tab);
    const prevTab = activeTab;
    activeTab = tab || activeTab;
    renderTierViz(false);
    if (activeTab === "learn") { renderFlow(); flowWidth = $("flowViz").clientWidth; }
    if (activeTab === "meter") {
      if (!lab.analysis || prevTab !== "meter") computeLab();
      renderLab(true);
    }
    setLive(activeTab === "meter");
    if (activeTab === "calc" && prevTab !== "calc") renderTierViz(true);
  };

  // Cihaz siyahısı dəyişəndə simulyasiya yenilənməlidir
  const origRenderApps = window.renderAppliances;
  window.renderAppliances = function () {
    origRenderApps.apply(this, arguments);
    if (lab.src === "sim" || lab.src === null) lab.analysis = null;
  };

  // Hadisələr
  document.querySelectorAll("[data-lab-src]").forEach((b) => b.addEventListener("click", () => setSource(b.dataset.labSrc)));
  $("labCsv").addEventListener("change", (e) => importCsv(e.target));
  $("labCsvDownload").addEventListener("click", downloadCsv);
  $("tierReplay").addEventListener("click", () => renderTierViz(true));
  let rT = null;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { const w = $("flowViz").clientWidth; if (activeTab === "learn" && Math.abs(w - flowWidth) > 40) { renderFlow(); flowWidth = w; } }, 200);
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && activeTab === "meter") tickLive(); });

  window.EnergyLab = { compute: computeLab, render: renderLab, setSource, renderTierViz, renderFlow, state: () => lab };
  applyTranslations(currentLang);
  P.refresh();
})();
