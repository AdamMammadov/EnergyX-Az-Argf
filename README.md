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
- **3 dil** — Azərbaycan, İngilis, Rus
- Tam mobil uyğun, əlçatan (accessibility), açıq mənbə (MIT)

## 📁 Struktur
```
enerji-kalkulyator/
├── backend/          Node.js server (Gemini AI üçün)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/         Statik veb sayt
    ├── index.html
    └── SpaceGrotesk-Bold.ttf
```

## 🚀 Deploy addımları (100% pulsuz, YALNIZ domen istisna)

### 1. Backend → Render.com (pulsuz tier)
1. GitHub-a `backend/` qovluğunu yükləyin (yeni, ayrıca repo kimi)
2. [render.com](https://render.com) → "New Web Service" → GitHub reponuzu seçin
3. Environment Variables bölməsinə əlavə edin: `GEMINI_API_KEY` = (öz pulsuz Gemini API açarınız — [aistudio.google.com](https://aistudio.google.com/apikey)-dan pulsuz alın)
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
2. GitHub-a `frontend/` qovluğunu yükləyin
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

