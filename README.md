# EnergyX Az — Açıq Enerji Kalkulyatoru

Azərbaycan Respublikasının Gənclər Fondu qrant dəstəyi ilə hazırlanmış, tam pulsuz, açıq mənbə enerji tarif kalkulyatoru.

## ✨ Funksiyalar

- **Kalkulyator** — real-vaxt tarif hesablama, rəng-kodlu pillə göstəricisi + dairəvi gauge
- **Növbəti Pilləyə Geri Sayma** — baha pilləyə neçə kVt qaldığını göstərir
- **CO₂ Ekoloji Təsir** — istifadənizin karbon izini hesablayır (rəsmi 719q/kVt əmsalı ilə)
- **Ay Sonu Proqnozu** — hazırkı templə davam etsəniz, ay sonunda nə qədər ödəyəcəyinizi (±15% aralıqla) göstərir
- **PDF Hesabat İxracı** — nəticənizi PDF kimi endirin (Azərbaycan hərfləri tam dəstəklənir)
- **Sayğaclarım** — bir neçə ev/obyekti saxlayıb, TARİXÇƏ və TENDENSİYA (bar-qrafik, faiz dəyişimi) ilə müqayisə edin
- **Simulyasiya** — istifadəni azaltsanız nə qədər qənaət edəcəyinizi göstərir
- **Ümumi Qənaət Xülasəsi** — tarif+CO2+cihaz qənaətlərini BİR yerdə birləşdirir
- **AI Enerji Məsləhətçisi** — Gemini-əsaslı, fərdi suallara cavab verir, rəy (👍/👎) sistemi ilə
- **Cihaz Analizi** — ev cihazlarınızı əlavə edib, doughnut-qrafiklə hansının ən çox enerji yediyini görün
- **Cihaz Effektivlik Xəbərdarlığı** — cihazınız tipik effektiv modeldən çox işlədirsə xəbərdarlıq edir
- **Uyğunsuzluq Aşkarlanması** — Kalkulyator və Cihazlar bölmələri arasında ziddiyyət olduqda xəbərdarlıq
- **İctimai Statistika** — alətin real, canlı istifadə göstəriciləri (şəffaflıq üçün)
- **Öyrən + FAQ** — 6 praktik məsləhət + 5 tez-tez verilən sual (akkordeon)
- **Haqqında** — layihənin şəffaflıq səhifəsi (qrant, metodologiya, mənbələr)
- **3 dil** — Azərbaycan, İngilis, Rus (seçim yadda qalır)
- Tam mobil uyğun, əlçatan (accessibility), açıq mənbə (MIT)

## 🚀 v2.0 — Yeni funksiyalar

Bu funksiyalar müəllifin əvvəlki iki layihəsindən (**GridPulse** — şəbəkə anomaliya aşkarlanması, **PanoPulse** — elektrik panosu erkən xəbərdarlıq sistemi) uyğunlaşdırılıb və fərdi istehlakçı üçün sadələşdirilib. Bütün hesablamalar **istifadəçinin öz cihazında** aparılır.

