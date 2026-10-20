# Deployment ke deflected.id

Belum ada yang di-deploy atau dibeli. Semua langkah di bawah menunggu persetujuan.

## Rekomendasi infrastruktur

| Komponen | Pilihan | Biaya | Catatan |
|---|---|---|---|
| Hosting | **Cloudflare Workers Paid** (via OpenNext) | US$5/bulan, termasuk 10 juta request dan 30 juta CPU-ms | Lihat "Kenapa bukan paket gratis" di bawah. |
| Database | **Neon Free** (PostgreSQL) | US$0 untuk mulai: 100 CU-jam/bulan, 0,5 GB storage | Jika melewati batas: paket Launch berbasis pemakaian, sekitar US$0,106/CU-jam + US$0,35/GB-bulan, tanpa minimum. |
| Gambar | **Cloudflare R2** | US$0 dalam kuota gratis 10 GB storage | Tanpa biaya egress. Katalog saat ini sekitar 1 MB. |
| Optimasi gambar | Cloudflare Images binding | Kuota transformasi gratis bulanan, cek dashboard | Bisa dimatikan dengan `images.unoptimized` jika kuota habis. |
| SSL | Cloudflare | Gratis | Otomatis setelah domain memakai nameserver Cloudflare. |
| Domain | deflected.id | Biaya registrar .id per tahun | Di luar Cloudflare (registrar PANDI); nameserver diarahkan ke Cloudflare. |
| Google Sheets | Service account Google Cloud | Gratis | Sheets API tidak berbayar untuk volume ini. |
| Cron (retry Sheets, retensi log) | GitHub Actions terjadwal atau cron-job.org | Gratis | Workflow sudah disiapkan di `.github/workflows/cron.yml`. |

**Perkiraan total:** sekitar US$5/bulan + domain, selama trafik dan database dalam kuota gratis.
Harga dicek 18 Oktober 2026 dari halaman resmi Cloudflare Workers dan Neon; konfirmasi ulang sebelum membeli.

### Kenapa bukan paket gratis Workers

Paket gratis membatasi **10 ms CPU per request**. Render server Next.js dan hashing password (PBKDF2 600.000 iterasi)
butuh lebih dari itu, sehingga halaman bisa gagal acak. Bundle server juga sekitar 1,6 MB gzip, mendekati batas
3 MB paket gratis. Paket Paid ($5) memberi 30 detik CPU per request dan batas bundle 10 MB.

### Alternatif jika tidak ingin Cloudflare

- **VPS kecil** (misalnya 1 vCPU / 1 GB, sekitar Rp 60–100 ribu/bulan) dengan `npm run build && npm start`, PostgreSQL di server yang sama, `STORAGE_DRIVER=local`. Paling sederhana, tapi perlu perawatan server.
- **Vercel Hobby tidak dipakai** karena melarang penggunaan komersial; Vercel Pro US$20/bulan.
- **Supabase Free** bisa menggantikan Neon, tetapi proyek gratis dijeda setelah tidak aktif seminggu, berisiko untuk produksi.

### Batasan yang diketahui

- OpenNext memberi peringatan bahwa build di Windows tidak sepenuhnya didukung. Jalankan `cf:build`/`cf:deploy` dari WSL, Linux, atau CI.
- `wrangler` membutuhkan Node.js 22+. Mesin pengembangan saat ini Node 20, jadi `wrangler dev`/`deploy` belum diuji di sini. `opennextjs-cloudflare build` sudah berhasil.

## Langkah deploy (setelah disetujui)

1. **Database (Neon):** buat proyek region Singapura (`aws-ap-southeast-1`), salin connection string *pooled*.
   Jalankan migrasi dari laptop: `DATABASE_URL=... npm run db:migrate`, lalu `DATABASE_URL=... SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... STORAGE_DRIVER=r2 npm run db:seed`.
2. **Cloudflare:** buat akun, aktifkan Workers Paid, lalu:
   ```bash
   npx wrangler login
   npx wrangler r2 bucket create deflected-media
   npx wrangler r2 bucket create deflected-opennext-cache
   npm run media:upload-r2
   ```
3. **Secrets** (sekali saja):
   ```bash
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put AUTH_SECRET      # string acak >= 32 karakter
   npx wrangler secret put CRON_SECRET
   npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
   npx wrangler secret put GOOGLE_PRIVATE_KEY
   npx wrangler secret put GOOGLE_SHEETS_ID
   ```
   Opsional dan disarankan: buat Hyperdrive untuk koneksi Neon, lalu aktifkan blok `hyperdrive` di `wrangler.jsonc`.
4. **Deploy:** `npm run cf:deploy` (dari WSL/Linux/CI, Node 22).
5. **Domain:** tambahkan `deflected.id` ke Cloudflare, ganti nameserver di registrar, lalu di Workers > Settings > Domains tambahkan `deflected.id` dan `www.deflected.id` (redirect `www` ke apex lewat Redirect Rule).
6. **Cron:** di GitHub repo, isi secret `SITE_URL` dan `CRON_SECRET`. Workflow memanggil `/api/cron/sheets-sync` tiap 15 menit dan `/api/cron/maintenance` harian.
7. **Search Console:** daftarkan `https://deflected.id`, kirim `https://deflected.id/sitemap.xml`.
8. **Setelah live:** login admin, ganti password, isi URL Instagram dan data lain di **Pengaturan**.

## Google Sheets

Alur: form situs > server (validasi, anti-spam) > PostgreSQL > Google Sheets.

1. Google Cloud Console: buat proyek, aktifkan **Google Sheets API**.
2. Buat **service account**, buat key JSON. Dari file JSON ambil `client_email` dan `private_key`.
3. Buat spreadsheet, beri nama tab `Inquiry`, isi baris 1 dengan judul kolom:
   `Ref | Tanggal | Nama | Perusahaan | WhatsApp | Email | Produk | Jumlah | Bahan | Finishing | Target | Catatan | Status`.
4. Share spreadsheet ke email service account sebagai **Editor**.
5. Isi `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (dengan `\n`), `GOOGLE_SHEETS_ID` (bagian ID dari URL sheet).

Perilaku:
- Inquiry selalu disimpan ke database dulu. Pengunjung mendapat konfirmasi berdasarkan penyimpanan database, bukan Sheets.
- Sinkronisasi berjalan setelah respons terkirim. Gagal: status `Gagal` + pesan error di detail inquiry, dicoba ulang oleh cron (maks 8 kali) atau tombol **Sinkronkan ulang**.
- Duplikat dicegah: setiap percobaan ulang mengecek kolom Ref di sheet sebelum menambah baris.
- Isi sel yang diawali `= + - @` diberi tanda kutip agar tidak dieksekusi sebagai formula.
- Jika kredensial kosong, status menjadi `Nonaktif` dan akan disinkronkan otomatis begitu kredensial diisi.
