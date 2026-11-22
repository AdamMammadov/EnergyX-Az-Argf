# Roll-up stend (850 x 2000 mm)

`rollup.html` stendin dizaynıdır (bütün ölçülər mm). Skriptlər onu çap üçün PDF-ə və şəkillərə çevirir.

```bash
cd frontend && python3 -m http.server 8765 &     # sayt lokalda
node tools/rollup/shots.js tools/rollup/build    # telefon ekranları (4x)
node tools/rollup/build.js tools/rollup/build --jpg150
```

Nəticə `tools/rollup/build/` qovluğundadır:

- `rollup-energyx-850x2000.pdf`: çap faylı (vektor mətn, TrueType şriftlər daxildir)
- `rollup-energyx-850x2000-150dpi.jpg`: eyni dizayn şəkil kimi
- `rollup-preview.jpg`: kiçik önizləmə
- `rollup-guides.jpg`: təhlükəsiz sahə və stendin altlığı qırmızı ilə göstərilir

`assets/` qovluğunda QR kod (https://energyx.az, vektor), EnergyX Az nişanı, Gənclər Fondunun loqosu və Inter şriftləri (SIL OFL 1.1, TrueType-a çevrilib ki, PDF-də düzgün yerləşsin) var. Çapxana üçün qeydlər `CAP-QEYDI.txt` faylındadır.