| # | Funksiya | Harada | Mənbə |
|---|----------|--------|-------|
| 1 | **Enerji Sağlamlıq Balı** (0–100, A–E) — tarif pilləsi, trend, anomaliyalar, effektivsiz cihazlar və büdcə aşımına görə; amillər **kök-səbəb faizi** ilə sıralanır | Analitika | PanoPulse Health Score + root-cause ranking |
| 2 | **Anomaliya Aşkarlayıcısı** — Bakı iqliminə görə mövsümi düzəliş + robust z-score (median/MAD) + davamlılıq filtri; səbəb təxmini (tək sıçrayış / davamlı artım / azalma) | Analitika | GridPulse pipeline |
| 3 | **Hadisə xronologiyası** — hər qeyri-adi ay üçün gözlənilən vs faktiki, z-score və izah | Analitika | PanoPulse Forensics Timeline |
| 4 | **12 aylıq mövsümi proqnoz** — Bakının aylıq temperatur normaları, **95% etibarlılıq intervalı**, illik xərc və ən baha ay | Analitika | GridPulse forecast |
| 5 | **İllik ekoloji iz (ESG)** — CO₂, ağac, avtomobil km ekvivalenti, **şəbəkə itkisi** (Dünya Bankı, 7.6%) | Analitika | PanoPulse ESG + GridPulse WDI |
| 6 | **Büdcə Mühafizəçisi** — ay içi oxunuşlara xətti reqressiya; 200/300 kVt həddinə və büdcəyə **hansı gün** çatacağınız, gündəlik təhlükəsiz limit | Planlaşdır | PanoPulse FailureCountdown |
| 7 | **"Əgər...?" simulyatoru** — kondisioner °C, LED, gözləmə rejimi, 30°C yuma, su qızdırıcı, ən böyük cihaz; pillə dəyişimi göstərilir | Planlaşdır | PanoPulse What-If |
| 8 | **Sərmayə geri ödəmə planı** — LED, inverter kondisioner, A+++ soyuducu, ağıllı rozetka; pilləli tarifə görə real qənaət, geri ödəmə müddəti, 5 illik xalis nəticə, **çəkili prioritet** | Planlaşdır | PanoPulse Financial Impact + Top Priority |
| 9 | **Təqdimat rejimi** (▶) — 7 addımlı avtomatik demo; istifadəçinin məlumatı əvvəl yadda saxlanılır, sonra tam bərpa olunur (Esc ilə dayandırılır) | Başlıq | PanoPulse Presentation Mode |
| 10 | **Ağıllı bildirişlər** — anomaliya, büdcə aşımı və baha pilləyə yaxınlaşma üçün toast | Hər yerdə | PanoPulse NotificationToast |
| 11 | **AI kontekst + oflayn köməkçi** — AI sağlamlıq balı, proqnoz, anomaliyalar və cihazları bilir; server əlçatmaz olanda qayda-əsaslı lokal köməkçi cavab verir | Kalkulyator | PanoPulse Co-Pilot |
| 12 | **Genişləndirilmiş PDF hesabat** — sağlamlıq, proqnoz, anomaliyalar, qənaət, sərmayə, ekoloji iz | Kalkulyator | PanoPulse reports |
| 13 | **Yedəkləmə** — bütün məlumatı JSON kimi ixrac/idxal (doğrulama ilə) | Sayğaclarım | GridPulse backup |
| 14 | **Hazır cihaz şablonları** (9 cihaz, bir kliklə) + cihazlar artıq yaddaşda qalır | Cihazlar | yeni |
| 15 | **PWA / oflayn iş** — telefona quraşdırıla bilir, internet olmadan da açılır | — | yeni |
| 16 | **Aylıq sayğac qeydləri** — hər qeyd üçün ay seçilir, eyni ay təkrar yazılmır | Sayğaclarım | yeni |

## 🔥 v2.1 — GridPulse və PanoPulse-dan əlavə ssenarilər

