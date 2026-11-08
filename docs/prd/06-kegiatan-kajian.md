# PRD-06 · Kegiatan & Kajian (modul `activities`)

Lingkup: `/lectures`, `/lectures/[slug]`, `/events`, `/events/[slug]` (+ pendaftaran dengan kuota),
`/news`, `/news/[slug]` (berita, laporan, dan pengumuman), layar App `/app/live`, `/app/agenda`, `/app/info`.
Baca `CLAUDE.md` dulu.

## File yang dimiliki modul ini
- `src/components/activities/*` (ekspor publik lewat `src/components/activities/index.ts`)
- `src/app/[locale]/(site)/{lectures,events,news}/**`
- `src/app/[locale]/app/{live,agenda,info}/page.tsx`
- `src/actions/registrations.ts`
- `src/data/{events,lectures,news,announcements}.ts` (perluas: ≥ 8 agenda termasuk beberapa yang sudah
  lewat, ≥ 9 kajian dengan beragam seri/bahasa, ≥ 5 berita/laporan, ≥ 5 pengumuman)
- `src/messages/{ja,en,id}/{lectures,events,news,live}.json`
Pakai `getEvents`, `getEventBySlug`, `getLectures`, `getLectureBySlug`, `getNews`, `getNewsBySlug`,
`getAnnouncements`, `getAnnouncementBySlug`, `getProfile` dari `@/lib/data`.

## Kontrak ekspor (dipakai beranda & App home)
```ts
export { EventCard } from "./event-card";               // Server: { event: MosqueEvent; locale: Locale; compact?: boolean }
export { LectureCard } from "./lecture-card";           // Server: { lecture: Lecture; locale: Locale }
export { NewsCard } from "./news-card";                 // Server: { post: NewsPost; locale: Locale }
export { AnnouncementList } from "./announcement-list"; // Server: { announcements: Announcement[]; locale: Locale; compact?: boolean }
export { LiveStatusBanner } from "./live-status-banner"; // Client: { channelId?: string; locale: Locale; tone?: "default" | "inverse" }
```

## `/lectures` dan `/lectures/[slug]`
- Deteksi live (`LiveStatusBanner`): bila `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` ada, tampilkan `YouTubeLiveEmbed`
  di dalam banner "Kajian sedang live" dengan jadwal kajian berikutnya; tanpa channel ID tampilkan
  kajian rutin berikutnya (dari `getEvents({ upcoming: true, category: "kajian", limit: 1 })`).
  Bila `YOUTUBE_API_KEY` tersedia, buat `src/app/api/live/route.ts` yang memanggil YouTube Data API
  `search?eventType=live` (cache 5 menit) dan banner memakainya; selain itu fallback embed.
- Daftar kajian: filter bahasa (ja/en/id/ar), filter seri, pencarian judul/pemateri (client, dari daftar
  yang dirender server), kartu dengan thumbnail YouTube, durasi, pemateri, tanggal.
- Detail kajian: `YouTubeEmbed`, deskripsi, seri, tag, kajian terkait, tombol bagikan, tautan kanal.
- Kajian asatidz: bagian tautan kanal rujukan (YouTube) sebagai kartu (tanpa emoji).
- Materi: tautan Google Drive materi kajian (placeholder di pesan).

## `/events` dan `/events/[slug]`
- Tab Mendatang / Sudah lewat; filter kategori (`EventCategory`); kartu agenda dengan tanggal besar
  (hari, tanggal, bulan), jam JST, lokasi, bahasa (badge), sisa kuota, badge "pendaftaran dibuka".
- Detail agenda: deskripsi (`RichText`), info praktis, peta kecil tidak perlu (cukup tautan Google Maps),
  tombol "Tambah ke kalender" (tautan Google Calendar + unduh `.ics` lewat route
  `src/app/api/events/[slug]/calendar.ics/route.ts`), bagikan.
- Formulir pendaftaran (bila `registration.required`): nama, kontak, jumlah peserta, catatan, persetujuan;
  tampilkan sisa kuota, status penuh → daftar tunggu; Server Action `registerForEvent` menyimpan ke
  `event_registrations` bila Supabase aktif, selain itu fallback WhatsApp (`buildWhatsAppUrl`).
- Agenda rutin: bagian "Kegiatan rutin" (kajian Sabtu, TPA Minggu, kelas bahasa Rabu) dari program.

## `/news` dan `/news/[slug]`
- Gabungkan pengumuman (`getAnnouncements`) dan berita (`getNews`) dalam satu halaman dengan tab
  Semua / Pengumuman / Berita / Laporan; pengumuman tersemat tampil paling atas dengan badge.
- Detail: `RichText`, tanggal, penulis, kategori, bagikan, berita terkait. `[slug]` harus melayani slug
  pengumuman maupun berita (cari di keduanya; tidak ada → `notFound()`).

## Layar App
- `/app/live`: banner live + daftar 5 kajian terbaru (tap → buka detail di web dalam tab baru atau embed).
- `/app/agenda`: agenda mendatang ringkas + tombol "Tambah ke kalender".
- `/app/info`: pengumuman (tersemat dulu), tombol bagikan (`navigator.share`), penanda "baru" untuk yang
  terbit < 7 hari.

## Pesan
Namespace `lectures`, `events`, `news`, `live`: judul, filter, label, formulir, kuota, kalender, meta.
Isi ketiga bahasa.

## Selesai berarti
typecheck, lint, test, build lulus; semua slug di data punya halaman; formulir pendaftaran bekerja dengan
fallback WhatsApp; tampilan rapi di 360 px & 1280 px. Laporkan file yang dibuat.
