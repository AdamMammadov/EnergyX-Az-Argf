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

### 🛡️ Möhkəmlik və təhlükəsizlik
- **XSS qoruması** — istifadəçinin yazdığı cihaz/sayğac adları HTML-ə təhlükəsiz yerləşdirilir
- **Səhifə ~13 dəfə yüngülləşdi** (1.09 MB → ~85 KB): PDF şrifti ayrıca fayla çıxarıldı və yalnız PDF yaradılanda yüklənir
- Backend: təhlükəsizlik başlıqları, `ALLOWED_ORIGINS` ilə CORS, 10 KB sorğu limiti, giriş doğrulaması, `/track` üçün rate-limit və hadisə növü siyahısı, statistikanın atomik yazılması, Gemini açarı URL-də yox başlıqda, 15 s timeout, `/health` endpoint, səliqəli 404/400 cavabları
- AI-a göndərilən kontekst serverdə təmizlənir (prompt injection riskini azaltmaq üçün)
- Tarif məntiqi vahid mənbədən gəlir və frontend ↔ backend uyğunluğu testlə yoxlanılır
- **21 avtomatik test** (`cd backend && npm test`) + GitHub Actions CI

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
│   ├── css/pro.css
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
3. Environment Variables bölməsinə əlavə edin: `GEMINI_API_KEY` = (öz pulsuz Gemini API açarınız — [aistudio.google.com](https://aistudio.google.com/apikey)-dan pulsuz alın). İstəyə bağlı: `GEMINI_MODEL` (default `gemini-2.5-flash`), `ALLOWED_ORIGINS` (məs. `https://energyx.az`)
4. Deploy edin — sizə bir URL veriləcək (məs. `https://enerji-kalk-backend.onrender.com`)

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

