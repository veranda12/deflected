# Keamanan

| Area | Implementasi | Lokasi |
|---|---|---|
| Password | PBKDF2-HMAC-SHA256, 600.000 iterasi, salt 16 byte, format bisa di-upgrade. Minimal 12 karakter huruf + angka. | `src/lib/crypto.ts`, `src/lib/validation.ts` |
| Sesi | Token acak 32 byte di cookie `HttpOnly`, `Secure` (produksi), `SameSite=Lax`, prefix `__Host-`. Database hanya menyimpan SHA-256 token. Kedaluwarsa absolut 12 jam, idle 2 jam. Sesi lama batal setelah ganti password atau akun dinonaktifkan. | `src/lib/auth.ts` |
| Otorisasi | `requireAdmin()` dipanggil di layout **dan** setiap halaman admin, setiap Server Action (`runAdmin`), dan setiap Route Handler admin. Tidak bergantung pada middleware/proxy. Peran `owner` vs `editor` dicek di server. | `src/lib/admin-guard.ts` |
| Brute force | Rate limit login 20/15 menit per IP dan 10/15 menit per email (tabel Postgres, berlaku lintas instance). Akun dikunci 15 menit setelah 8 kegagalan berturut-turut. Hash dummy dijalankan untuk email tak dikenal agar waktu respons tidak membocorkan akun. | `src/app/admin/login/actions.ts`, `src/lib/rate-limit.ts` |
| CSRF | Server Actions: cek Origin bawaan Next.js + cek ulang Origin wajib ada dan sama host (`runAdmin`, form inquiry). Route handler upload: cek Origin. Cookie `SameSite=Lax`. Endpoint ekspor CSV hanya GET baca-saja. | `src/lib/admin-guard.ts`, `src/lib/request.ts` |
| Validasi input | Zod di server untuk semua form; panjang maksimum di setiap field; slug regex; UUID dicek sebelum query. | `src/lib/validation.ts`, `*/actions.ts` |
| SQL injection | Drizzle ORM dengan query berparameter; SQL mentah hanya lewat template `sql\`\`` yang juga berparameter. | `src/db`, `src/lib/rate-limit.ts` |
| XSS | Konten admin dirender sebagai teks oleh React (tidak ada HTML dari pengguna). JSON-LD di-escape (`<`). CSP membatasi sumber script, style, gambar, frame, form. | `src/lib/seo.tsx`, `next.config.ts` |
| Upload | Maks 5 MB/file, 10 file/unggahan, 60 unggahan/10 menit per admin. Tipe dideteksi dari magic bytes (JPG, PNG, WebP, AVIF), bukan dari nama/MIME browser. Nama file disimpan sebagai UUID buatan server. Target ID diverifikasi ada sebelum menulis. | `src/app/api/admin/media/route.ts`, `src/lib/image-meta.ts` |
| Path traversal | Key media wajib cocok regex ketat; driver lokal juga memastikan path berada di dalam direktori upload. | `src/lib/storage.ts` |
| IDOR | Semua ID dari URL/form divalidasi format UUID dan dicari ulang di server; tidak ada data milik pengguna lain karena admin berbagi satu ruang kerja, tetapi aksi khusus owner (pengaturan, pengguna, hapus inquiry, security center) dicek peran. | aksi admin |
| Header | CSP, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (produksi), `X-Robots-Tag: noindex` + `no-store` untuk `/admin`. | `next.config.ts` |
| Error | Pesan generik ke pengguna; detail hanya ke log server. | `runAdmin` |
| Rahasia | Hanya di environment variable/secret hosting. Tidak pernah ditampilkan di admin atau dikirim ke browser (`server-only`). | `.env.example` |
| Spam form | Honeypot, token waktu bertanda tangan HMAC (minimal 2,5 detik, maksimal 24 jam), rate limit 5 inquiry/10 menit per IP. | `src/lib/form-token.ts` |
| Endpoint internal | `/api/cron/*` butuh `Authorization: Bearer CRON_SECRET` (dibandingkan constant-time). | `src/app/api/cron/[job]/route.ts` |
| Audit | Setiap perubahan admin dicatat (siapa, apa, kapan). Event keamanan: login berhasil/gagal, kunci akun, rate limit, akses ditolak, ganti password, logout, spam diblokir. | `src/lib/audit.ts`, Security Center |
| Privasi | IP disimpan sebagai HMAC terpotong, bukan IP asli. Retensi: event keamanan 90 hari, audit 365 hari. Owner bisa menghapus inquiry atas permintaan pelanggan. | `src/app/api/cron/[job]/route.ts` |

## Security Center

Menampilkan ringkasan 7 hari, IP (hash) dengan 5+ login gagal dalam 24 jam, log event dengan filter, dan audit
perubahan. Ini alat pemantauan berbasis aturan sederhana, **bukan** sistem deteksi serangan menyeluruh.

## Keterbatasan yang diketahui

- `script-src` memakai `'unsafe-inline'` karena Next.js menyisipkan skrip inline; CSP berbasis nonce akan memaksa semua halaman dirender dinamis tanpa cache. Risiko XSS tetap rendah karena tidak ada HTML dari pengguna yang dirender.
- Pesan "akun dikunci" mengungkap bahwa email tersebut terdaftar. Trade-off yang disengaja agar admin tahu kenapa tidak bisa masuk.
- Belum ada 2FA. Disarankan untuk fase berikutnya bila jumlah admin bertambah.
- Media yang dilepas dari produk tidak otomatis dihapus dari storage (aman, hanya memakan ruang).