| # | Funksiya | Harada | Mənbə |
|---|----------|--------|-------|
| 17 | **Təbii qaz kalkulyatoru** — İLLİK pilləli qaz tarifi (0–1200 m³: 12.5q, 1200–2500: 20q, 2500+: 25q), il üzrə yığılan həcm, pillə bölgüsü, CO₂ | Qaz | GridPulse gas module |
| 18 | **Qaz proqnozu** — istilik mövsümü modeli (Bakı temperaturu), 1200/2500 m³ həddinin hansı ayda keçiləcəyi | Qaz | GridPulse gas forecast |
| 19 | **Qaz sızma testi** — gecə/səhər 2 göstərici ilə | Qaz | GridPulse gas leak detection |
| 20 | **Dəm qazı və qaz təhlükəsizliyi** yoxlama siyahısı | Qaz | yeni |
| 21 | **Sayğac diaqnozu** — sıfır göstərici (nasazlıq), şübhəli davamlı azalma (icazəsiz müdaxilə/bypass), davamlı artım (cihaz nasazlığı), tək pik, tədrici trend; ciddilik dərəcəsi və "nə etməli" | Analitika | GridPulse diagnose_meters + SecurityAlerts |
| 22 | **Həssaslıq tənzimləyicisi** (Ehtiyatlı / Balanslı / Həssas) — sınaq nəticələri ilə | Analitika | GridPulse ThresholdExplorer |
| 23 | **Metodun doğrulanması** — 300 sintetik (Bakı iqliminə kalibrlənmiş) ev × 18 ay üzərində brauzerdə canlı sınaq: dəqiqlik, aşkarlama, yanlış həyəcan, növlər üzrə nəticə | Haqqında | GridPulse real_data_validation |
| 24 | **İstifadə istilik xəritəsi** (ay × il, pillə rəngi, anomaliya işarəsi) | Analitika | PanoPulse RiskHeatmap |
| 25 | **Evin enerji xəritəsi** — cihazlar ölçüsü istifadəyə, rəngi kateqoriyaya görə kafellər; effektivsizlər qırmızı çərçivəli | Cihazlar | PanoPulse Digital Twin |
| 26 | **Nailiyyətlər (8 nişan) + aylıq çağırış** (keçən aydan 10% az hədəf) | Analitika | yeni |
| 27 | **Kəsintiyə hazırlıq** — kritik cihazlar üçün Vt·saat, tövsiyə olunan ehtiyat tutumu, invertor gücü, powerbank sayı; qaz kombisi xəbərdarlığı | Hazırlıq | GridPulse critical infra / disaster scenario |
| 28 | **Soyuducu qida təhlükəsizliyi** (USDA) + **təcili əlaqə** nömrələri (112, 101, 103, 104, 199) | Hazırlıq | GridPulse EmergencyTeamCard |
| 29 | **Paylaşma** — nəticəni keçid ilə paylaşmaq (`?kwh=…&lang=…&tab=…` parametrləri) | Kalkulyator | yeni |
| 30 | **Aylıq xatırlatma** — bu ayın sayğac qeydi yoxdursa banner | Kalkulyator | yeni |

Düzəlişlər: GitHub keçidi düzgün repoya yönəldildi; mobil ekranda cihaz formasının üfüqi daşması aradan qaldırıldı; qısa ay adlarında İyun/İyul qarışıqlığı düzəldildi.

## 🎨 v2.2 — Yeni dizayn və responsiv tərtibat

- **Masaüstü (≥1100px):** sol yan panel (ikonlu naviqasiya, təqdimat, tema, dil), geniş iş sahəsi (1280px-ə qədər), bütün bölmələrdə 2 sütunlu kart şəbəkəsi (≥1500px-də 3 sütun); kalkulyator iki sütunlu (sürüşdürücü + nəticələr)
- **Planşet (720–1099px):** yuxarıda yapışqan, bulanıq fonlu başlıq + üfüqi naviqasiya (aktiv bölmə avtomatik görünür)
- **Mobil (<720px):** yığcam başlıq + **aşağı naviqasiya paneli** (4 əsas bölmə + "Daha çox" pəncərəsi), toxunuşa uyğun düymələr, iOS-da avtomatik yaxınlaşmanın qarşısı (16px input), üfüqi daşma yoxdur
- **Açıq / tünd tema** — sistem seçimini izləyir, əl ilə dəyişdirilə bilir, qrafiklər də uyğunlaşır
- **Ümumi baxış zolağı** — sağlamlıq balı, 12 ay proqnozu, büdcə vəziyyəti, qaz xərci; klikləyəndə müvafiq bölməyə keçir
- **Hesab yoxlayıcısı** — Azərişıq hesabındakı kVt·saat və məbləğ rəsmi tariflə uyğundurmu? Fərqi və məbləğin uyğun gəldiyi kVt-ı göstərir
- **Köhnə vs yeni cihaz** — illik qənaət, geri ödəmə müddəti və 10 illik xalis nəticə (pilləli tarifə görə)
- Klaviatura qısayolları (**Alt + 1…9**), URL-də bölmə (`#insights`), çap üçün təmiz görünüş

## 📟 v2.4 — Ağıllı sayğac AI laboratoriyası, vizual izah, Gənclər Fondu vizual identikası

