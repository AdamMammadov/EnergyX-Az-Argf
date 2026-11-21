# Tanıtım videosu (səsli)

Saytın təqdimat rejimindən Azərbaycan dilində izahlı, musiqili və altyazılı video hazırlayır.

## Lazım olanlar
- Node.js və Playwright (Chromium ilə)
- Python 3, `ffmpeg` (libx264, libass)
- İzah səsi üçün: `pip install torch transformers scipy numpy` (CPU kifayətdir)
- Musiqi: Kevin MacLeod, "Inspired" ([incompetech.com](https://incompetech.com/music/royalty-free/mp3-royaltyfree/Inspired.mp3)), CC BY 4.0

## Addımlar
```bash
# 1) Sayt lokal serverdə
cd frontend && python3 -m http.server 8765 --bind 127.0.0.1 &

# 2) İzah klipləri (Meta MMS-TTS, Azərbaycan dili, latın əlifbası)
python3 tools/demo-video/tts_make.py tools/demo-video/script_az.json out/clips 0.94

#    və ya daha təbii səs: Gemini TTS (x-goog-api-key mühitin şəbəkə sirrində və ya GEMINI_API_KEY dəyişənində)
python3 tools/demo-video/tts_gemini.py tools/demo-video/script_az.json out/clips Sulafat

# 3) (istəyə bağlı) Anlaşıqlıq yoxlaması: kliplər Whisper ilə yenidən mətnə çevrilir
python3 tools/demo-video/asr_check.py out/clips/clips.json tools/demo-video/script_az.json

# 4) Kadrlar (təqdimat addımları klip uzunluqlarına görə gedir)
node tools/demo-video/record.js out/frames az light out/clips/clips.json

# 5) Video: kadrlar + izah + musiqi (izah zamanı səsi azalır) + altyazı
python3 tools/demo-video/assemble.py out/frames out/clips/clips.json Inspired.mp3 frontend/fonts out/energyx-az-tanitim.mp4
```

İzah mətni `script_az.json` faylındadır: `sub` altyazıda görünən mətndir, `tts` isə səsləndirilən formadır (rəqəmlər sözlə, durğu işarəsiz).

## Lisenziyalar
- Səs modeli: [facebook/mms-tts-azj-script_latin](https://huggingface.co/facebook/mms-tts-azj-script_latin), CC BY-NC 4.0 (yalnız qeyri-kommersiya istifadə).
- Musiqi: Kevin MacLeod, "Inspired", CC BY 4.0.
- Hər ikisinin adı videonun sonunda göstərilir.
