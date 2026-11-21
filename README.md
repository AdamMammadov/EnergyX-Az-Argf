# EnergyX Az

Azərbaycanda ev təsərrüfatları üçün pulsuz elektrik və qaz xərci kalkulyatoru. Rəsmi pilləli tariflərlə aylıq ödənişi hesablayır, hansı cihazın nə qədər enerji işlətdiyini göstərir və qənaət üçün konkret addımlar təklif edir.

Layihə Azərbaycan Respublikasının Gənclər Fondunun qrant dəstəyi ilə hazırlanıb. Kod açıq mənbədir (MIT).

Tanıtım videosu: [youtu.be/bov7zKZije4](https://youtu.be/bov7zKZije4)

## Saytda nə var

| Bölmə | Nə edir |
|-------|---------|
| Ana səhifə | Sürətli hesablama, əhali üçün elektrik və qaz tarifləri, bölmələrə keçid |
| Kalkulyator | Aylıq kVt·saata görə pillə və məbləğ, növbəti pilləyə qalan miqdar, ay sonu proqnozu, CO₂, pilləli tarifin necə hesablandığı, enerjinin stansiyadan evə yolu, hesab yoxlama, sayğac qeydləri, PDF hesabat, paylaşma |
| Cihazlar | Cihaz siyahısı (9 hazır şablon), aylıq sərf, cihazların payı, köhnə və yeni cihazın müqayisəsi |
| Ağıllı sayğac | Saatlıq məlumatın analizi: gün ərzində yük əyrisi, baza yükü və onun illik xərci, pik saat, qeyri-adi saatlar, tövsiyələr. Məlumat cihaz siyahısından simulyasiya olunur, nümunədən götürülür və ya CSV kimi yüklənir |
| Qaz | İllik pilləli qaz tarifi, ilin sonuna qədər proqnoz, sızma testi, dəm qazı təhlükəsizliyi |
| Analitika | Enerji balı (0-100), qeyri-adi aylar, sayğac problemləri, 12 aylıq proqnoz, aylar üzrə istifadə, illik ekoloji iz, aylıq hədəf |
| Planlaşdırma | Ay ərzində büdcə izləmə, vərdiş dəyişikliklərinin təsiri, alışların geri ödəmə müddəti |
| İşıq kəsiləndə | Vacib cihazlar üçün ehtiyat enerji, soyuducudakı qidanın təhlükəsizliyi, təcili nömrələr |
| Enerji məsləhətçisi | Gemini əsaslı söhbət. Server əlçatmaz olanda saytın öz oflayn köməkçisi cavab verir |

Əlavə olaraq: açıq və tünd tema, Azərbaycan, ingilis və rus dilləri, oflayn iş və telefona tətbiq kimi quraşdırma (PWA), məlumatların JSON yedəyi, 9 addımlı təqdimat rejimi.

Bütün hesablamalar istifadəçinin brauzerində aparılır. Sayğac və cihaz məlumatları serverə göndərilmir. Məsləhətçiyə sual veriləndə yalnız sual və bir neçə ümumi göstərici (kVt·saat, proqnoz) cavab hazırlamaq üçün serverə gedir.

## Struktur

```
backend/                 Node.js server (Express)
  server.js              API: /advise (məsləhətçi), /ai-check, /health, /stats, /track
  tariff.js              Rəsmi tarif hesablaması
  test/                  Avtomatik testlər (node:test)
frontend/                Statik sayt (PWA)
  index.html             Səhifə, əsas skript, tərcümələr
  js/engine.js           Hesablama mühərriki (təmiz funksiyalar, testlərlə yoxlanılır)
  js/pro.js              Analitika, planlaşdırma, təqdimat, PDF, yedək
  js/extras.js           Qaz, diaqnoz, metodun yoxlanılması, işıq kəsintisi, nişanlar
  js/ux.js               Tema, naviqasiya, icmal, hesab yoxlama, cihaz müqayisəsi
  js/lab.js              Ağıllı sayğac analizi, tarif animasiyası, enerji axını
  js/home.js             Ana səhifə və başlanğıc bölməsi
  css/                   Stillər (theme.css: rəng sistemi və ikonlar)
  vendor/                Chart.js 4.5.1 və jsPDF 2.5.1 (MIT), CDN-dən asılılıq yoxdur
  img/                   Gənclər Fondunun loqoları
  fonts/DejaVuSans.ttf   PDF üçün Unicode şrift
  sw.js                  Oflayn keş
.github/workflows/ci.yml Sintaksis yoxlaması və testlər
```

## Tanıtım videosu

`tools/demo-video/` qovluğundakı skriptlər saytın təqdimat rejimindən Azərbaycan dilində izahlı, musiqili və altyazılı video hazırlayır. Addımlar həmin qovluğun README faylındadır.

## Testlər

```bash
cd backend
npm install
npm test
```

Testlər tarif hesablamasını, analitika funksiyalarını, API-ni, frontend fayllarının versiyalanmasını və məsləhətçinin Gemini ilə işini (saxta cavablarla) yoxlayır. Hər push-da GitHub Actions-da işləyir.

## Yayımlama

### Backend (Render)
1. Render-də "New Web Service" yaradın və bu reponu seçin.
2. Root Directory: `backend`, Build: `npm install`, Start: `node server.js`.
3. Environment Variables:
   - `GEMINI_API_KEY`: Gemini API açarı ([aistudio.google.com](https://aistudio.google.com/apikey)).
   - `GEMINI_MODEL` (istəyə bağlı): default `gemini-flash-latest`. Köhnə `gemini-2.0-flash` 1 iyun 2026-da bağlanıb, bu dəyər yazılıbsa silin.
   - `ALLOWED_ORIGINS` (istəyə bağlı): məsələn `https://energyx.az`.
4. Deploy-dan sonra yoxlayın:
   - `/health`: `"ai": true` və `"version"` repodakı versiya ilə eyni olmalıdır.
   - `/ai-check`: `"ok": true` olmalıdır. `ok: false` olarsa, `reason` sahəsi səbəbi göstərir.

Render-in pulsuz serveri 15 dəqiqə sorğu almayanda yatır. `.github/workflows/keepalive.yml` hər 10 dəqiqədən bir `/health` ünvanına sorğu göndərir ki, server oyaq qalsın (bir servis üçün pulsuz 750 saatlıq limit kifayətdir). Backend ünvanı dəyişsə, repo ayarlarında `BACKEND_URL` dəyişənini yazın. Sayt da açılan kimi serveri səssizcə oyadır.

Model müvəqqəti yüklənəndə (503), kvota bitəndə (429) və ya model bağlananda (404) server avtomatik ehtiyat modelə (`gemini-flash-lite-latest`, `gemini-2.5-flash`) keçir.

### Frontend (Vercel)
1. Vercel-də yeni layihə yaradın, bu reponu seçin, Root Directory: `frontend`.
2. Backend ünvanı `frontend/index.html`-də `API_BASE` sabitindədir.
3. Domen Vercel layihəsinin "Domains" bölməsindən qoşulur. Domen qoşulandan sonra `og:image` üçün tam ünvan yazmaq tövsiyə olunur (Facebook nisbi ünvanı qəbul etmir).

### Statistika haqqında qeyd
Backend istifadə statistikasını `stats.json` faylında saxlayır. Render-in pulsuz planında disk müvəqqətidir: server yenidən başlayanda fayl sıfırlanır. Qalıcı statistika üçün Render Persistent Disk və ya xarici verilənlər bazası lazımdır.

## Mənbələr

- Elektrik tarifi (aylıq): 0-200 kVt·saat 8.4 qəpik, 200-300 kVt·saat 10 qəpik, 300 kVt·saatdan çox 15 qəpik.
- Qaz tarifi (illik): 1200 m³-ə qədər 12.5 qəpik, 1200-2500 m³ 20 qəpik, 2500 m³-dən çox 25 qəpik.
- Tariflər: Azərbaycan Respublikasının Tarif (qiymət) Şurası.
- CO₂ əmsalı: 719 q/kVt·saat, Asian Transport Outlook, "Transport and Climate Profile: Azerbaijan" (2022).
- Şəbəkə itkisi: 7.6%, Dünya Bankı WDI (2023).
- Soyuducuda qida təhlükəsizliyi: ABŞ Kənd Təsərrüfatı Nazirliyi (USDA).

Nümunə məlumat və təqdimat rejimindəki rəqəmlər real istifadəçi məlumatı deyil və saytda "nümunə" kimi qeyd olunub.

## Versiyalar

- **2.5.3**: tanıtım videosu ana səhifədə və "Haqqında" bölməsində (YouTube yalnız "oynat" basılanda yüklənir).
- **2.5.2**: səsli tanıtım videosu üçün alətlər (`tools/demo-video/`): Azərbaycan dilində izah, musiqi, altyazı; təqdimat addımlarının müddəti istəyə görə verilə bilir.
- **2.5.1**: backend-i oyaq saxlayan GitHub Actions işi (AI-ın ilk cavabı gecikmir), "Telefona quraşdır" düyməsi, PNG tətbiq ikonları.
- **2.5**: ana səhifə, qrafik kitabxanası saytın içinə köçürüldü (canlı saytda qrafiklər boş qalırdı), açılışda avtomatik bildiriş çıxmır, yeni rəng sistemi və oxunaqlı şrift, xətt ikonları, mətnlərin sadələşdirilməsi, brauzerin "geri" düyməsi bölmələr arasında işləyir.
- **2.4.2**: Gemini yüklənəndə ehtiyat modelə keçid, backend asılılıqlarında zəifliklər bağlandı.
- **2.4.1**: gizli scroll zolaqları, oxuma xətti və "yuxarı qayıt" düyməsi, `/ai-check`, yedəkdə bütün ayarlar, əlçatanlıq (WCAG AA) düzəlişləri.
- **2.4**: ağıllı sayğac analizi, tarifin animasiyalı izahı, enerji axını diaqramı, Gənclər Fondunun loqosu və məcburi qeyd (sayt və PDF).
- **2.2**: masaüstü, planşet və mobil üçün yeni tərtibat, açıq/tünd tema, hesab yoxlama, cihaz müqayisəsi.
- **2.1**: qaz bölməsi, sayğac diaqnozu, metodun yoxlanılması, işıq kəsintisinə hazırlıq.
- **2.0**: analitika, planlaşdırma, təqdimat rejimi, PDF hesabat, yedək, oflayn iş.

GridPulse və PanoPulse layihələrindən götürülmüş ideyalar (anomaliya aşkarlanması, proqnoz, sağlamlıq balı, təqdimat rejimi) fərdi istifadəçi üçün sadələşdirilib.