| # | Funksiya | Harada |
|---|----------|--------|
| 31 | **Ağıllı Sayğac AI Laboratoriyası** — saatlıq (smart meter) məlumatın analizi: 24 saatlıq yük əyrisi, baza yükü (həmişə açıq cihazlar) və onun illik xərci, pik saat, yük əmsalı, həftə × saat istilik xəritəsi, gündəlik cəmlər | Ağıllı sayğac |
| 32 | **Saatlıq anomaliya aşkarlanması** — hər saat eyni saatın median/MAD bazası ilə müqayisə olunur (robust z-score); gecə/gündüz hadisələri izahla | Ağıllı sayğac |
| 33 | **AI tövsiyələri** — ölçülə bilən göstəricilərə əsaslanan, ₼ ilə ifadə olunan konkret tövsiyələr (baza yükü, gecə anomaliyası, pillə proqnozu, axşam piki və s.) | Ağıllı sayğac |
| 34 | **Simulyasiya sistemi** — Cihazlar siyahısından 4 həftəlik saatlıq yük profili (kateqoriyaya görə gün ərzində istifadə ritmi, həftəsonu effekti) | Ağıllı sayğac |
| 35 | **CSV idxal/ixrac** — ağıllı sayğacdan saatlıq məlumat (ISO və ya `dd.mm.yyyy`, ayrı saat sütunu, `,` `;` tab, onluq vergül, Vt·saat → kVt·saat avtomatik, 15 dəq → saatlıq); fayl yalnız brauzerdə emal olunur | Ağıllı sayğac |
| 36 | **Canlı sayğac** — hazırkı saatın profilinə əsaslanan animasiyalı güc göstəricisi | Ağıllı sayğac |
| 37 | **Tarif pillələrinin animasiyalı izahı** — istifadənin pillələrə pillə-pillə dolması, hər pillənin kVt × qiymət = ₼ hesabı və orta qiymət | Kalkulyator |
| 38 | **Enerji axını diaqramı** — stansiya → şəbəkə itkisi (7.6%) → sayğac → cihaz kateqoriyaları, canlı animasiya, mobil üçün şaquli versiya | Kalkulyator |
| 39 | **AI məsləhətçi: çoxaddımlı dialoq** — son 6 mesaj kontekstdə saxlanılır; ağıllı sayğac analizi də AI-a ötürülür (serverdə təmizlənir) | Kalkulyator |
| 40 | **Gənclər Fondunun loqosu** — yan panel, kalkulyatorun ilk ekranı, mobil menyu, Haqqında, footer (açıq temada rəngli, tünd temada ağ variant), PDF hesabatın başlığı | Hər yerdə |
| 41 | **Məcburi qeyd** ("Bu nəşr … Gənclər Fondunun maliyyə yardımı ilə hazırlanmışdır …") footer-də və PDF-in hər səhifəsində; paylaşma mətnində **#AzGF #GenclerFondu** | Hər yerdə |
| 42 | **Sosial şəbəkə önizləməsi** — `og-image.jpg` (1200×630, Fondun loqosu ilə) və Open Graph meta teqləri | — |

Təqdimat rejimi 9 addıma genişləndi (vizual izah və ağıllı sayğac laboratoriyası əlavə olundu).

> Qeyd: domen qoşulandan sonra `index.html`-də `og:image` üçün tam ünvan yazılması tövsiyə olunur (məs. `https://energyx.az/og-image.jpg`) — Facebook nisbi ünvanı qəbul etmir.

## 🧹 v2.4.1 — Təmiz görünüş, audit və AI düzəlişləri

