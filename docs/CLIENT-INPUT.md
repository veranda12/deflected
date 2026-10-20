# Yang masih dibutuhkan dari klien

| No | Item | Kenapa | Di mana diisi |
|---|---|---|---|
| 1 | **Persetujuan menampilkan nama organisasi** (PLN, YMI, SCI, KYB, Sampoerna Kayoe, Hitachi, PORMIKI, Astemo, Musashi, XLSMART, Unimus) dan nama klien di portofolio | Diambil dari katalog "Dipercaya Oleh"; perlu dipastikan boleh dipublikasikan di web | Admin > Konten > Beranda (Daftar organisasi), Admin > Portofolio |
| 2 | **Foto produk resolusi tinggi** | Foto saat ini diekstrak dari PDF katalog (lebar 400–800 px), terlihat agak lembut di layar besar | Admin > Produk / Portofolio > Unggah gambar |
| 3 | **Minimum order** per jenis produk | FAQ saat ini menjawab "dikonfirmasi saat konsultasi" | Admin > FAQ |
| 4 | **Estimasi lead time** produksi | Sama seperti di atas | Admin > FAQ |
| 5 | **Aturan harga** (harga dasar per produk, kelas bahan, tambahan teknik, diskon jumlah) | Syarat untuk kalkulator estimasi harga; tanpa data ini kalkulator tidak dibuat agar tidak menyesatkan | Fase berikutnya |
| 6 | **Akun Instagram/TikTok** resmi | Katalog menyebut "Deflected.apprl", belum dikonfirmasi sebagai handle | Admin > Pengaturan |
| 7 | **Kredensial Google Sheets** (spreadsheet + service account) | Integrasi siap dan sudah diuji dengan mock | Lihat docs/DEPLOYMENT.md |
| 8 | **Akun Cloudflare + Neon + akses domain deflected.id** | Untuk deploy | docs/DEPLOYMENT.md |
| 9 | **Persetujuan biaya** Cloudflare Workers Paid (US$5/bulan) | Paket gratis tidak cukup untuk aplikasi ini | docs/DEPLOYMENT.md |
| 10 | Logo PNG transparan dan favicon resmi (opsional) | Logo vektor sudah dipakai; PNG untuk data terstruktur Google | Admin > Pengaturan |
| 11 | Konfirmasi alamat dan link Google Maps yang tepat | Link Maps saat ini berupa pencarian alamat | Admin > Pengaturan |
| 12 | Tahun pengerjaan proyek portofolio (opsional) | Menambah konteks portofolio | Admin > Portofolio |

## Fase berikutnya (disarankan)

- Kalkulator estimasi harga dengan aturan yang dapat dikonfigurasi admin (setelah item 5).
- Autentikasi dua faktor untuk owner.
- Halaman studi kasus per proyek dengan cerita kebutuhan dan hasil.
