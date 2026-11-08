# PRD-07b · Beranda App, Pengaturan, Pencarian & PWA (modul `pwa`)

Lingkup: beranda App `/app`, `/app/settings`, pencarian global (`/search` + dialog Cmd+K), prompt install,
notifikasi push (API + preferensi), dan pemasangan `PwaProvider`. Baca `CLAUDE.md`.

## File yang dimiliki modul ini
- `src/components/pwa/*`, `src/components/search/*`
- `src/app/[locale]/app/page.tsx` (ganti placeholder), `src/app/[locale]/app/settings/page.tsx`
- `src/app/[locale]/(site)/search/page.tsx`
- `src/app/api/push/subscribe/route.ts`, `src/app/api/push/send/route.ts`, `src/app/api/search/route.ts`
- Boleh mengganti isi `src/components/site/search-trigger.tsx` (menjadi pembuka dialog pencarian).
- Boleh menambahkan `<PwaProvider>` (dari `@/components/shared/pwa-provider`) dan komponen prompt install ke
  `src/app/[locale]/layout.tsx` (satu-satunya perubahan yang diizinkan di layout).
- `src/messages/{ja,en,id}/{settings,search,pwa}.json` (pwa & search sudah ada: lengkapi, jangan hapus kunci).

## Beranda App `/app`
Salam + nama masjid + `HijriDateBadge`; `PrayerTodayCard variant="app"` (dari `@/components/prayer`);
`JumuahCard compact`; grid pintasan 8 ikon (`APP_SCREENS` + `SCREEN_ICONS`); pengumuman terbaru 3 item
(`AnnouncementList compact`); kartu "Kajian live/terbaru" (`LiveStatusBanner`); hadis hari ini; kartu
infaq cepat (`DonateCta`); prompt install (`InstallPrompt`) bila belum terpasang; indikator offline
(`OfflineBadge`, memakai `navigator.onLine` + event). Pastikan beranda App tetap terbuka offline (data
jadwal dihitung di perangkat; konten lain dari cache SW).

## Pengaturan `/app/settings`
Bahasa (3 tombol), tema (`useTheme`: terang/gelap/sistem/malam otomatis), notifikasi adzan: switch per
salat + pengingat iqamah (10 menit) + Jumat; tombol aktifkan (minta izin setelah klik, PRD §7), status
izin, "kirim notifikasi uji" (lewat `registration.showNotification`); lokasi untuk kiblat (gunakan lokasi
perangkat / lokasi masjid); ukuran teks Arab; hapus data tersimpan (localStorage + caches); versi aplikasi
& tautan kebijakan privasi; panduan install iOS/Android (dari pesan `pwa`).

## Notifikasi push
- `InstallPrompt` (client): tangkap `beforeinstallprompt`, tampilkan kartu di App bila belum standalone
  (`display-mode: standalone`); iOS: deteksi Safari iOS dan tampilkan langkah "Tambah ke Layar Utama".
- `usePushSubscription` hook: `PushManager.subscribe` dengan `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, kirim ke
  `POST /api/push/subscribe` `{ subscription, locale, preferences }`; `DELETE` untuk berhenti. Simpan
  preferensi juga di `localStorage` (`acc-push-prefs`). Tanpa VAPID key: tampilkan notice "belum aktif".
- `POST /api/push/send` (header `Authorization: Bearer PUSH_CRON_SECRET`): hitung waktu salat berikutnya
  dalam 10 menit ke depan (`@/lib/prayer`), ambil subscription dari Supabase (`getServiceClient`), kirim
  Web Push (`web-push`) sesuai preferensi & bahasa; hapus subscription yang 410/404. Tanpa Supabase:
  kembalikan `{ ok: true, sent: 0, reason: "no-database" }`. Tambahkan `vercel.json` dengan cron tiap 5 menit.
- Pengingat lokal saat App terbuka: `useLocalAdhanReminder` menjadwalkan `setTimeout` ke waktu salat
  berikutnya dan memanggil `registration.showNotification` bila izin diberikan (bekerja tanpa server).

## Pencarian global
- `GET /api/search?locale=id&q=` memakai `getSearchIndex()` + daftar halaman statis (judul dari `nav`),
  pencocokan sederhana (lowercase, includes, skor judul > kata kunci > ringkasan), maksimal 20 hasil.
- `SearchDialog` (client, `Dialog`): dibuka dari `SearchTrigger` dan pintasan `Ctrl/Cmd+K`, input dengan
  debounce 200 ms, hasil dikelompokkan per tipe, navigasi keyboard, riwayat 5 pencarian terakhir
  (`localStorage`), tautan ke `/search?q=` untuk hasil lengkap.
- `/search` page: server-side render hasil dari query `?q=` (panggil fungsi pencarian langsung, bukan fetch).

## Pesan
`settings`, lengkapi `search` & `pwa`. Isi ketiga bahasa.

## Selesai berarti
typecheck, lint, test, build lulus; `/serwist/sw.js` tersaji dan terdaftar (cek di browser); beranda App
offline tetap tampil; dialog pencarian berfungsi; pengaturan tersimpan. Laporkan file yang dibuat.