| # | Dəyişiklik | Harada |
|---|-----------|--------|
| 43 | **Scroll zolaqları gizlədildi** — yan panel, səhifə, mobil menyu və söhbət pəncərəsi əvvəlki kimi sürüşür, amma zolaq yer tutmur; cədvəllərdə nazik zolaq saxlanılıb | Hər yerdə |
| 44 | **Oxuma irəliləmə xətti** (ekranın yuxarısında) və **"Yuxarı qayıt" düyməsi** — zolaq olmadığı üçün səhifədə harada olduğunuz görünür | Hər yerdə |
| 45 | **AI modeli yeniləndi** — köhnə `gemini-2.0-flash` 1 iyun 2026-da Google tərəfindən bağlanıb (canlı saytda AI-ın işləməməsinin səbəbi). Default indi `gemini-flash-latest` ləqəbidir; konfiqurasiya edilmiş model bağlansa (404), server avtomatik ehtiyat modelə keçir və onu yadda saxlayır | Backend |
| 46 | **AI cavab keyfiyyəti** — 2.5 Flash-da "düşünmə" söndürülür, yeni modellərdə düşünmə üçün token yeri saxlanılır (cavablar yarımçıq kəsilmir), boş/bloklanmış cavab artıq "uğurlu" sayılmır, xəta səbəbi (`MAX_TOKENS`, `SAFETY`, `NOT_FOUND` …) loqa yazılır | Backend |
| 47 | **`GET /ai-check`** — AI açarının və modelin işlədiyini bir kliklə yoxlamaq; `/health` indi versiya, model və iş müddətini göstərir | Backend |
| 48 | **AI söhbəti** — 25 s sonra oflayn köməkçiyə keçid (Render yuxudan oyananda), köhnə backend-in "Üzr istəyirəm…" cavabı xəta kimi tanınır, cavab gözlənərkən ikinci sual göndərilmir (cavablar qarışmırdı), "çox sorğu" mesajı seçilmiş dildə | Kalkulyator |
| 49 | **Yedək v2** — qaz, kəsinti planı, ağıllı sayğac CSV-si, cihaz müqayisəsi, sərmayə planı və həssaslıq ayarı da yedəyə düşür; idxalda hər dəyər yoxlanılır və formlar dərhal yenilənir | Analitika |
| 50 | **Əlçatanlıq (WCAG AA)** — açıq temada rəng kontrastı düzəldildi, sürüşən cədvəllər klaviatura ilə əlçatan oldu, etiketsiz input qalmadı (axe-core: 0 ciddi pozuntu, hər iki tema) | Hər yerdə |

**Audit:** 10 bölmə × 3 dil — tərcümə boşluğu yoxdur, sərhəd dəyərlərində (`-5`, `0`, `99999999`, boş) heç yerdə `NaN`/`undefined` çıxmır, bütün düymələr klikləndi, JS xətası yoxdur, 9 ekran enində üfüqi daşma yoxdur, oflayn (PWA) rejimdə səhifə açılır.

### 🛡️ Möhkəmlik və təhlükəsizlik
- **XSS qoruması** — istifadəçinin yazdığı cihaz/sayğac adları HTML-ə təhlükəsiz yerləşdirilir
- **Səhifə ~13 dəfə yüngülləşdi** (1.09 MB → ~85 KB): PDF şrifti ayrıca fayla çıxarıldı və yalnız PDF yaradılanda yüklənir
- Backend: təhlükəsizlik başlıqları, `ALLOWED_ORIGINS` ilə CORS, 10 KB sorğu limiti, giriş doğrulaması, `/track` üçün rate-limit və hadisə növü siyahısı, statistikanın atomik yazılması, Gemini açarı URL-də yox başlıqda, 15 s timeout, `/health` endpoint, səliqəli 404/400 cavabları
- AI-a göndərilən kontekst serverdə təmizlənir (prompt injection riskini azaltmaq üçün)
- Tarif məntiqi vahid mənbədən gəlir və frontend ↔ backend uyğunluğu testlə yoxlanılır
- **60 avtomatik test** (`cd backend && npm test`; AI cavabları saxta Gemini ilə yoxlanılır) + GitHub Actions CI

> Qeyd: "Nümunə məlumat" və təqdimat rejimindəki məlumat açıq şəkildə **nümunə** kimi etiketlənib — real istifadəçi məlumatı deyil.

## 📁 Struktur
```
energyx-az/
├── backend/                Node.js server (Gemini AI + statistika)
│   ├── server.js           API (təhlükəsizlik, doğrulama, rate-limit)
│   ├── tariff.js           Rəsmi tarif hesablaması
│   ├── test/               Avtomatik testlər (node:test)
│   ├── package.json
│   └── .env.example
├── frontend/               Statik veb sayt (PWA)
│   ├── index.html
│   ├── js/engine.js        Analitika mühərriki (təmiz funksiyalar, testlənir)
│   ├── js/pro.js           Analitika / Planlaşdırma / Təqdimat / PDF / Yedək UI
│   ├── js/extras.js        Qaz / Diaqnoz / Doğrulama / Hazırlıq / Nailiyyətlər UI
│   ├── js/ux.js            Tema, naviqasiya, ümumi baxış, hesab yoxlayıcısı, cihaz müqayisəsi
│   ├── js/lab.js           Ağıllı sayğac laboratoriyası, tarif animasiyası, enerji axını
│   ├── img/                Gənclər Fondunun loqoları (rəngli / ağ)
│   ├── css/pro.css, css/layout.css   Komponent stilləri + responsiv tətbiq qabığı
│   ├── fonts/DejaVuSans.ttf  PDF üçün Unicode şrift (lazım olanda yüklənir)
│   ├── sw.js, manifest.webmanifest, icon.svg
│   └── SpaceGrotesk-Bold.ttf
└── .github/workflows/ci.yml
```

