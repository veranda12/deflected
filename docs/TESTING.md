# Hasil pengujian

Dijalankan 18 Oktober 2026 di Windows 11, Node 20.19, PostgreSQL 17 lokal, Chrome.
Belum ada test suite otomatis (unit/E2E); pengujian di bawah dilakukan manual dan dengan skrip di `scripts/`.

## Build dan kualitas kode

| Cek | Hasil |
|---|---|
| `tsc --noEmit` (strict) | Lulus, 0 error |
| Pemindaian copy | Tidak ada em dash atau buzzword di kode sumber dan data seed |
| `eslint .` | Lulus, 0 error 0 warning |
| `next build` | Lulus, tanpa warning |
| `opennextjs-cloudflare build` | Lulus (dengan peringatan resmi bahwa Windows tidak didukung penuh) |
| `wrangler dev/deploy` | **Belum diuji**: butuh Node 22 |
| `next start` (produksi) | Semua halaman 200; respons 25–40 ms setelah cache data hangat |

## Fungsional (diklik di browser)

| Elemen | Hasil |
|---|---|
| Navigasi header, link aktif | Pindah halaman, underline aktif benar |
| Dropdown Katalog | Terbuka saat hover/klik, Escape dan klik luar menutup. Bug ditemukan dan diperbaiki: klik setelah hover langsung menutup panel |
| Menu mobile (Chrome headless 390 px) | Terbuka, scroll body terkunci, fokus pindah ke link pertama, Tab tetap di dalam panel, Escape menutup dan fokus kembali ke tombol menu, link menavigasi dan menutup panel. Bug ditemukan dan diperbaiki: fokus awal belum masuk panel |
| Pencarian katalog | `?q=drill` menghasilkan 3 produk yang benar (Jaket Kerja, Kemeja Pecah Pola, Rompi); filter bahan/teknik memakai fungsi yang sama |
| Detail produk | Thumbnail dan panah berganti foto; dialog perbesar terbuka dengan fokus di tombol Tutup, ArrowRight berpindah foto, Escape menutup |
| Form penawaran | Validasi server menampilkan error per field dan isian tetap tersimpan; kirim sukses memberi nomor referensi + link WhatsApp berisi ringkasan; produk dari halaman detail terpilih otomatis |
| Login admin | Password salah: pesan generik. Benar: masuk dashboard |
| CRUD produk | Buat (validasi wajib isi), unggah foto, ubah slug + publish, hapus. Perubahan langsung tampil di situs publik |
| Redirect slug | URL lama `/produk/topi-bordir-uji` mengalihkan permanen (308) ke slug baru |
| Konten CMS | Ubah hashtag footer di Admin > Konten: pesan tersimpan, situs publik langsung berubah, lalu dikembalikan |
| Semua 18 halaman admin | Render 200 tanpa error. Simpan kategori, portofolio, FAQ, SEO, pengaturan, pengguna belum diklik satu per satu (memakai pola aksi yang sama dengan produk dan konten) |

## Keamanan

| Uji | Hasil |
|---|---|
| `/admin` tanpa sesi | 307 ke `/admin/login` |
| Cookie sesi palsu | Halaman admin redirect ke login; ekspor CSV 401 |
| Upload tanpa sesi / origin asing | 401 / 403 (tercatat di security log) |
| Upload file HTML berekstensi .jpg | Ditolak (magic bytes) |
| Upload 6 MB | Ditolak |
| Upload ke ID produk palsu / `../../etc` | 404 / 400 |
| `/media/..%2F..%2F.env.local` | 400, tidak ada file terbaca |
| `/api/cron/*` tanpa token | 401 |
| 9 kali password salah | Kegagalan ke-9: akun dikunci 15 menit; password benar tetap ditolak saat terkunci; percobaan ke-11: rate limit per email |
| Header keamanan | CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy hadir; HSTS di produksi |

## Google Sheets (dengan mock lokal `scripts/sheets-mock.mjs`)

Mock memverifikasi tanda tangan JWT RS256 dengan public key, jadi alur auth service account benar-benar diuji.
API Google asli **belum** diuji karena kredensial klien belum ada.

| Skenario | Hasil |
|---|---|
| Inquiry tersimpan saat Sheets belum dikonfigurasi | Status `Nonaktif`, data aman di DB |
| Kredensial diisi, cron dijalankan | Baris lama tersinkron (1 baris) |
| Cron dijalankan lagi | Tidak ada baris duplikat |
| API menulis baris tapi mengembalikan 500 | Status `Gagal` + pesan error tersimpan |
| Retry setelah API pulih | Status `Tersinkron`, tetap 1 baris (dedupe via kolom Ref) |
| Isi perusahaan `=HYPERLINK(...)` | Ditulis sebagai `'=HYPERLINK(...)` (formula dinetralkan) |

## Responsif

`scripts/qa-screens.mjs` di Chrome headless, 8 halaman publik x lebar 360, 390, 768, 1440 px:
tidak ada overflow horizontal di semua 32 kombinasi; screenshot penuh ditinjau untuk 390 px.
Link teks inline berukuran 24 px tinggi (memenuhi WCAG 2.5.8 AA); tombol dan kontrol form minimal 44 px.

## Belum diuji

- Lighthouse / Core Web Vitals lapangan (Lighthouse tidak terpasang; perlu diuji di URL produksi).
- Screen reader nyata (struktur ARIA, landmark, label, dan fokus diperiksa lewat accessibility tree).
- Safari iOS dan Firefox.
- Deploy Cloudflare end-to-end, R2, dan Cloudflare Images.
