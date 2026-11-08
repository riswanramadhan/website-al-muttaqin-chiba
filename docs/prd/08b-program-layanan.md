# PRD-08b · Program, Peminjaman Ruangan, Mengenal Islam & Pusat Bantuan (modul `programs`)

Lingkup: `/programs`, `/programs/[slug]` (+ pendaftaran), `/booking` (peminjaman ruangan), `/islam`
(Mengenal Islam untuk pengunjung Jepang), layar App `/app/help` (pusat bantuan jamaah). Baca `CLAUDE.md`.

## File yang dimiliki modul ini
- `src/components/programs/*` (ekspor publik lewat `src/components/programs/index.ts`)
- `src/app/[locale]/(site)/programs/**`, `(site)/booking/page.tsx`, `(site)/islam/page.tsx`
- `src/app/[locale]/app/help/page.tsx`
- `src/actions/programs.ts` (pendaftaran program), `src/actions/bookings.ts`, `src/actions/suggestions.ts`
- `src/data/programs.ts` (perluas: tambah program `youth`, detail jadwal, pengajar)
- `src/messages/{ja,en,id}/{programs,booking,islam,help}.json`

## Kontrak ekspor
```ts
export { ProgramCard } from "./program-card";       // Server: { program: Program; locale: Locale }
export { ProgramGrid } from "./program-grid";       // Server: { locale: Locale; limit?: number }
export { HelpCenter } from "./help-center";         // Client: { locale: Locale; whatsapp: string; mapsUrl: string; email: string }
export { SuggestionForm } from "./suggestion-form"; // Client: { locale: Locale; defaultKind?: SuggestionKind }
```

## `/programs` dan `/programs/[slug]`
- Daftar program (`ProgramGrid`): kartu ikon lucide (`icon` di data → map ke komponen), jadwal, audiens,
  bahasa (badge), status pendaftaran.
- Detail: `RichText` deskripsi, jadwal, pengajar/kontak, syarat, FAQ program (`getFaqs("program")`),
  formulir pendaftaran (nama orang tua/peserta, usia untuk TPA, kontak, catatan, persetujuan) →
  `registerForProgram` (tabel `program_registrations` atau fallback WhatsApp).
- Bagian "Kelas muallaf": pendamping (mentor) satu-per-satu, materi bahasa Jepang, syahadat & langkah
  setelahnya; "Open mosque" & "Kunjungan sekolah": alur permintaan, durasi, kapasitas, etika berkunjung.

## `/booking` (peminjaman ruangan)
- Daftar ruangan (`getRooms`): kapasitas, fasilitas, kegunaan; aturan (gratis untuk jamaah, infaq
  sukarela, tanpa musik keras, bersih setelah pakai, maksimal 22:00), kalender ketersediaan sederhana
  (tanpa data booking nyata: tampilkan catatan "dikonfirmasi pengurus dalam 2 hari kerja").
- Formulir: ruangan, keperluan (akad nikah, akikah, seminar, rapat, lainnya), nama & kontak, tanggal,
  jam mulai/selesai, jumlah hadir, catatan, persetujuan → `requestRoomBooking` (tabel `room_bookings`
  atau fallback WhatsApp).

## `/islam` (Mengenal Islam; utamakan bahasa Jepang, tetap 3 bahasa)
Halaman pengantar ramah untuk warga Jepang: apa itu Islam (satu paragraf), rukun iman & rukun Islam
(kartu bernomor), muslim di Jepang (angka ringkas), apa yang dilakukan di masjid, adab berkunjung
(pakaian, lepas sepatu, foto, area perempuan), salah paham umum (FAQ ringkas), cara belajar lebih lanjut
(kelas muallaf, open mosque, buku/situs bahasa Jepang), kontak pembimbing, dan ajakan kunjungan.
Tanpa nada menggurui; kalimat pendek.

## `/app/help` (Pusat bantuan jamaah)
`HelpCenter`: kartu aksi besar: Tanya pengurus (buka `SuggestionForm` kind `question`), Lapor fasilitas
(kind `facility`: toilet, AC, karpet, lampu, lainnya), Saran (kind `suggestion`), Tanya ustadz (kind
`ustadz`), Darurat Jepang (tombol tel:119 dan tel:110 dengan konfirmasi, teks kalimat darurat Jepang
untuk dibacakan), Lokasi masjid (tautan Google Maps), Hubungi WhatsApp, Email. `SuggestionForm` →
`sendSuggestion` (tabel `suggestions` atau fallback WhatsApp), nama opsional (anonim).

## Pesan
Namespace `programs`, `booking`, `islam` (semua konten halaman), `help`. Isi ketiga bahasa; konten `islam`
dalam bahasa Jepang harus alami dan sopan (です・ます).

## Selesai berarti
typecheck, lint, test, build lulus; semua slug program punya halaman; tiga formulir bekerja dengan
fallback WhatsApp; tampilan rapi di 360 px & 1280 px. Laporkan file yang dibuat.