### 🧪 Testlər
```bash
cd backend
npm install
npm test
```

## 🚀 Deploy addımları (100% pulsuz, YALNIZ domen istisna)

### 1. Backend → Render.com (pulsuz tier)
1. GitHub-a `backend/` qovluğunu yükləyin (yeni, ayrıca repo kimi)
2. [render.com](https://render.com) → "New Web Service" → GitHub reponuzu seçin
3. Environment Variables bölməsinə əlavə edin: `GEMINI_API_KEY` = (öz pulsuz Gemini API açarınız — [aistudio.google.com](https://aistudio.google.com/apikey)-dan pulsuz alın). İstəyə bağlı: `GEMINI_MODEL` (default `gemini-flash-latest`; **köhnə `gemini-2.0-flash` 1 iyun 2026-da bağlanıb — Render-də bu dəyər yazılıbsa, silin**), `ALLOWED_ORIGINS` (məs. `https://energyx.az`)
4. Deploy edin — sizə bir URL veriləcək (məs. `https://enerji-kalk-backend.onrender.com`)
5. Yoxlayın: `…/health` → `"ai": true` və `"version"` repodakı ilə eyni olmalıdır; `…/ai-check` → `"ok": true` (AI həqiqətən cavab verir). `ok:false` olarsa `reason` sahəsi səbəbi göstərir (məs. açar səhvdir və ya model adı mövcud deyil)

### 2. Frontend → Vercel (pulsuz tier)
1. `frontend/index.html` faylında, ən aşağıdakı sətri tapın:
   ```js
   const API_BASE = "http://localhost:3000";
   ```
   Bunu RENDER-dən aldığınız REAL backend URL-i ilə əvəz edin:
   ```js
   const API_BASE = "https://enerji-kalk-backend.onrender.com";
   ```
2. GitHub-a `frontend/` qovluğunu **bütün alt qovluqları ilə** (`js/`, `css/`, `fonts/`) yükləyin
3. [vercel.com](https://vercel.com) → "New Project" → reponuzu seçin → Deploy

### 3. Domen (yalnız bu, real ödəniş tələb edir)
Vercel layihənizin ayarlarında "Domains" bölməsinə gedib, aldığınız domeni (məs. `energyx.az`) əlavə edin, DNS təlimatlarını izləyin.

## 🔓 Açıq Mənbə
Bu layihə açıq mənbədir (MIT lisenziya) — kod GitHub-da ictimai repo kimi saxlanılmalıdır (Gənclər Fondu tələbinə uyğun).

## 📊 Rəsmi Tarif Mənbəyi
- 0–200 kVt/saat: 8.4 qəpik/kVt
- 200–300 kVt/saat: 10 qəpik/kVt
- 300+ kVt/saat: 15 qəpik/kVt

(Mənbə: Azərbaycan Respublikası Energetika Nazirliyi)

## 🌍 CO₂ Əmsalı Mənbəyi
719 qram CO₂/kVt·saat — Asian Transport Outlook, "Transport and Climate Profile: Azerbaijan" (2022 məlumatı). Ağac udumu (21 kq/il) ümumi qəbul edilmiş orta rəqəmdir.

## 📈 Qeyd: Statistika faylı
Backend `stats.json` adlı faylı avtomatik yaradır (istifadə statistikasını saxlamaq üçün) — bunu əlavə etməyə ehtiyac yoxdur, server ilk sorğuda özü yaradır.

> ⚠️ Render-in pulsuz planında disk müvəqqətidir — server yenidən başlayanda / yenidən deploy olunanda `stats.json` sıfırlanır. Statistikanın qalıcı olması üçün Render-də "Persistent Disk" (ödənişli) və ya xarici pulsuz verilənlər bazası lazımdır.

