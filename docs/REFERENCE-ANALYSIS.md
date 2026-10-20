# Inspeksi hellolandbouw.id

Diperiksa langsung lewat Chrome (computed styles, stylesheet, screenshot) pada 18 Oktober 2026, di desktop 1536 px.
Halaman yang dibuka: beranda, dropdown Seragam, katalog kategori Kemeja, form Penawaran. Tampilan mobile tidak bisa
diperiksa langsung karena jendela browser otomasi tidak bisa diperkecil; perilaku mobile disimpulkan dari kelas
Tailwind (`md:hidden` pada tombol menu, `max-w-6xl`, breakpoint `md`/`lg`) dan **tidak** dinyatakan sebagai hasil
observasi visual.

## Yang terverifikasi

**Font (computed style + `document.fonts`):**
- Display: **Plus Jakarta Sans** 600/700/800. H1 60px, weight 800, line-height 1.1, letter-spacing -1.5px. H2 30–36px, weight 600–700, letter-spacing -0.9px.
- Body/UI: **Inter** 400–700, body 16px/24px, paragraf hero 18px/29px, nav 13px weight 500.
- DM Mono termuat tapi tidak terlihat dipakai pada elemen yang diperiksa.
- Sumber: Google Fonts (keduanya lisensi OFL).

**Warna:** hijau brand (`rgb(19,126,62)`, `rgb(23,150,74)`), teks hampir hitam `rgb(5,7,8)`, abu-biru sekunder `rgb(104,119,129)`, latar `rgb(251,253,252)` dengan gradasi hijau sangat lembut di hero.

**Layout:**
- Header melayang: `sticky top-4`, lebar `max-w-6xl`, bentuk pill, latar putih 70%. Nav 7 item + CTA hijau "Download Katalog".
- Hero split: kiri eyebrow pill + H1 dua warna + paragraf + 2 CTA; kanan foto model dalam kartu miring dengan badge mengambang.
- Urutan beranda: hero, 4 kartu statistik, logo klien (marquee 30 detik linear), koleksi 4 kategori (kartu foto 28px radius), proses 3 langkah, kalkulator estimasi harga, 6 kartu keunggulan ber-ikon, testimoni, FAQ accordion, blok CTA hijau besar berradius, footer 3 kolom.
- Dropdown: panel putih berradius dengan ikon, judul, subjudul, dan panah per kategori. Terbuka saat hover.
- Halaman kategori: header abu, grid 3 kolom kartu foto besar dengan nama dan label kategori.
- Form penawaran: satu halaman, bagian bernomor 1–10, pilihan berbentuk chip (jenis institusi, produk, jumlah, bahan, finishing, status desain, target waktu, budget), lalu dikirim sebagai pesan WhatsApp.

**Motion (dari stylesheet dan transisi aktif):**
- Token `--ease-standard: cubic-bezier(.2,0,0,1)`, `--ease-spring: cubic-bezier(.16,1,.3,1)`, `--dur-fast: .12s`, `--dur-base: .2s`.
- Keyframe `fade-up` (translateY 16px ke 0), `marquee`, `gradient-pan`, `pulse-glow`, `accordion-down/up`.
- Hover kartu: transform + shadow + border 0.3s dengan easing spring; zoom gambar 0.5s.
- Elemen hero memakai transform inline (`rotate(2deg)`, `rotate(-3deg)`, `scale(...)`) yang mengindikasikan animasi berbasis JS (pola Framer Motion).

## Yang membuat referensi terasa profesional

1. Satu font display tebal dengan tracking negatif memberi hierarki tegas.
2. Foto produk besar dan konsisten (latar terang, properti meja) di setiap kartu.
3. Header melayang yang selalu terlihat dan dropdown kategori yang informatif.
4. Form penawaran berbasis chip: cepat diisi, terasa ringan.
5. Easing seragam di seluruh situs.

## Apa yang tidak dibawa ke DEFLECTED, dan alasannya

| Pola di referensi | Keputusan |
|---|---|
| Statistik "12+ tahun, 850+ klien, 180k+" | Tidak ada data terverifikasi dari klien, jadi diganti section material dan teknik yang benar-benar sudah diproduksi. |
| Testimoni | Tidak ada testimoni asli. Tidak dibuat. |
| Kalkulator harga | Tidak ada aturan harga dari klien. Ditunda (lihat CLIENT-INPUT.md). |
| Proses 3 langkah | DEFLECTED punya 6 tahap di company profile; dipakai apa adanya. |
| 6 kartu keunggulan seragam ber-ikon | Diganti daftar bernomor 4 poin dari deck + kolase foto. |
| Marquee logo di bawah hero | Daftar organisasi ditampilkan sebagai teks dengan catatan dari deck, di dalam section hasil produksi. |
| Eyebrow pill di atas H1, latar grid tipis | Tidak dipakai (pola template). |
| Hijau, Plus Jakarta Sans sebagai display | Diganti palet DFLCTD dan Bebas Neue dari brand sheet; Plus Jakarta Sans dipakai untuk teks. |

Struktur halaman, kualitas foto produk, header melayang, dropdown kategori, form chip, dan easing spring diadaptasi
dengan implementasi sendiri. Tidak ada kode, teks, foto, atau aset referensi yang disalin.
