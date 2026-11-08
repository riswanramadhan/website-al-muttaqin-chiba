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
- Web Push memerlukan kunci VAPID (`npx web-push generate-vapid-keys`) dan pemicu tiap menit ke
  `/api/push/send` (lihat bagian berikut).
- Anti-spam: Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`).

## Pengingat adzan (pemicu tiap menit)

Ada dua jalur, keduanya memakai perhitungan yang sama (`src/components/pwa/reminders.ts`):
adzan tepat pada menit adzan, iqamah 10 menit sebelum iqamah, Jumat 30 menit sebelum Jumatan.

**Saat App terbuka** (layar mana pun di `/app`, juga di tab latar belakang): `AdhanReminderHost` di
`src/app/[locale]/app/layout.tsx` mencocokkan jadwal dengan jam setiap 20 detik (plus timer presisi
menjelang waktunya, dan saat tab aktif kembali), lalu menampilkan notifikasi sistem lewat service
worker, memutar suara pilihan di Pengaturan (adzan penuh dari `public/audio/adhan.mp3`, chime
Web Audio, getar saja, atau senyap), dan menampilkan banner dengan tombol Hentikan. Tiap kejadian
diklaim lewat tag di localStorage (`acc-reminder-fired`) sehingga hanya berbunyi sekali walau ada
beberapa tab atau push server ikut tiba. Browser memblokir suara sebelum ada interaksi; App membuka
kunci audio pada ketukan pertama, dan banner menampilkan tombol Putar bila suara tetap diblokir.

**Saat App tertutup** (Web Push dari server): paket Vercel Hobby hanya mengizinkan cron harian, jadi
`vercel.json` sengaja tanpa `crons`. Pengingat dipicu dari penjadwal luar yang gratis, misalnya
[cron-job.org](https://cron-job.org):

1. Isi `PUSH_CRON_SECRET` di Environment Variables Vercel dengan string acak panjang, lalu redeploy.
2. Di cron-job.org buat job baru: URL `https://<domain>/api/push/send`, metode `GET`,
   jadwal **tiap menit** (`* * * * *`). Zona waktu job tidak berpengaruh.
3. Di tab Advanced tambahkan header `Authorization` bernilai `Bearer <PUSH_CRON_SECRET>`.
4. Klik "Test run". Respons yang benar berbentuk `{"ok":true,"sent":0,...}`; `401` berarti header salah.

Setiap panggilan mengirim kejadian yang waktu tampilnya jatuh di menit berjalan
(`[awal menit, +1 menit)`; waktu salat dibulatkan ke menit), sehingga notifikasi tiba beberapa detik
setelah menit adzan dimulai. Jendela berurutan tidak tumpang tindih dan retry di menit yang sama
diabaikan, jadi tiap kejadian terkirim sekali. Bila penjadwal hanya bisa tiap 5 menit, pakai URL
`/api/push/send?interval=5` (atau env `PUSH_CRON_INTERVAL_MIN=5`): kejadian dikirim paling awal
5 menit sebelum waktunya, tidak pernah terlambat. TTL push adzan 5 menit agar perangkat yang lama
offline tidak menerima pengingat basi.

Service worker (`src/app/sw.ts`) menampilkan notifikasi adzan dengan `requireInteraction`, pola getar,
`renotify`, dan tombol "Buka jadwal" / "Tutup"; bila jendela App sedang terbuka, SW juga mengirim
pesan agar halaman memutar suara adzan. **Batasan browser:** notifikasi push latar belakang tidak bisa
memakai suara kustom (adzan); perangkat memakai suara notifikasi standarnya. Di iPhone, notifikasi
hanya bekerja setelah App ditambahkan ke Layar Utama (iOS 16.4+).

Alternatif tanpa cron-job.org, memakai Supabase `pg_cron` + `pg_net` (aktifkan kedua ekstensi di
Database > Extensions, lalu jalankan di SQL Editor):

```sql
select cron.schedule(
  'acc-push-adhan',
  '* * * * *',
  $$
  select net.http_get(
    url := 'https://<domain>/api/push/send',
    headers := jsonb_build_object('Authorization', 'Bearer <PUSH_CRON_SECRET>')
  );
  $$
);
-- Menghentikan: select cron.unschedule('acc-push-adhan');
```

Bila nanti memakai Vercel Pro, cron bawaan bisa dipakai lagi dengan menambahkan ke `vercel.json`:
`"crons": [{ "path": "/api/push/send", "schedule": "* * * * *" }]` dan mengisi `CRON_SECRET`.

Rekaman adzan: Wikimedia Commons, CC BY-SA 4.0 (lihat `public/audio/CREDITS.md`).

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
