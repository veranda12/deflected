# deflected.id

Website perusahaan dan panel admin DEFLECTED (DFLCTD): corporate apparel, jersey, seragam, dan merchandise kustom.

- **Publik:** Beranda, Tentang, Layanan, Katalog (kategori, pencarian, filter, detail produk), Portofolio (detail + viewer foto), Kontak (form penawaran), Kebijakan privasi.
- **Admin (`/admin`):** dashboard, inquiry (status, catatan, CSV, sinkron Google Sheets), produk, kategori, portofolio, konten halaman, FAQ, SEO, pengaturan, akun, pengguna, security center.

## Stack

Next.js 16 (App Router, TypeScript strict) · PostgreSQL + Drizzle ORM · Tailwind CSS 4 · Zod · autentikasi sesi buatan sendiri (Web Crypto) · penyimpanan gambar lokal atau Cloudflare R2 · deploy ke Cloudflare Workers via OpenNext.

## Menjalankan lokal

Butuh Node 20+ (Node 22 untuk perintah `wrangler`) dan PostgreSQL 15+.

```bash
npm install
cp .env.example .env.local        # isi DATABASE_URL, AUTH_SECRET (>=32 karakter), CRON_SECRET
npm run db:migrate                 # buat tabel
npm run db:seed                    # katalog, portofolio, FAQ, akun owner
npm run dev                        # http://localhost:3000
```

`db:seed` membuat akun owner. Jika `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` tidak diisi, password acak ditulis ke
`.dev/admin-credentials.txt` (tidak di-commit). Ganti password setelah login pertama di **Admin > Akun saya**.

### Database dev di mesin ini

Saat pengembangan, dibuat cluster PostgreSQL terpisah di `.dev/pgdata` (port 5433) agar tidak menyentuh instalasi
PostgreSQL utama. Menyalakan ulang setelah restart komputer:

```bash
pg_ctl -D .dev/pgdata -o "-p 5433" -l .dev/pg.log start
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` / `lint` | Pemeriksaan TypeScript dan ESLint |
| `npm run db:generate` / `db:migrate` | Buat dan jalankan migrasi Drizzle |
| `npm run db:seed` (`-- --reset`) | Isi data awal dari katalog klien |
| `npm run cf:build` / `cf:preview` / `cf:deploy` | Build/preview/deploy Cloudflare (lihat docs) |
| `npm run media:upload-r2` | Unggah foto seed ke bucket R2 |
| `npm run qa:screens -- <url> <outDir>` | Screenshot responsif + deteksi overflow |
| `npm run sheets:mock` | Mock Google Sheets untuk uji integrasi |

## Dokumentasi

- [DESIGN.md](DESIGN.md): design system, alasan setiap keputusan, motion.
- [docs/REFERENCE-ANALYSIS.md](docs/REFERENCE-ANALYSIS.md): hasil inspeksi hellolandbouw.id.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): infrastruktur, biaya, langkah deploy ke deflected.id, Google Sheets.
- [docs/SECURITY.md](docs/SECURITY.md): kontrol keamanan yang diterapkan.
- [docs/TESTING.md](docs/TESTING.md): apa yang sudah diuji dan hasilnya.
- [docs/CLIENT-INPUT.md](docs/CLIENT-INPUT.md): data yang masih dibutuhkan dari klien.

## Struktur

```
src/app/(site)/        halaman publik
src/app/admin/         login + panel admin (setiap halaman & aksi memanggil requireAdmin)
src/app/api/           upload media, ekspor CSV, cron
src/app/media/         penyaji gambar (R2 / lokal)
src/db/schema.ts       skema database
src/lib/               auth, crypto, rate limit, sheets, storage, settings, SEO, validasi
scripts/               seed, mock Sheets, QA screenshot, upload R2
seed-assets/images/    foto produk yang diekstrak dari katalog klien
brand-assets/          materi asli klien (PDF, logo)
```
