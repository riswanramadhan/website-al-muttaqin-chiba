# Al Muttaqin Cultural Center — Web Publik

Situs resmi tiga bahasa (日本語 / English / Bahasa Indonesia), App Jamaah (PWA yang bisa di-install dan
bekerja offline), dan panel admin untuk Al Muttaqin Cultural Center, masjid & pusat budaya Islam
di Matsudo, Chiba. Dibangun mengikuti `docs/prd/00-master.md`.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000 (dialihkan ke `/ja`, `/en`, atau `/id` sesuai bahasa browser).

Perintah lain:

| Perintah            | Fungsi                                              |
| ------------------- | --------------------------------------------------- |
| `npm run build`     | Build produksi (Turbopack)                          |
| `npm run start`     | Jalankan hasil build                                |
| `npm run typecheck` | Pemeriksaan TypeScript                              |
| `npm run lint`      | ESLint                                              |
| `npm test`          | Tes unit (waktu salat, kalender Hijriah)            |
| `npm run icons`     | Buat ikon PWA PNG dari `public/icons/icon.svg`      |

## Konfigurasi

Salin `.env.example` ke `.env.local`. Semua variabel opsional:

- Tanpa Supabase, situs memakai data seed di `src/data/*` dan formulir jatuh ke WhatsApp.
- Dengan Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), jalankan
  `supabase/migrations/0001_init.sql` lalu `0002_admin.sql`; konten yang diterbitkan admin menggantikan seed.

## Panel admin (`/admin`)

- Tanpa Supabase, `/admin` terbuka dalam mode demo: data seed hanya-baca dan tombol simpan nonaktif.
- Admin pertama dibuat manual: buat pengguna di Supabase Auth, lalu tambahkan barisnya ke tabel
  `admins` dengan peran `super_admin`. Admin berikutnya diundang dari `/admin/admins`.
- `SUPABASE_SERVICE_ROLE_KEY` diperlukan untuk mengundang admin, melihat semua admin, dan statistik push.
- Tambahkan `<NEXT_PUBLIC_SITE_URL>/admin/auth/callback` ke daftar Redirect URLs di Supabase Auth
  agar magic link dan undangan bisa masuk.
- Bahasa UI admin: Indonesia atau Jepang (tombol ID/JA di header).
- Web Push memerlukan kunci VAPID (`npx web-push generate-vapid-keys`) dan pemicu tiap 5 menit ke
  `/api/push/send` (lihat bagian berikut).
- Anti-spam: Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`).

## Pengingat adzan (pemicu tiap 5 menit)

Paket Vercel Hobby hanya mengizinkan cron harian, jadi `vercel.json` sengaja tanpa `crons`.
Pengingat adzan, iqamah, dan Jumat dipicu dari penjadwal luar yang gratis, misalnya
[cron-job.org](https://cron-job.org):

1. Isi `PUSH_CRON_SECRET` di Environment Variables Vercel dengan string acak panjang, lalu redeploy.
2. Di cron-job.org buat job baru: URL `https://<domain>/api/push/send`, metode `GET`, jadwal tiap 5 menit.
3. Di tab Advanced tambahkan header `Authorization` bernilai `Bearer <PUSH_CRON_SECRET>`.
4. Klik "Test run". Respons yang benar berbentuk `{"ok":true,"sent":0,...}`; `401` berarti header salah.

Bila nanti memakai Vercel Pro, cron bawaan bisa dipakai lagi dengan menambahkan ke `vercel.json`:
`"crons": [{ "path": "/api/push/send", "schedule": "*/5 * * * *" }]` dan mengisi `CRON_SECRET`.

## Struktur

```text
src/
  app/[locale]/(site)/   halaman web publik
  app/[locale]/app/      App Jamaah (PWA, navigasi bawah)
  app/[locale]/offline   fallback offline
  app/api/               prayer, push, search, revalidate
  app/sw.ts              service worker (Serwist)
  components/ui          komponen dasar (tombol, kartu, dialog, ...)
  components/site|app    header, footer, shell App
  components/<modul>     komponen per fitur
  data/                  data seed tiga bahasa
  lib/                   prayer (adhan), hijri, data layer, actions, supabase
  messages/{ja,en,id}/   teks antarmuka per namespace
docs/prd/                PRD induk dan spesifikasi modul
supabase/migrations/     skema database + RLS
```

## Konten yang harus diisi pengurus

Lihat `docs/CONTENT-TODO.md` (alamat persis, rekening, logo, foto, jadwal khatib, dan sebagainya).

## Deploy

Vercel + GitHub (preview per branch). Atur `NEXT_PUBLIC_SITE_URL` ke domain produksi agar sitemap,
hreflang, dan manifest benar.
