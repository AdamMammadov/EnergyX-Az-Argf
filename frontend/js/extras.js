// ==========================================
// EnergyX Az v2.1 — Qaz, Sayğac diaqnozu, Həssaslıq, Doğrulama, İstilik xəritəsi,
// Evin enerji xəritəsi, Nailiyyətlər, Kəsintiyə hazırlıq, Paylaşma, Xatırlatma
// pro.js-dən SONRA yüklənir (EnergyPro köməkçilərindən istifadə edir).
// ==========================================
(function () {
  "use strict";
  const E = window.EnergyEngine, P = window.EnergyPro;
  const $ = (id) => document.getElementById(id);
  const T = () => translations[currentLang];
  const fmt = P.fmt;

  // ===== TƏRCÜMƏLƏR =====
  const XT = {
    az: {
      tab_gas: "Qaz", tab_ready: "Hazırlıq", share_btn: "🔗 Paylaş",
      share_text: "Bu ay {kwh} kVt·saat elektrik istifadə edirəm — təxminən {cost} ₼ ({tier}). Öz xərcinizi EnergyX Az ilə hesablayın:",
      share_copied: "Keçid kopyalandı — istədiyiniz yerə yapışdırın.",
      reminder: "📅 {m} üçün sayğac göstəricisini hələ qeyd etməmisiniz. Aylıq qeyd anomaliya aşkarlanmasını və proqnozu dəqiqləşdirir.",
      reminder_btn: "İndi qeyd et",
      twin_title: "Evin Enerji Xəritəsi", twin_tag: "rəqəmsal əkiz",
      twin_lead: "Hər kafel bir cihazdır: ölçüsü aylıq istifadəyə, rəngi effektivliyə görədir. Qırmızı çərçivə — tipik effektiv modeldən çox işlədir.",
      twin_empty: "Cihaz əlavə edin — evinizin enerji xəritəsi burada görünəcək.",
      twin_share: "payı",
      sens_label: "Həssaslıq:", sens_careful: "Ehtiyatlı — az yanlış həyəcan", sens_balanced: "Balanslı (tövsiyə)", sens_sensitive: "Həssas — heç nəyi qaçırma",
      sens_stat: "Sınaqda: dəqiqlik {p}%, aşkarlama {r}%, yanlış həyəcan {f}%",
      diag_title: "Sayğac Diaqnozu", diag_tag: "nasazlıq · müdaxilə · trend",
      diag_lead: "Anomaliyaların formasına görə ehtimal olunan səbəb: sayğac nasazlığı, icazəsiz müdaxilə, cihaz problemi və ya tədrici dəyişiklik. Bu, ehtimaldır — təsdiq üçün mütəxəssis yoxlaması lazımdır.",
      diag_none: "Sayğac tarixçəsində şübhəli forma aşkarlanmayıb ✅", diag_need: "Diaqnoz üçün ən azı 4 aylıq oxunuş lazımdır.",
      diag_months: "Aylar", diag_action: "Nə etməli",
      sev_critical: "Kritik", sev_high: "Yüksək", sev_medium: "Orta", sev_low: "Aşağı",
      diag_meter_zero: "Sayğac nasazlığı (sıfır göstərici)",
      diag_meter_zero_x: "Göstərici əvvəllər normal idi, sonra tam sıfıra düşdü. Bu, adətən icazəsiz müdaxilə yox, sayğacın özünün və ya rabitəsinin nasazlığıdır — yan keçirilmiş sayğac çox vaxt azalmış, amma sıfırdan fərqli göstərici verir.",
      diag_meter_zero_a: "Azərişıq çağrı mərkəzinə (199) müraciət edib sayğacın yoxlanmasını istəyin. Əks halda sonradan toplu yenidən hesablama (borc) yarana bilər.",
      diag_suspicious_drop: "Şübhəli davamlı azalma",
      diag_suspicious_drop_x: "İstifadə kəskin düşüb və aşağı qalıb, mövsüm isə bunu izah etmir. Səbəb uzun müddət evdə olmamaq ola bilər; olmayıbsa — sayğacın düzgün saymaması və ya xəttə icazəsiz qoşulma (bypass) əlaməti ola bilər.",
      diag_suspicious_drop_a: "Evdə olmamısınızsa, sayğacın plombunu və qoşulmasını yoxlatdırın. Düzgün saymayan sayğac sonradan cərimə və ya yenidən hesablama riski yaradır.",
      diag_sustained_rise: "Davamlı artım — ehtimal olunan cihaz nasazlığı",
      diag_sustained_rise_x: "Ardıcıl aylarda istifadə gözləniləndən xeyli yuxarıdır. Ən çox rast gəlinən səbəblər: su qızdırıcısının termostatı, soyuducunun kompressoru/rezini, elektrik qızdırıcısı və ya izolyasiya problemi.",
      diag_sustained_rise_a: "Cihazlar bölməsində ən çox enerji yeyən cihazları yoxlayın; gecə bütün cihazları söndürüb sayğacın fırlanıb-fırlanmadığına baxın.",
      diag_spike: "Tək qeyri-adi pik",
      diag_spike_x: "Bir ayda istifadə tarixi bazadan xeyli yuxarı qalxıb, sonra normala qayıdıb: qonaqlar, yeni cihaz, isti/soyuq hava dalğası və ya oxunuş xətası ola bilər.",
      diag_spike_a: "Həmin ayın hesabını sayğacın real göstəricisi ilə tutuşdurun; izah tapılmasa, yenidən oxunuş tələb edin.",
      diag_gradual_rise: "Tədrici artım trendi",
      diag_gradual_rise_x: "İstifadə aylarla yavaş-yavaş artır ({t}%/ay, mövsüm nəzərə alınıb). Tək ayda nəzərə çarpmır, amma il ərzində əhəmiyyətli xərc yaradır.",
      diag_gradual_rise_a: "Yeni alınmış cihazları və köhnəlmiş soyuducu/kondisioneri yoxlayın — Planlaşdır bölməsindəki sərmayə planına baxın.",
      diag_gradual_decline: "Tədrici azalma trendi",
      diag_gradual_decline_x: "İstifadə aylarla azalır ({t}%/ay). Ən çox halda bu, qənaət tədbirlərinin nəticəsidir 👏; nadir hallarda inkişaf edən sayğac/əlaqə nasazlığı ola bilər.",
      diag_gradual_decline_a: "Qənaət etdiyinizi bilirsinizsə — əla! Əks halda sayğac göstəricisini hesabla müqayisə edin.",
      heat_title: "İstifadə İstilik Xəritəsi", heat_tag: "ay × il", heat_none: "məlumat yoxdur", heat_empty: "İstilik xəritəsi üçün Sayğaclarım-a aylıq qeydlər əlavə edin.",
      ach_title: "Nailiyyətlər və Aylıq Çağırış", ach_count: "{n}/{t} qazanılıb",
      ch_title: "🎯 {m} çağırışı", ch_text: "Hədəf: ≤ {target} kVt (≈ {cost} ₼) — keçən ayın mövsümə düzəldilmiş səviyyəsindən 10% az.",
      ch_done: "✅ Çağırış tamamlandı: {cur} kVt!", ch_fail: "Bu ay {cur} kVt — hədəfdən {d} kVt çox. Növbəti ay yenidən cəhd edin!",
      ch_pending: "Ay sonunda Sayğaclarım-a bu ayın göstəricisini əlavə edin.", ch_none: "Çağırış üçün ən azı bir keçmiş ay qeydi lazımdır.",
      b_first: "İlk addım", b_first_d: "İlk sayğac qeydi",
      b_streak3: "Ardıcıl 3 ay", b_streak3_d: "3 ay fasiləsiz qeyd",
      b_streak12: "Tam il", b_streak12_d: "12 ay fasiləsiz qeyd",
      b_low_tier: "Aşağı pillə", b_low_tier_d: "Son ay ≤ 200 kVt",
      b_saver: "Qənaətcil", b_saver_d: "Keçən aydan 10% az (mövsümə görə)",
      b_planner: "Planlaşdırıcı", b_planner_d: "Aylıq büdcə təyin edilib",
      b_auditor: "Cihaz auditoru", b_auditor_d: "5+ cihaz analiz edilib",
      b_healthy: "Sağlam ev", b_healthy_d: "Sağlamlıq balı ≥ 85",
      gas_title: "Təbii Qaz Kalkulyatoru",
      gas_lead: "Qaz tarifi İLLİK həcmə görə pillələnir: ilin əvvəlindən yığılan istifadə 1200 m³-i keçdikdən sonra hər kubmetr bahalaşır. Qışda istilik səbəbindən istifadə kəskin artır.",
      gas_month_label: "Bu ayın istifadəsi (m³)", gas_prior_label: "Bu il əvvəlki aylarda (m³)", gas_month_sel: "Ay",
      gas_cost: "Bu ayın xərci", gas_cum: "İl üzrə yığılan", gas_co2: "kq CO₂ (bu ay)",
      gas_t1: "12.5 qəpik/m³", gas_t2: "20 qəpik/m³", gas_t3: "25 qəpik/m³", gas_part: "{m} m³ × {r} qəp",
      gasfc_title: "İl Sonuna Qədər Proqnoz", gasfc_tag: "istilik mövsümü modeli",
      gasfc_text: "Bu templə il sonuna qədər {cum} m³ yığılacaq, qalan ayların xərci ≈ {cost} ₼.",
      gasfc_cross: " ⚠️ 1200 m³ həddi {m} ayında keçiləcək — bundan sonra hər m³ 20 qəpik olacaq.",
      gasfc_cross2: " 2500 m³ həddi isə {m} ayında (25 qəpik).",
      gasfc_typical: " Tipik il: ~{y} m³ ≈ {c} ₼, ~{co2} kq CO₂.",
      chart_gas_m3: "m³/ay", chart_gas_cum: "İl üzrə yığılan",
      leak_title: "Sızma Testi", leak_tag: "2 göstərici ilə",
      leak_lead: "Axşam bütün qaz cihazlarını (soba, kombi, plita, su qızdırıcı) söndürün və sayğac göstəricisini yazın. Səhər heç nəyi yandırmadan yenidən yazın. Sayğac hərəkət edibsə — sızma ola bilər.",
      leak_start: "Axşam göstəricisi (m³)", leak_end: "Səhər göstəricisi (m³)", leak_hours: "Neçə saat keçib", leak_btn: "Yoxla",
      leak_ok: "✅ Sayğac hərəkət etməyib — sızma əlaməti yoxdur.",
      leak_bad: "⚠️ Heç bir cihaz işləmədən {d} m³ keçib (≈ {mo} m³/ay). Sızma ehtimalı var: qaz iyini yoxlayın, birləşmələri sabun köpüyü ilə sınayın və 104 qəza xidmətinə müraciət edin.",
      leak_invalid: "Səhər göstəricisi axşamkından az ola bilməz — rəqəmləri yoxlayın.",
      gsafe_title: "Dəm Qazı və Qaz Təhlükəsizliyi",
      gsafe: [
        "Qaz iyi gəlirsə: işıq açarlarına toxunmayın, alov yandırmayın, pəncərələri açın, ventili bağlayın, binadan çıxıb 104-ə zəng edin.",
        "Dəm qazı (CO) iysiz və rəngsizdir — yataq otağına və soba olan otağa CO detektoru quraşdırın.",
        "Baş ağrısı, ürəkbulanma, yuxululuq hiss edirsinizsə — dərhal təmiz havaya çıxın və 103-ə zəng edin.",
        "Sobanı və ya qaz plitəsini gecə açıq qoyub yatmayın; plitədən otağı qızdırmaq üçün istifadə etməyin.",
        "Baca və ventilyasiyanı hər istilik mövsümündən əvvəl yoxlatdırın; kombinin illik texniki baxışını keçirin.",
        "Şlanq və birləşmələri yalnız sabun köpüyü ilə yoxlayın — heç vaxt açıq alovla yox.",
      ],
      ready_title: "Kəsintiyə Hazırlıq",
      ready_lead: "Elektrik kəsiləndə hansı cihazlar işləməlidir? Siyahını seçin — neçə Vt·saat ehtiyat enerji, hansı tutumda powerbank və ya ehtiyat qida mənbəyi lazım olduğunu hesablayaq.",
      out_title: "Ehtiyat Enerji Planlayıcısı", out_tag: "kritik cihazlar", out_hours: "Kəsinti müddəti", out_h: "saat",
      out_router: "Wi-Fi router", out_phone: "Telefon şarjı", out_led: "LED lampa", out_laptop: "Noutbuk", out_fridge: "Soyuducu",
      out_kombi: "Qaz kombisi (nasos/idarəetmə)", out_cpap: "Tibbi cihaz (CPAP)", out_tv: "Televizor",
      out_count: "say",
      out_load: "Orta yük", out_energy: "Lazım olan enerji", out_cap: "Tövsiyə olunan ehtiyat tutumu", out_inv: "İnvertor gücü (min.)",
      out_pb: "≈ {n} ədəd 10 000 mAh powerbank kifayət edər.",
      out_station: "Bu, powerbank üçün çoxdur — portativ elektrik stansiyası (≥ {wh} Vt·saat) və ya UPS lazımdır.",
      out_kombi_note: "💡 Qaz kombisi elektriksiz işləmir (nasos və idarəetmə) — qışda kəsinti zamanı istilik də kəsiləcək.",
      out_gen_note: "⚠️ Benzin generatorunu heç vaxt qapalı yerdə, eyvanda və ya pəncərə yanında işlətməyin — dəm qazı zəhərlənməsi riski.",
      out_none: "Ən azı bir cihaz seçin.",
      food_title: "Soyuducu Qida Təhlükəsizliyi",
      food_ok: "✅ {h} saatlıq kəsinti: qapı bağlı qalarsa soyuducudakı qida təhlükəsizdir (≈ 4 saata qədər).",
      food_warn: "⚠️ {h} saatlıq kəsinti: soyuducudakı tez xarab olan qidalar (ət, süd, hazır yemək) 4 saatdan sonra riskli olur. Dondurucu dolu və bağlıdırsa ≈ 48 saat, yarı doludursa ≈ 24 saat saxlayır.",
      food_bad: "❌ {h} saat çox uzundur: dolu dondurucu belə ≈ 48 saata qədər saxlayır. Termometrlə yoxlayın — 4°C-dən yuxarı 2 saatdan çox qalmış qidanı atın.",
      food_src: "Mənbə: ABŞ Kənd Təsərrüfatı Nazirliyinin (USDA) qida təhlükəsizliyi tövsiyələri.",
      sos_title: "Təcili Əlaqə", sos_note: "Nömrələr ümumi məlumat üçündür — rəsmi saytlardan yoxlayın.",
      sos_112: "Vahid təcili xidmət", sos_101: "Yanğından mühafizə", sos_103: "Təcili tibbi yardım", sos_104: "Qaz qəza xidməti", sos_199: "Azərişıq çağrı mərkəzi",
      val_title: "Metodun Doğrulanması", val_tag: "şəffaflıq",
      val_lead: "Anomaliya detektoru {homes} sintetik ev təsərrüfatı × {months} ay üzərində sınaqdan keçirildi; {anom} evə bilinən anomaliya (pik, davamlı artım, azalma, sıfır) əlavə olundu.",
      val_note: "Açıq, sayğac-səviyyəli real Azərbaycan istehlak datası mövcud deyil, ona görə bu sınaq REAL data deyil — Bakının iqlim ritmi ilə kalibrlənmiş sintetik ssenaridir. Testi brauzeriniz indi, canlı olaraq aparır.",
      val_z: "z həddi", val_p: "Dəqiqlik", val_r: "Aşkarlama", val_f: "Yanlış həyəcan", val_types: "Növlər üzrə (pik / artım / azalma / sıfır)",
      val_level: { 2.5: "Həssas", 3.5: "Balanslı", 4.5: "Ehtiyatlı" },
    },
    en: {
      tab_gas: "Gas", tab_ready: "Preparedness", share_btn: "🔗 Share",
      share_text: "I use {kwh} kWh of electricity this month — about {cost} ₼ ({tier}). Calculate yours with EnergyX Az:",
      share_copied: "Link copied — paste it anywhere.",
      reminder: "📅 You haven't logged your meter reading for {m} yet. Monthly entries make anomaly detection and forecasts more accurate.",
      reminder_btn: "Log now",
      twin_title: "Home Energy Map", twin_tag: "digital twin",
      twin_lead: "Each tile is an appliance: size shows monthly use, colour shows efficiency. A red border means it uses more than a typical efficient model.",
      twin_empty: "Add appliances — your home energy map will appear here.", twin_share: "share",
      sens_label: "Sensitivity:", sens_careful: "Careful — fewer false alarms", sens_balanced: "Balanced (recommended)", sens_sensitive: "Sensitive — miss nothing",
      sens_stat: "In testing: precision {p}%, recall {r}%, false alarms {f}%",
      diag_title: "Meter Diagnosis", diag_tag: "fault · tampering · trend",
      diag_lead: "The likely cause based on the shape of the anomalies: meter fault, unauthorized tampering, appliance problem or gradual change. This is a probability — confirmation needs a professional check.",
      diag_none: "No suspicious pattern found in your meter history ✅", diag_need: "Diagnosis needs at least 4 monthly readings.",
      diag_months: "Months", diag_action: "What to do",
      sev_critical: "Critical", sev_high: "High", sev_medium: "Medium", sev_low: "Low",
      diag_meter_zero: "Meter fault (zero reading)",
      diag_meter_zero_x: "The reading was normal, then dropped to exactly zero. This usually means the meter or its communication failed, not tampering — a bypassed meter usually still shows a reduced, non-zero reading.",
      diag_meter_zero_a: "Call the Azerishig call centre (199) and ask for a meter check. Otherwise a large back-billing may follow.",
      diag_suspicious_drop: "Suspicious sustained drop",
      diag_suspicious_drop_x: "Usage dropped sharply and stayed low, and the season doesn't explain it. It may be time away from home; if not, it may be a meter under-counting or an unauthorized connection (bypass).",
      diag_suspicious_drop_a: "If you were home, have the meter seal and connection inspected. A meter that under-counts creates a risk of fines or back-billing.",
      diag_sustained_rise: "Sustained rise — likely appliance fault",
      diag_sustained_rise_x: "Usage is well above expected for consecutive months. Most common causes: water-heater thermostat, fridge compressor/door seal, an electric heater, or insulation problems.",
      diag_sustained_rise_a: "Check the biggest consumers in the Appliances tab; switch everything off at night and see whether the meter still moves.",
      diag_spike: "Single unusual spike",
      diag_spike_x: "Usage jumped well above baseline for one month, then returned to normal: guests, a new appliance, a heat/cold wave or a reading error.",
      diag_spike_a: "Compare that month's bill with the actual meter reading; if unexplained, ask for a re-reading.",
      diag_gradual_rise: "Gradual upward trend",
      diag_gradual_rise_x: "Usage is creeping up month by month ({t}%/mo, season-adjusted). Barely visible in one month, but significant over a year.",
      diag_gradual_rise_a: "Check newly bought appliances and an ageing fridge/AC — see the investment plan in the Plan tab.",
      diag_gradual_decline: "Gradual downward trend",
      diag_gradual_decline_x: "Usage is declining month by month ({t}%/mo). Most often this is your savings working 👏; rarely a developing meter/connection fault.",
      diag_gradual_decline_a: "If you know you've been saving — great! Otherwise compare the meter reading with your bill.",
      heat_title: "Usage Heatmap", heat_tag: "month × year", heat_none: "no data", heat_empty: "Add monthly entries in My Meters to see the heatmap.",
      ach_title: "Achievements & Monthly Challenge", ach_count: "{n}/{t} earned",
      ch_title: "🎯 {m} challenge", ch_text: "Target: ≤ {target} kWh (≈ {cost} ₼) — 10% below last month's season-adjusted level.",
      ch_done: "✅ Challenge complete: {cur} kWh!", ch_fail: "This month {cur} kWh — {d} kWh over target. Try again next month!",
      ch_pending: "At month-end add this month's reading in My Meters.", ch_none: "The challenge needs at least one past monthly entry.",
      b_first: "First step", b_first_d: "First meter entry",
      b_streak3: "3-month streak", b_streak3_d: "3 consecutive months logged",
      b_streak12: "Full year", b_streak12_d: "12 consecutive months logged",
      b_low_tier: "Low tier", b_low_tier_d: "Last month ≤ 200 kWh",
      b_saver: "Saver", b_saver_d: "10% below last month (season-adjusted)",
      b_planner: "Planner", b_planner_d: "Monthly budget set",
      b_auditor: "Appliance auditor", b_auditor_d: "5+ appliances analysed",
      b_healthy: "Healthy home", b_healthy_d: "Health score ≥ 85",
      gas_title: "Natural Gas Calculator",
      gas_lead: "Gas is tiered by ANNUAL volume: once usage since the start of the year passes 1200 m³, every cubic metre costs more. Winter heating makes usage jump.",
      gas_month_label: "This month's use (m³)", gas_prior_label: "Earlier this year (m³)", gas_month_sel: "Month",
      gas_cost: "This month's cost", gas_cum: "Year to date", gas_co2: "kg CO₂ (this month)",
      gas_t1: "12.5 qapik/m³", gas_t2: "20 qapik/m³", gas_t3: "25 qapik/m³", gas_part: "{m} m³ × {r} qapik",
      gasfc_title: "Forecast to Year-End", gasfc_tag: "heating-season model",
      gasfc_text: "At this pace you'll reach {cum} m³ by year-end; the remaining months cost ≈ {cost} ₼.",
      gasfc_cross: " ⚠️ You'll pass 1200 m³ in {m} — after that each m³ costs 20 qapik.",
      gasfc_cross2: " And 2500 m³ in {m} (25 qapik).",
      gasfc_typical: " Typical year: ~{y} m³ ≈ {c} ₼, ~{co2} kg CO₂.",
      chart_gas_m3: "m³/month", chart_gas_cum: "Year to date",
      leak_title: "Leak Test", leak_tag: "with 2 readings",
      leak_lead: "In the evening switch off all gas appliances (stove, boiler, cooker, water heater) and note the meter reading. In the morning, before using anything, note it again. If the meter moved, there may be a leak.",
      leak_start: "Evening reading (m³)", leak_end: "Morning reading (m³)", leak_hours: "Hours elapsed", leak_btn: "Check",
      leak_ok: "✅ The meter didn't move — no sign of a leak.",
      leak_bad: "⚠️ {d} m³ passed with nothing running (≈ {mo} m³/month). A leak is possible: check for a gas smell, test joints with soapy water and call the 104 gas emergency service.",
      leak_invalid: "The morning reading can't be lower than the evening one — check the numbers.",
      gsafe_title: "Carbon Monoxide & Gas Safety",
      gsafe: [
        "If you smell gas: don't touch light switches, no open flames, open the windows, close the valve, leave the building and call 104.",
        "Carbon monoxide (CO) is odourless and colourless — install a CO detector in bedrooms and rooms with a stove.",
        "Headache, nausea or drowsiness — get to fresh air immediately and call 103.",
        "Don't sleep with a gas stove or heater left on; never heat a room with the cooker.",
        "Have the chimney and ventilation checked before every heating season; service the boiler yearly.",
        "Check hoses and joints only with soapy water — never with an open flame.",
      ],
      ready_title: "Outage Preparedness",
      ready_lead: "Which devices must keep running during a power cut? Pick them — we'll work out how many Wh of backup, which powerbank or backup source you need.",
      out_title: "Backup Power Planner", out_tag: "critical devices", out_hours: "Outage duration", out_h: "h",
      out_router: "Wi-Fi router", out_phone: "Phone charging", out_led: "LED light", out_laptop: "Laptop", out_fridge: "Fridge",
      out_kombi: "Gas boiler (pump/controls)", out_cpap: "Medical device (CPAP)", out_tv: "TV",
      out_count: "qty",
      out_load: "Average load", out_energy: "Energy needed", out_cap: "Recommended backup capacity", out_inv: "Inverter power (min.)",
      out_pb: "≈ {n} × 10,000 mAh powerbanks would be enough.",
      out_station: "Too much for powerbanks — you need a portable power station (≥ {wh} Wh) or a UPS.",
      out_kombi_note: "💡 A gas boiler won't run without electricity (pump and controls) — in winter an outage also cuts your heating.",
      out_gen_note: "⚠️ Never run a petrol generator indoors, on a balcony or near a window — carbon monoxide poisoning risk.",
      out_none: "Select at least one device.",
      food_title: "Fridge Food Safety",
      food_ok: "✅ {h}-hour outage: food in a closed fridge stays safe (up to ≈ 4 hours).",
      food_warn: "⚠️ {h}-hour outage: perishable fridge food (meat, dairy, leftovers) becomes risky after 4 hours. A full closed freezer holds ≈ 48 h, half-full ≈ 24 h.",
      food_bad: "❌ {h} hours is too long: even a full freezer holds only ≈ 48 h. Check with a thermometer — discard food kept above 4°C for over 2 hours.",
      food_src: "Source: USDA food safety guidance.",
      sos_title: "Emergency Contacts", sos_note: "Numbers are for general information — verify on official websites.",
      sos_112: "Unified emergency", sos_101: "Fire service", sos_103: "Ambulance", sos_104: "Gas emergency", sos_199: "Azerishig call centre",
      val_title: "Method Validation", val_tag: "transparency",
      val_lead: "The anomaly detector was tested on {homes} synthetic households × {months} months; known anomalies (spike, sustained rise, drop, zero) were injected into {anom} homes.",
      val_note: "Open meter-level Azerbaijani consumption data does not exist, so this is NOT real data — it is a synthetic scenario calibrated to Baku's climate rhythm. Your browser runs this test live, right now.",
      val_z: "z threshold", val_p: "Precision", val_r: "Recall", val_f: "False alarms", val_types: "By type (spike / rise / drop / zero)",
      val_level: { 2.5: "Sensitive", 3.5: "Balanced", 4.5: "Careful" },
    },
    ru: {
      tab_gas: "Газ", tab_ready: "Готовность", share_btn: "🔗 Поделиться",
      share_text: "В этом месяце я потребляю {kwh} кВт·ч — около {cost} ₼ ({tier}). Рассчитайте свои расходы в EnergyX Az:",
      share_copied: "Ссылка скопирована.",
      reminder: "📅 Вы ещё не записали показания счётчика за {m}. Ежемесячные записи делают обнаружение аномалий и прогноз точнее.",
      reminder_btn: "Записать",
      twin_title: "Энергокарта дома", twin_tag: "цифровой двойник",
      twin_lead: "Каждая плитка — прибор: размер показывает потребление, цвет — эффективность. Красная рамка — прибор потребляет больше типичной эффективной модели.",
      twin_empty: "Добавьте приборы — здесь появится энергокарта дома.", twin_share: "доля",
      sens_label: "Чувствительность:", sens_careful: "Осторожно — меньше ложных тревог", sens_balanced: "Сбалансировано (рекомендуется)", sens_sensitive: "Чувствительно — ничего не пропустить",
      sens_stat: "В тесте: точность {p}%, обнаружение {r}%, ложные тревоги {f}%",
      diag_title: "Диагностика счётчика", diag_tag: "неисправность · вмешательство · тренд",
      diag_lead: "Вероятная причина по форме аномалий: неисправность счётчика, несанкционированное вмешательство, проблема прибора или постепенное изменение. Это вероятность — для подтверждения нужна проверка специалиста.",
      diag_none: "Подозрительных паттернов не найдено ✅", diag_need: "Для диагностики нужно минимум 4 месячных показания.",
      diag_months: "Месяцы", diag_action: "Что делать",
      sev_critical: "Критично", sev_high: "Высокий", sev_medium: "Средний", sev_low: "Низкий",
      diag_meter_zero: "Неисправность счётчика (нулевые показания)",
      diag_meter_zero_x: "Показания были нормальными, затем упали точно до нуля. Обычно это неисправность счётчика или связи, а не вмешательство — обойдённый счётчик чаще показывает уменьшенное, но не нулевое значение.",
      diag_meter_zero_a: "Позвоните в колл-центр Azərişıq (199) и попросите проверить счётчик. Иначе позже возможен крупный перерасчёт.",
      diag_suspicious_drop: "Подозрительное устойчивое снижение",
      diag_suspicious_drop_x: "Потребление резко упало и осталось низким, а сезон этого не объясняет. Возможно, вы отсутствовали; если нет — счётчик может недосчитывать или есть несанкционированное подключение.",
      diag_suspicious_drop_a: "Если вы были дома, проверьте пломбу и подключение счётчика. Недосчитывающий счётчик создаёт риск штрафа или перерасчёта.",
      diag_sustained_rise: "Устойчивый рост — вероятная неисправность прибора",
      diag_sustained_rise_x: "Несколько месяцев подряд потребление заметно выше ожидаемого. Частые причины: термостат водонагревателя, компрессор/уплотнитель холодильника, электрообогреватель или утепление.",
      diag_sustained_rise_a: "Проверьте самых прожорливых во вкладке «Приборы»; ночью выключите всё и посмотрите, крутится ли счётчик.",
      diag_spike: "Разовый необычный пик",
      diag_spike_x: "Один месяц потребление было заметно выше базы, затем вернулось к норме: гости, новый прибор, жара/холод или ошибка показаний.",
      diag_spike_a: "Сверьте счёт за тот месяц с реальными показаниями; если причина неясна — запросите повторное снятие.",
      diag_gradual_rise: "Постепенный рост",
      diag_gradual_rise_x: "Потребление растёт месяц за месяцем ({t}%/мес с учётом сезона). Почти незаметно за месяц, но существенно за год.",
      diag_gradual_rise_a: "Проверьте новые и старые приборы (холодильник/кондиционер) — см. план инвестиций во вкладке «План».",
      diag_gradual_decline: "Постепенное снижение",
      diag_gradual_decline_x: "Потребление снижается месяц за месяцем ({t}%/мес). Чаще всего это результат экономии 👏; редко — развивающаяся неисправность счётчика.",
      diag_gradual_decline_a: "Если вы экономите — отлично! Иначе сверьте показания счётчика со счётом.",
      heat_title: "Тепловая карта потребления", heat_tag: "месяц × год", heat_none: "нет данных", heat_empty: "Добавьте месячные записи в «Мои счётчики».",
      ach_title: "Достижения и вызов месяца", ach_count: "{n}/{t} получено",
      ch_title: "🎯 Вызов: {m}", ch_text: "Цель: ≤ {target} кВт·ч (≈ {cost} ₼) — на 10% ниже сезонно скорректированного уровня прошлого месяца.",
      ch_done: "✅ Вызов выполнен: {cur} кВт·ч!", ch_fail: "В этом месяце {cur} кВт·ч — на {d} больше цели. Попробуйте в следующем месяце!",
      ch_pending: "В конце месяца добавьте показания в «Мои счётчики».", ch_none: "Для вызова нужна хотя бы одна прошлая запись.",
      b_first: "Первый шаг", b_first_d: "Первая запись счётчика",
      b_streak3: "3 месяца подряд", b_streak3_d: "3 месяца без пропусков",
      b_streak12: "Целый год", b_streak12_d: "12 месяцев без пропусков",
      b_low_tier: "Низкий тариф", b_low_tier_d: "Последний месяц ≤ 200 кВт·ч",
      b_saver: "Экономный", b_saver_d: "На 10% меньше прошлого месяца (с учётом сезона)",
      b_planner: "Планировщик", b_planner_d: "Задан месячный бюджет",
      b_auditor: "Аудитор приборов", b_auditor_d: "Проанализировано 5+ приборов",
      b_healthy: "Здоровый дом", b_healthy_d: "Индекс здоровья ≥ 85",
      gas_title: "Калькулятор природного газа",
      gas_lead: "Тариф на газ зависит от ГОДОВОГО объёма: после 1200 м³ с начала года каждый кубометр дороже. Зимой из-за отопления потребление резко растёт.",
      gas_month_label: "Потребление в этом месяце (м³)", gas_prior_label: "Ранее в этом году (м³)", gas_month_sel: "Месяц",
      gas_cost: "Стоимость за месяц", gas_cum: "С начала года", gas_co2: "кг CO₂ (за месяц)",
      gas_t1: "12.5 гяпик/м³", gas_t2: "20 гяпик/м³", gas_t3: "25 гяпик/м³", gas_part: "{m} м³ × {r} гяп",
      gasfc_title: "Прогноз до конца года", gasfc_tag: "модель отопительного сезона",
      gasfc_text: "При таком темпе к концу года наберётся {cum} м³; оставшиеся месяцы ≈ {cost} ₼.",
      gasfc_cross: " ⚠️ Порог 1200 м³ будет пройден в месяце «{m}» — дальше каждый м³ стоит 20 гяпик.",
      gasfc_cross2: " Порог 2500 м³ — в месяце «{m}» (25 гяпик).",
      gasfc_typical: " Типичный год: ~{y} м³ ≈ {c} ₼, ~{co2} кг CO₂.",
      chart_gas_m3: "м³/мес", chart_gas_cum: "С начала года",
      leak_title: "Тест на утечку", leak_tag: "по 2 показаниям",
      leak_lead: "Вечером выключите все газовые приборы (печь, котёл, плиту, водонагреватель) и запишите показания. Утром, ничего не включая, запишите снова. Если счётчик сдвинулся — возможна утечка.",
      leak_start: "Вечерние показания (м³)", leak_end: "Утренние показания (м³)", leak_hours: "Прошло часов", leak_btn: "Проверить",
      leak_ok: "✅ Счётчик не сдвинулся — признаков утечки нет.",
      leak_bad: "⚠️ Без работающих приборов прошло {d} м³ (≈ {mo} м³/мес). Возможна утечка: проверьте запах, проверьте соединения мыльной пеной и позвоните в аварийную газовую службу 104.",
      leak_invalid: "Утренние показания не могут быть меньше вечерних — проверьте цифры.",
      gsafe_title: "Угарный газ и газовая безопасность",
      gsafe: [
        "Если пахнет газом: не трогайте выключатели, не зажигайте огонь, откройте окна, перекройте вентиль, выйдите и позвоните 104.",
        "Угарный газ (CO) без запаха и цвета — установите датчик CO в спальне и в комнате с печью.",
        "Головная боль, тошнота, сонливость — немедленно на свежий воздух и звоните 103.",
        "Не спите с включённой газовой печью; не обогревайте комнату газовой плитой.",
        "Проверяйте дымоход и вентиляцию перед каждым отопительным сезоном; ежегодно обслуживайте котёл.",
        "Проверяйте шланги и соединения только мыльной пеной — никогда открытым огнём.",
      ],
      ready_title: "Готовность к отключениям",
      ready_lead: "Какие приборы должны работать при отключении света? Выберите — рассчитаем, сколько Вт·ч резерва и какой powerbank или источник нужен.",
      out_title: "Планировщик резервного питания", out_tag: "критичные приборы", out_hours: "Длительность отключения", out_h: "ч",
      out_router: "Wi-Fi роутер", out_phone: "Зарядка телефона", out_led: "LED лампа", out_laptop: "Ноутбук", out_fridge: "Холодильник",
      out_kombi: "Газовый котёл (насос/управление)", out_cpap: "Медприбор (CPAP)", out_tv: "Телевизор",
      out_count: "шт",
      out_load: "Средняя нагрузка", out_energy: "Нужно энергии", out_cap: "Рекомендуемая ёмкость резерва", out_inv: "Мощность инвертора (мин.)",
      out_pb: "≈ {n} powerbank по 10 000 мА·ч будет достаточно.",
      out_station: "Для powerbank это слишком много — нужна портативная электростанция (≥ {wh} Вт·ч) или ИБП.",
      out_kombi_note: "💡 Газовый котёл не работает без электричества (насос и управление) — зимой отключение света отключит и отопление.",
      out_gen_note: "⚠️ Никогда не запускайте бензиновый генератор в помещении, на балконе или у окна — риск отравления угарным газом.",
      out_none: "Выберите хотя бы один прибор.",
      food_title: "Безопасность продуктов в холодильнике",
      food_ok: "✅ Отключение на {h} ч: в закрытом холодильнике продукты безопасны (≈ до 4 часов).",
      food_warn: "⚠️ Отключение на {h} ч: скоропортящиеся продукты (мясо, молочное, готовая еда) становятся опасными через 4 часа. Полная закрытая морозилка держит ≈ 48 ч, наполовину полная ≈ 24 ч.",
      food_bad: "❌ {h} ч — слишком долго: даже полная морозилка держит ≈ 48 ч. Проверьте термометром — выбросьте продукты, бывшие выше 4°C более 2 часов.",
      food_src: "Источник: рекомендации USDA по безопасности пищевых продуктов.",
      sos_title: "Экстренные контакты", sos_note: "Номера приведены для общей информации — проверьте на официальных сайтах.",
      sos_112: "Единая экстренная служба", sos_101: "Пожарная служба", sos_103: "Скорая помощь", sos_104: "Аварийная газовая служба", sos_199: "Колл-центр Azərişıq",
      val_title: "Проверка метода", val_tag: "прозрачность",
      val_lead: "Детектор аномалий протестирован на {homes} синтетических домохозяйствах × {months} мес.; в {anom} домов добавлены известные аномалии (пик, рост, снижение, ноль).",
      val_note: "Открытых поквартирных данных потребления в Азербайджане нет, поэтому это НЕ реальные данные — это синтетический сценарий, откалиброванный по климату Баку. Тест выполняется вашим браузером прямо сейчас.",
      val_z: "Порог z", val_p: "Точность", val_r: "Обнаружение", val_f: "Ложные тревоги", val_types: "По типам (пик / рост / снижение / ноль)",
      val_level: { 2.5: "Чувствительно", 3.5: "Сбалансировано", 4.5: "Осторожно" },
    },
  };
  Object.keys(XT).forEach((l) => Object.assign(translations[l], XT[l]));

  function monthName(idx) {
    return P.monthLabel(E.monthKey(2026, idx), true).replace(/\s*\d{4}$/, "");
  }
  const currentMonthKey = () => { const n = new Date(); return E.monthKey(n.getFullYear(), n.getMonth()); };

  // ===== HƏSSASLIQ + DOĞRULAMA (GridPulse ThresholdExplorer + RealDataValidation) =====
  let validation = null;
  function getValidation() {
    if (!validation) validation = E.validateDetector({ thresholds: [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0] });
    return validation;
  }
  const pct = (x) => Math.round(x * 100);
  function renderSensitivity(state) {
    const sel = $("sensSelect");
    if (sel.value !== state.sensKey) sel.value = state.sensKey;
    const row = getValidation().sweep.find((r) => r.z === state.sensitivity.anomaly);
    $("sensStat").textContent = row ? fmt(T().sens_stat, { p: pct(row.precision), r: pct(row.recall), f: row.falseAlarmRatePct }) : "";
  }
  function renderValidation() {
    const t = T(), v = getValidation();
    $("valLead").textContent = fmt(t.val_lead, { homes: v.homes, months: v.months, anom: v.anomalous });
    const types = ["spike", "sustained_rise", "drop", "zero"];
    const levels = t.val_level;
    $("valTable").innerHTML = `<thead><tr><th>${esc(t.val_z)}</th><th>${esc(t.val_p)}</th><th>${esc(t.val_r)}</th><th>${esc(t.val_f)}</th><th>${esc(t.val_types)}</th></tr></thead>
      <tbody>${v.sweep.map((r) => `<tr class="${levels[r.z] ? "top" : ""}">
        <td>${r.z.toFixed(1)}${levels[r.z] ? ` <span class="tl-badge ok">${esc(levels[r.z])}</span>` : ""}</td>
        <td>${pct(r.precision)}%</td><td>${pct(r.recall)}%</td><td>${r.falseAlarmRatePct}%</td>
        <td>${types.map((k) => (r.byType[k] == null ? "—" : pct(r.byType[k]) + "%")).join(" / ")}</td></tr>`).join("")}</tbody>`;
  }

  // ===== SAYĞAC DİAQNOZU =====
  function renderDiagnosis(state) {
    const t = T();
    if (E.normalizeSeries(state.readings).length < 4) { $("diagList").innerHTML = `<div class="pace-empty">${esc(t.diag_need)}</div>`; return; }
    const list = E.diagnoseMeter(state.readings, state.sensitivity);
    $("diagList").innerHTML = list.length ? list.map((f) => {
      const tr = f.trend != null ? Math.abs(f.trend).toFixed(1) : "";
      return `<div class="diag-item sev-${f.severity}">
        <div class="tl-head"><b>${esc(t["diag_" + f.type])}</b><span class="sev-badge sev-${f.severity}">${esc(t["sev_" + f.severity])}</span></div>
        <div class="tl-cause">${esc(fmt(t["diag_" + f.type + "_x"], { t: tr }))}</div>
        <div class="diag-action"><b>${esc(t.diag_action)}:</b> ${esc(t["diag_" + f.type + "_a"])}</div>
        <div class="diag-months">${esc(t.diag_months)}: ${f.months.map((m) => esc(P.monthLabel(m))).join(", ")}</div>
      </div>`;
    }).join("") : `<div class="factor-ok">${esc(t.diag_none)}</div>`;
  }

  // ===== İSTİLİK XƏRİTƏSİ (PanoPulse RiskHeatmap) =====
  function renderHeatmap(state) {
    const t = T();
    const series = E.normalizeSeries(state.readings);
    if (!series.length) { $("heatmap").innerHTML = `<div class="pace-empty">${esc(t.heat_empty)}</div>`; return; }
    const flagged = {};
    state.anomalies.forEach((p) => { if (p.level !== "none") flagged[p.month] = p.level; });
    const byKey = Object.fromEntries(series.map((p) => [p.month, p.kwh]));
    const years = [...new Set(series.map((p) => +p.month.slice(0, 4)))].sort();
    let html = `<div class="hm-row hm-head"><span></span>${Array.from({ length: 12 }, (_, i) => `<span>${esc(P.shortMonth(monthName(i)))}</span>`).join("")}</div>`;
    years.forEach((y) => {
      html += `<div class="hm-row"><span class="hm-year">${y}</span>`;
      for (let m = 0; m < 12; m++) {
        const key = E.monthKey(y, m), v = byKey[key];
        if (v == null) { html += `<span class="hm-cell none"></span>`; continue; }
        const tier = E.calcTariff(v).tier;
        html += `<span class="hm-cell ${tier}${flagged[key] ? " flag-" + flagged[key] : ""}" title="${esc(P.monthLabel(key, true))}: ${v} kWh">${v}</span>`;
      }
      html += `</div>`;
    });
    $("heatmap").innerHTML = html;
  }

  // ===== NAİLİYYƏTLƏR + AYLIQ ÇAĞIRIŞ =====
  const BADGE_ICON = { first: "🌱", streak3: "📅", streak12: "🏆", low_tier: "💚", saver: "💰", planner: "🧭", auditor: "🔍", healthy: "🌿" };
  function renderAchievements(state) {
    const t = T();
    const list = E.badges({ readings: state.readings, budget: state.budget, appliances, health: state.health });
    $("achCount").textContent = fmt(t.ach_count, { n: list.filter((b) => b.earned).length, t: list.length });
    $("badgeGrid").innerHTML = list.map((b) => `<div class="badge ${b.earned ? "earned" : ""}" title="${esc(t["b_" + b.key + "_d"])}">
      <div class="badge-icon">${BADGE_ICON[b.key]}</div>
      <div class="badge-name">${esc(t["b_" + b.key])}</div>
      <div class="badge-desc">${esc(t["b_" + b.key + "_d"])}</div>
      <div class="factor-bar"><div style="width:${Math.round(b.progress * 100)}%; background:var(--low)"></div></div>
    </div>`).join("");
    const ch = E.monthlyChallenge(state.readings, new Date());
    if (!ch) { $("challengeBox").innerHTML = `<div class="pace-empty">${esc(t.ch_none)}</div>`; return; }
    let status;
    if (ch.current == null) status = `<div class="pace-empty">${esc(t.ch_pending)}</div>`;
    else if (ch.done) status = `<div class="pace-alert ok">${esc(fmt(t.ch_done, { cur: ch.current }))}</div>`;
    else status = `<div class="pace-alert bad">${esc(fmt(t.ch_fail, { cur: ch.current, d: ch.current - ch.target }))}</div>`;
    $("challengeBox").innerHTML = `<div class="ch-title">${esc(fmt(t.ch_title, { m: P.monthLabel(ch.month, true) }))}</div>
      <div class="tl-detail">${esc(fmt(t.ch_text, { target: ch.target, cost: ch.targetCost.toFixed(2) }))}</div>${status}`;
  }

  // ===== EVİN ENERJİ XƏRİTƏSİ (PanoPulse DigitalTwin) =====
  const CAT_COLOR = { ac: "#2F8FFF", lighting: "#E8D44D", washer: "#B084F0", fridge: "#4DD9E8", water_heater: "#E8544D",
    heater: "#F07B3F", tv: "#9AE85C", computer: "#F06BA8", microwave: "#E8A33D", kettle: "#C77DFF", other: "#7C9088" };
  const CAT_ICON = { ac: "❄️", lighting: "💡", washer: "👕", fridge: "🧊", water_heater: "🚿", heater: "🔥", tv: "📺",
    computer: "💻", microwave: "🍲", kettle: "☕", other: "🔌" };
  function renderTwin(state) {
    const t = T();
    if (!appliances.length) { $("twinMap").innerHTML = `<div class="pace-empty">${esc(t.twin_empty)}</div>`; return; }
    const total = appliances.reduce((s, a) => s + a.monthlyKwh, 0) || 1;
    const rate = E.marginalRate(state.kwh);
    const sorted = appliances.map((a, i) => ({ ...a, i })).sort((a, b) => b.monthlyKwh - a.monthlyKwh);
    $("twinMap").innerHTML = sorted.map((a) => {
      const cat = E.classify(a.name);
      const share = (a.monthlyKwh / total) * 100;
      const ineff = a.typicalWatts && a.watts > a.typicalWatts * 1.2;
      return `<div class="twin-tile${ineff ? " ineff" : ""}" style="flex-grow:${Math.max(1, Math.round(share))}; flex-basis:${Math.max(90, share * 6)}px; --c:${CAT_COLOR[cat]}">
        <div class="twin-icon">${CAT_ICON[cat]}</div>
        <div class="twin-name">${esc(a.name)}</div>
        <div class="twin-val">${a.monthlyKwh.toFixed(0)} kVt · ${(a.monthlyKwh * rate).toFixed(2)} ₼</div>
        <div class="twin-share">${share.toFixed(0)}% ${esc(t.twin_share)}</div>
      </div>`;
    }).join("");
  }

  // ===== QAZ =====
  let gasChart = null;
  function gasState() {
    const n = new Date();
    return Object.assign({ m3: 120, prior: 0, month: n.getMonth() }, P.load("energyx_gas", {}));
  }
  function renderGas(draw) {
    const t = T(), g = gasState();
    const sel = $("gasMonth");
    sel.innerHTML = Array.from({ length: 12 }, (_, i) => `<option value="${i}">${esc(monthName(i))}</option>`).join("");
    sel.value = g.month;
    if (document.activeElement !== $("gasSlider")) $("gasSlider").value = g.m3;
    if (document.activeElement !== $("gasPrior")) $("gasPrior").value = g.prior;
    $("gasVal").textContent = g.m3 + " m³";
    const c = E.gasCost(g.m3, g.prior);
    $("gasCost").textContent = c.cost.toFixed(2) + " ₼";
    $("gasCost").className = "kpi-val " + c.tier;
    $("gasCum").textContent = Math.round(c.cumulative) + " m³";
    $("gasCo2").textContent = Math.round(g.m3 * E.GAS_CO2_KG_PER_M3);
    $("gasParts").innerHTML = c.parts.map((p) => `<span class="chip"><span class="tier-dot ${["low", "mid", "high"][p.tier]}"></span>${esc(fmt(t.gas_part, { m: p.m3, r: (p.rate * 100).toFixed(1).replace(".0", "") }))}</span>`).join("");

    const f = E.gasForecast(g.m3, g.month, g.prior);
    let txt = fmt(t.gasfc_text, { cum: f.yearEndCumulative, cost: f.restOfYearCost.toFixed(2) });
    if (f.cross1200 != null) txt += fmt(t.gasfc_cross, { m: monthName(f.cross1200) });
    if (f.cross2500 != null) txt += fmt(t.gasfc_cross2, { m: monthName(f.cross2500) });
    txt += fmt(t.gasfc_typical, { y: f.typicalYearM3, c: f.typicalYearCost.toFixed(0), co2: f.co2Kg });
    $("gasFcText").textContent = txt;

    $("gasSafety").innerHTML = t.gsafe.map((s) => `<li>${esc(s)}</li>`).join("");
    if (!draw || typeof Chart === "undefined") return;
    const col = { low: P.cssVar("--low"), mid: P.cssVar("--mid"), high: P.cssVar("--high") };
    // Keçmiş aylar: "bu il əvvəlki aylarda" həcmi mövsümi çəkilərə görə paylanır (təxmini, solğun göstərilir)
    const pastW = E.GAS_SEASON.slice(0, g.month), pastSum = pastW.reduce((a, b) => a + b, 0) || 1;
    const past = pastW.map((w, i) => ({ monthIdx: i, m3: Math.round((g.prior * w) / pastSum), past: true }));
    let run = 0;
    past.forEach((m) => { run += m.m3; m.cumulative = run; m.tier = E.gasCost(0, run).tier; });
    const all = [...past, ...f.months];
    const data = {
      labels: all.map((m) => P.shortMonth(monthName(m.monthIdx))),
      datasets: [
        { type: "bar", label: t.chart_gas_m3, data: all.map((m) => m.m3), backgroundColor: all.map((m) => col[m.tier] + (m.past ? "66" : "")),
          borderRadius: 4, yAxisID: "y", order: 2 },
        { type: "line", label: t.chart_gas_cum, data: all.map((m) => m.cumulative), borderColor: "#9fb3c8", pointRadius: 2, borderWidth: 2, yAxisID: "y2", order: 1 },
      ],
    };
    const opts = P.chartBase();
    opts.scales.y2 = { position: "right", beginAtZero: true, ticks: { color: P.cssVar("--text-lo") }, grid: { drawOnChartArea: false } };
    if (gasChart) { gasChart.data = data; gasChart.options = opts; gasChart.update(); }
    else gasChart = new Chart($("gasChart"), { type: "bar", data, options: opts });
  }
  function saveGas() {
    const g = gasState();
    g.m3 = Math.max(0, Math.min(5000, parseInt($("gasSlider").value, 10) || 0));
    g.prior = Math.max(0, Math.min(20000, parseFloat($("gasPrior").value) || 0));
    g.month = Math.max(0, Math.min(11, parseInt($("gasMonth").value, 10) || 0));
    P.store("energyx_gas", g);
    renderGas(activeTab === "gas");
  }
  function runLeakTest() {
    const t = T();
    const r = E.gasLeakTest($("leakStart").value, $("leakEnd").value, $("leakHours").value);
    if ($("leakStart").value === "" || $("leakEnd").value === "") return;
    $("leakResult").innerHTML = r.status === "invalid" ? `<div class="pace-alert bad">${esc(t.leak_invalid)}</div>`
      : r.status === "ok" ? `<div class="pace-alert ok">${esc(t.leak_ok)}</div>`
      : `<div class="pace-alert bad">${esc(fmt(t.leak_bad, { d: r.deltaM3, mo: r.perMonthM3 }))}</div>`;
  }

  // ===== KƏSİNTİYƏ HAZIRLIQ =====
  const OUT_DEVICES = [
    { key: "router", watts: 12, duty: 1, count: 1, on: true },
    { key: "phone", watts: 10, duty: 0.5, count: 2, on: true },
    { key: "led", watts: 9, duty: 1, count: 2, on: true },
    { key: "laptop", watts: 60, duty: 0.6, count: 1, on: false },
    { key: "fridge", watts: 150, duty: 0.4, count: 1, on: false },
    { key: "kombi", watts: 100, duty: 0.8, count: 1, on: false },
    { key: "cpap", watts: 40, duty: 1, count: 1, on: false },
    { key: "tv", watts: 100, duty: 1, count: 1, on: false },
  ];
  function outageState() {
    const saved = P.load("energyx_outage", null);
    const devs = OUT_DEVICES.map((d) => {
      const s = saved && saved.devices && saved.devices[d.key];
      return s ? { ...d, on: !!s.on, count: Math.max(1, Math.min(20, +s.count || 1)) } : { ...d };
    });
    return { devices: devs, hours: saved ? Math.max(1, Math.min(24, +saved.hours || 6)) : 6 };
  }
  function renderOutage() {
    const t = T(), st = outageState();
    const box = $("outDevices");
    if (!box.dataset.built || box.dataset.lang !== currentLang) {
      box.innerHTML = st.devices.map((d) => `<label class="out-dev">
        <input type="checkbox" data-k="${d.key}" ${d.on ? "checked" : ""}>
        <span class="out-name">${esc(t["out_" + d.key])} <small>${d.watts}W${d.duty < 1 ? " · ~" + Math.round(d.duty * 100) + "%" : ""}</small></span>
        <input type="number" class="out-count" data-c="${d.key}" min="1" max="20" value="${d.count}" aria-label="${esc(t.out_count)}">
      </label>`).join("");
      box.dataset.built = "1"; box.dataset.lang = currentLang;
      box.querySelectorAll("input").forEach((i) => i.addEventListener("input", saveOutage));
    }
    $("outHours").value = st.hours;
    $("outHoursVal").textContent = st.hours + " " + t.out_h;
    const chosen = st.devices.filter((d) => d.on);
    if (!chosen.length) { $("outResult").innerHTML = `<div class="pace-empty">${esc(t.out_none)}</div>`; }
    else {
      const r = E.outagePlan(chosen, st.hours);
      const small = r.wh <= 400;
      $("outResult").innerHTML = `<div class="kpi-grid four">
          <div class="kpi"><div class="kpi-val">${r.loadW} W</div><div class="kpi-label">${esc(t.out_load)}</div></div>
          <div class="kpi"><div class="kpi-val">${r.wh} Wh</div><div class="kpi-label">${esc(t.out_energy)}</div></div>
          <div class="kpi"><div class="kpi-val low">${r.capacityWh} Wh</div><div class="kpi-label">${esc(t.out_cap)}</div></div>
          <div class="kpi"><div class="kpi-val">${r.inverterW} W</div><div class="kpi-label">${esc(t.out_inv)}</div></div>
        </div>
        <div class="pace-alert ok">${esc(small ? fmt(t.out_pb, { n: r.powerbanks }) : fmt(t.out_station, { wh: r.capacityWh }))}</div>
        ${chosen.some((d) => d.key === "kombi") ? `<div class="hint-box">${esc(t.out_kombi_note)}</div>` : ""}
        <div class="hint-box warn">${esc(t.out_gen_note)}</div>`;
    }
    const h = st.hours;
    const food = h <= 4 ? t.food_ok : h <= 24 ? t.food_warn : t.food_bad;
    $("foodBox").innerHTML = `<div class="pace-alert ${h <= 4 ? "ok" : "bad"}">${esc(fmt(food, { h }))}</div><p class="pro-note">${esc(t.food_src)}</p>`;
    $("sosGrid").innerHTML = ["112", "101", "103", "104", "199"].map((n) =>
      `<a class="sos" href="tel:${n}"><span class="sos-num">${n}</span><span class="sos-label">${esc(t["sos_" + n])}</span></a>`).join("");
  }
  function saveOutage() {
    const devices = {};
    $("outDevices").querySelectorAll("input[data-k]").forEach((c) => {
      const k = c.dataset.k;
      devices[k] = { on: c.checked, count: +$("outDevices").querySelector(`input[data-c="${k}"]`).value || 1 };
    });
    P.store("energyx_outage", { devices, hours: +$("outHours").value || 6 });
    renderOutage();
  }

  // ===== XATIRLATMA (aylıq sayğac qeydi) =====
  function renderReminder() {
    const t = T(), banner = $("reminderBanner");
    const own = getMeters().filter((m) => !m.sample);
    const key = currentMonthKey();
    const missing = own.length > 0 && !own.some((m) => (m.month || "") === key);
    banner.hidden = !missing;
    if (!missing) return;
    banner.innerHTML = `<span>${esc(fmt(t.reminder, { m: P.monthLabel(key, true) }))}</span><button class="ghost-btn" type="button">${esc(t.reminder_btn)}</button>`;
    banner.querySelector("button").onclick = () => {
      $("meterMonth").value = key;
      $("meterName").value = own[own.length - 1].name;
      document.querySelector(".meters-section").scrollIntoView({ behavior: "smooth", block: "center" });
      $("meterName").focus();
    };
  }

  // ===== PAYLAŞMA + URL PARAMETRLƏRİ =====
  function shareUrl() {
    const u = new URL(location.href);
    u.search = ""; u.hash = "";
    u.searchParams.set("kwh", slider.value);
    if (currentLang !== "az") u.searchParams.set("lang", currentLang);
    return u.toString();
  }
  async function share() {
    const t = T(), kwh = +slider.value, c = E.calcTariff(kwh);
    const text = fmt(t.share_text, { kwh, cost: c.cost.toFixed(2), tier: t["tier_" + c.tier] });
    const url = shareUrl();
    try {
      if (navigator.share) { await navigator.share({ title: "EnergyX Az", text, url }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text + " " + url); P.toast(t.share_copied, "info"); }
    catch { prompt(t.share_copied, text + " " + url); }
  }
  function applyUrlParams() {
    const q = new URLSearchParams(location.search);
    const lang = q.get("lang");
    if (lang && translations[lang] && lang !== currentLang) setLang(lang);
    const kwh = parseInt(q.get("kwh"), 10);
    if (kwh >= 0 && kwh <= 600) { slider.value = kwh; updateCalc(); updateSim(); }
    const tab = q.get("tab");
    if (tab && document.getElementById("panel-" + tab)) switchTab(tab);
  }

  // ===== YENİLƏMƏ =====
  let activeTab = "calc";
  function refresh(state, tab) {
    activeTab = tab || activeTab;
    renderSensitivity(state);
    renderDiagnosis(state);
    renderHeatmap(state);
    renderAchievements(state);
    renderTwin(state);
    renderGas(activeTab === "gas");
    renderOutage();
    renderReminder();
    if (activeTab === "about") renderValidation();
  }

  // ===== HADİSƏLƏR =====
  $("sensSelect").addEventListener("change", () => { P.store("energyx_sens", $("sensSelect").value); P.refresh(); });
  ["gasSlider", "gasPrior", "gasMonth"].forEach((id) => $(id).addEventListener("input", saveGas));
  $("gasMonth").addEventListener("change", saveGas);
  $("outHours").addEventListener("input", saveOutage);

  window.EnergyExtras = { refresh, share, runLeakTest, validate: getValidation };
  applyTranslations(currentLang);
  applyUrlParams();
  P.refresh();
})();
