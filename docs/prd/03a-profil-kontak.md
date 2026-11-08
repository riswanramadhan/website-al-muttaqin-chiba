# PRD-03a · Tentang, Kontak, Galeri, FAQ & Privasi (modul `about`)

Lingkup: `/about`, `/contact`, `/gallery`, `/faq`, `/privacy`. Baca `CLAUDE.md` dulu. Peta memakai
`LeafletMap` dari `@/components/shared/map`.

## File yang dimiliki modul ini
- `src/components/about/*` (ekspor publik lewat `src/components/about/index.ts`)
- `src/app/[locale]/(site)/{about,contact,gallery,faq,privacy}/page.tsx`
- `src/actions/contact.ts`
- `src/data/faq.ts` (perluas ke ≥ 18 FAQ di 6 kategori), `src/data/gallery.ts` (boleh tambah item dengan
  SVG placeholder yang ada), `src/data/profile.ts` (boleh melengkapi `board`, `timeline`, `facilities`)
- `src/messages/{ja,en,id}/{about,contact,gallery,faq,privacy}.json`

## Kontrak ekspor (dipakai beranda)
```ts
export { FaqAccordion } from "./faq-accordion";   // Client: { items: FaqItem[]; locale: Locale; searchable?: boolean }
export { GalleryGrid } from "./gallery-grid";     // Client: { items: GalleryItem[]; locale: Locale; limit?: number }
export { ContactCard } from "./contact-card";     // Server: { locale: Locale; tone?: "default" | "inverse" }
export { PartnersStrip } from "./partners-strip"; // Server: { locale: Locale }
export { StatsRow } from "./stats-row";           // Server: { locale: Locale; tone?: "default" | "inverse" } (angka count-up: kapasitas, program, bahasa, tahun)
```

## `/about`
Hero dua warna; profil (`profile.description`); visi & misi (4 pilar: ibadah, muallaf, pendidikan generasi
muda, ekonomi halal & dialog budaya) sebagai `NumberedItem`; sejarah (`timeline` sebagai garis waktu
vertikal); mitra (`PartnersStrip`: Chiba Islamic Culture Center, Dompet Dhuafa, Dompet Dhuafa Japan);
pengurus (`board` dengan avatar inisial bila tanpa foto); fasilitas (`facilities` dengan ikon lucide sesuai
`icon`); `StatsRow`; tata kelola & transparansi (tautan `/transparency`); ajakan bergabung sebagai relawan
(tautan ke kontak dengan subjek relawan).

## `/contact`
`ContactCard` (alamat 3 bahasa, kode pos, jam buka, telepon, WhatsApp, email, tombol salin alamat Jepang);
`LeafletMap` dengan marker masjid; akses: stasiun terdekat (`nearestStations`), rute dari Tokyo/Ueno/
Kashiwa/Narita (teks di pesan), parkir (terbatas; sepeda), tombol "Buka di Google Maps" dan "Rute";
formulir kontak (nama, email, subjek pilihan: umum/kunjungan/media/relawan/kerja sama, pesan, persetujuan,
honeypot) → `sendContactMessage` (tabel `contact_messages` atau fallback `mailto:`/WhatsApp); jam layanan
sekretariat; media sosial.

## `/gallery`
`GalleryGrid`: masonry/grid responsif, filter kategori, lightbox (`Dialog`) dengan navigasi kiri/kanan &
keyboard, teks alt per bahasa, lazy loading `next/image` (SVG placeholder memakai `unoptimized`); tautan
Instagram.

## `/faq`
`FaqAccordion` dengan kotak cari dan filter kategori (umum, salat, donasi, pendatang, program, kunjungan);
deep link `#faq-id` membuka item; JSON-LD `FAQPage`; ajakan "pertanyaan lain? hubungi kami".

## `/privacy`
Kebijakan privasi sesuai APPI Jepang (個人情報保護法) dalam 3 bahasa: data yang dikumpulkan (formulir,
push subscription, analitik tanpa cookie), tujuan (hanya keperluan masjid), penyimpanan (Supabase, Vercel),
hak pengguna (akses/hapus; kontak email), pihak ketiga (YouTube embed, OpenStreetMap, Turnstile), cookie
(hanya preferensi bahasa/tema), tanggal berlaku, kontak. Tulis sebagai `RichText` dari pesan.

## Pesan
Namespace `about`, `contact`, `gallery`, `faq`, `privacy`. Isi ketiga bahasa.

## Selesai berarti
typecheck, lint, test, build lulus; peta tampil tanpa error SSR; lightbox bisa dioperasikan keyboard;
formulir kontak bekerja dengan fallback. Laporkan file yang dibuat.
