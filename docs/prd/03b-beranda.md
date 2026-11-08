# PRD-03b · Beranda Situs (modul `home`)

Lingkup: `src/app/[locale]/(site)/page.tsx` dan `src/components/home/*`, pesan `home`. Beranda harus
menjawab kebutuhan enam persona dalam satu kali scroll (PRD §2) memakai komponen modul lain. Baca `CLAUDE.md`.

## Komponen yang tersedia dari modul lain (impor, jangan ubah)
- `@/components/prayer`: `PrayerTodayCard`, `NextPrayerCountdown`, `PrayerArc`, `JumuahCard`, `HijriDateBadge`
- `@/components/donate`: `DonateCta`, `DonationProgress`, `DonationAccountsList`
- `@/components/activities`: `EventCard`, `LectureCard`, `NewsCard`, `AnnouncementList`, `LiveStatusBanner`
- `@/components/guides`: `DictionarySearch`, `HaramKanjiSearch`
- `@/components/programs`: `ProgramGrid`, `ProgramCard`
- `@/components/about`: `FaqAccordion`, `GalleryGrid`, `ContactCard`, `PartnersStrip`, `StatsRow`
- UI: `SectionHeading`, `SectionTag`, `TwoToneTitle`, `Card`, `NumberedItem`, `Carousel`, `CountUp`, `IconCircle`

## Urutan section (mobile-first, padding `py-16 lg:py-24`, semua judul dua warna)
1. **Hero** (`hero-surface`, pola bintang): tag tiga aksara ("مسجد · Masjid · マスジド"), judul besar dua
   baris dengan kata terakhir merah ("...di Matsudo, Chiba."), paragraf, tombol "Jadwal salat" (inverse) dan
   "Buka App Jamaah" (outlineInverse), `HijriDateBadge`; di kanan `PrayerTodayCard variant="hero"` dengan
   `PrayerArc`. Di bawah hero: strip `LiveStatusBanner` (hanya tampil bila live) dan pengumuman tersemat.
2. **Portal jamaah** (3 kartu besar, `lift`): Untuk jamaah → App, Baru di Chiba → /newcomers, Untuk donatur
   → /donate; plus kartu kecil "Butuh bantuan?" → /app/help.
3. **Jumat pekan ini**: `JumuahCard` + tiga agenda terdekat (`EventCard compact`).
4. **Layanan kami** (daftar bernomor 01-06 seperti referensi UI): salat berjamaah & Jumat, kajian 3 bahasa,
   pembinaan muallaf, TPA & pendidikan, open mosque & kunjungan, bantuan muslim baru. Setiap item tautan.
5. **Program** (`ProgramGrid limit={4}`) dengan tombol lihat semua.
6. **Kajian terbaru**: `Carousel` berisi `LectureCard` (3-4 item) + tautan kanal YouTube.
7. **Infaq**: section gelap dengan `DonateCta` + `DonationProgress limit={2}` + rekening ringkas.
8. **Statistik**: `StatsRow` (count-up) di atas latar `card-muted`.
9. **Hadis hari ini**: `getHadithOfTheDay()` dengan teks Arab (`font-arabic`) dan terjemahan.
10. **Berita & pengumuman**: 3 `NewsCard` + `AnnouncementList compact` (3 item).
11. **Baru di Chiba**: 4 kartu pintasan (lapor balai kota, sampah, halal, transportasi) + `DictionarySearch compact`
    sebagai pratinjau kamus.
12. **Galeri**: `GalleryGrid limit={6}`.
13. **FAQ**: `FaqAccordion` 5 item + tautan.
14. **Kontak & akses**: `ContactCard` + tombol WhatsApp + `PartnersStrip`.
Hormati reduced motion; animasi masuk halus (`animate-fade-up` atau Motion `whileInView` sekali).
Metadata beranda lengkap + JSON-LD `Mosque` (nama, alamat, geo, openingHours, sameAs sosial) dan
`WebSite` (potentialAction SearchAction ke `/search?q=`).

## Pesan `home`
Judul & deskripsi tiap section dalam 3 bahasa; `hero.title` + `hero.highlight` (bagian yang diwarnai);
label portal, layanan 01-06, statistik, tombol.

## Selesai berarti
typecheck, lint, test, build lulus; beranda rapi di 360/768/1280/1536 px, terang & gelap; LCP hero tanpa
gambar berat (gunakan pola CSS). Laporkan file yang dibuat.
