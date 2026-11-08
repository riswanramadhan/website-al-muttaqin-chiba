# PRD-04 · Jadwal Salat & Jumat (modul `prayer`)

Lingkup: halaman situs `/prayer-times` dan `/jumuah`, layar App `/app/prayer`, API jadwal & ICS,
dan komponen salat yang dipakai ulang oleh beranda & App. Baca `CLAUDE.md` dulu.

## File yang dimiliki modul ini
- `src/components/prayer/*` (ekspor publik lewat `src/components/prayer/index.ts`)
- `src/app/[locale]/(site)/prayer-times/page.tsx`
- `src/app/[locale]/(site)/jumuah/page.tsx`
- `src/app/[locale]/app/prayer/page.tsx`
- `src/app/api/prayer/route.ts` (JSON 30 hari) dan `src/app/api/prayer/calendar.ics/route.ts`
- `src/messages/{ja,en,id}/prayer.json`, `jumuah.json`
Pustaka yang dipakai (jangan diubah): `@/lib/prayer`, `@/lib/hijri`, `@/lib/data` (`getPrayerConfig`,
`getProfile`, `getJumuahThisWeek`, `getUpcomingJumuah`, `getPastJumuah`).

## Kontrak ekspor (dipakai modul beranda & App home, jangan ubah nama/props)
```ts
// src/components/prayer/index.ts
export { PrayerTodayCard } from "./prayer-today-card";      // Server: { locale: Locale; variant?: "site" | "hero" | "app" }
export { NextPrayerCountdown } from "./next-prayer-countdown"; // Client: { config: PrayerConfig; coordinates: GeoPoint; variant?: "site" | "hero" | "app" }
export { PrayerArc } from "./prayer-arc";                    // Client SVG: { config: PrayerConfig; coordinates: GeoPoint; className?: string; tone?: "default" | "inverse" }
export { JumuahCard } from "./jumuah-card";                  // Server: { locale: Locale; compact?: boolean; tone?: "default" | "inverse" }
export { PrayerTimesTable } from "./prayer-times-table";     // Server: { locale: Locale; year: number; month: number; highlightToday?: boolean }
export { HijriDateBadge } from "./hijri-date-badge";         // Server: { locale: Locale; withArabic?: boolean; tone?: "default" | "inverse" }
```
`PrayerTodayCard` adalah kartu lengkap: tanggal Masehi + Hijriah, salat berikutnya dengan hitung
mundur (client), daftar 6 waktu hari ini dengan iqamah, penanda waktu yang sedang berlangsung,
dan `PrayerArc`. `variant="hero"` memakai warna inverse (di atas hero hitam), `variant="app"` ringkas.

## Fitur halaman `/prayer-times`
1. Hero section gelap: judul dua warna, `HijriDateBadge`, `PrayerTodayCard variant="hero"`.
2. Tabel bulanan (`PrayerTimesTable`) dengan navigasi bulan sebelumnya/berikutnya (tautan query
   `?month=YYYY-MM`), baris hari ini disorot, Jumat ditandai, kolom Imsak muncul saat mode Ramadan
   (`isRamadan`), tombol cetak (`window.print`, gaya `print:` Tailwind) dan unduh ICS (`/api/prayer/calendar.ics?locale=`).
3. Kartu "Cara membaca jadwal": metode hitung (`METHOD_LABELS`), mazhab, koreksi menit, aturan iqamah,
   catatan Jumat, dan tautan ke App untuk notifikasi adzan.
4. Kartu waktu sunnah: tengah malam & sepertiga malam terakhir (`sunnah` di `DailyPrayerTimes`), Duha
   (sunrise + 15 menit), waktu larangan salat (setelah Subuh sampai syuruk, setelah Asar sampai Maghrib).
5. Mode Ramadan: bila `isRamadan`, tampilkan kartu imsakiyah (Imsak = Subuh - 10 menit, Iftar = Maghrib)
   dan hitung mundur berbuka.

## Fitur halaman `/jumuah`
- Kartu Jumat pekan ini (khatib, imam, jam khutbah, bahasa, tema), hitung mundur ke khutbah (client),
  daftar Jumat mendatang, arsip Jumat sebelumnya, adab Jumat (datang awal, mandi, Al-Kahfi, salawat),
  info praktis (parkir terbatas, area perempuan, tempat sepatu, penitipan anak), tautan ICS.

## Layar App `/app/prayer`
- `AppScreenHeader`, `PrayerTodayCard variant="app"`, pilihan hari (hari ini / besok / 7 hari),
  tabel 7 hari ringkas, kartu Jumat ringkas, catatan "jadwal tersimpan offline 30 hari" (ambil dari
  `/api/prayer` lalu simpan di `localStorage` kunci `acc-prayer-30d`; saat offline baca dari sana).

## API
- `GET /api/prayer?days=30` → `{ generatedAt, config: { method, madhab }, coordinates, days: SerializedDay[] }`
  memakai `getUpcomingSchedule` + `serializeDay`; header `Cache-Control: public, max-age=3600`.
- `GET /api/prayer/calendar.ics?locale=id&days=30` → file `text/calendar` berisi VEVENT setiap salat
  (ringkasan "Subuh 05:12 · Al Muttaqin", alarm 10 menit sebelum iqamah), zona waktu Asia/Tokyo.

## Pesan (namespace `prayer`, `jumuah`)
Sertakan nama salat (fajr/sunrise/dhuhr/asr/maghrib/isha dalam 3 bahasa + Arab di `prayer.names.*`,
`prayer.arabic.*`), label iqamah, countdown ("Menuju {prayer}"), "sedang berlangsung", ramadan, sunnah,
tabel (hari, tanggal), tombol (print, ics, bulan), metadata halaman, catatan. Isi ketiga bahasa.

## Selesai berarti
`npm run typecheck && npm run lint && npm test && npm run build` lulus; halaman tampil benar di 360 px dan
1280 px; hitung mundur berjalan dan berganti ke Subuh besok setelah Isya; ICS valid (bisa diimpor ke
Google Calendar). Laporkan daftar file yang dibuat.
