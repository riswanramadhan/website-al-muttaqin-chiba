# PRD-08a · Panduan Muslim Baru, Halal, Kamus & Radar (modul `guides`)

Lingkup: `/newcomers`, `/halal`, `/dictionary`, layar App `/app/dictionary` dan `/app/radar`.
Baca `CLAUDE.md` dulu. Peta memakai `LeafletMap` dari `@/components/shared/map` (jangan buat peta sendiri).

## File yang dimiliki modul ini
- `src/components/guides/*` (ekspor publik lewat `src/components/guides/index.ts`)
- `src/app/[locale]/(site)/{newcomers,halal,dictionary}/page.tsx`
- `src/app/[locale]/app/{dictionary,radar}/page.tsx`
- `src/data/dictionary.ts` (perluas ke ≥ 40 entri di 5 kategori), `src/data/halal.ts` (≥ 20 kanji/bahan,
  ≥ 10 tempat di Matsudo/Kashiwa/Chiba/Tokyo timur dengan koordinat masuk akal; tandai `verified:false`
  untuk yang belum dicek)
- `src/messages/{ja,en,id}/{newcomers,halal,dictionary,radar}.json`

## Kontrak ekspor
```ts
export { HaramKanjiSearch } from "./haram-kanji-search"; // Client: { items: HaramIngredient[]; locale: Locale }
export { DictionarySearch } from "./dictionary-search";   // Client: { entries: DictionaryEntry[]; locale: Locale; compact?: boolean }
export { HalalRadar } from "./halal-radar";               // Client: { places: HalalPlace[]; locale: Locale; center: GeoPoint }
export { NewcomerChecklist } from "./newcomer-checklist"; // Client: { locale: Locale } (ceklis tersimpan di localStorage)
```

## `/newcomers` (Panduan muslim baru di Chiba)
Konten dalam tiga bahasa (tulis di pesan `newcomers` sebagai array/objek), dengan section:
1. Langkah pertama (ceklis interaktif `NewcomerChecklist`): lapor alamat di balai kota Matsudo (転入届,
   14 hari), kartu My Number, asuransi kesehatan, rekening bank (Yucho mudah), SIM/kartu transport,
   daftar grup WhatsApp jamaah.
2. Aturan sampah Matsudo: jenis (bakar, tidak bakar, botol PET, kaleng, kertas, besar), jadwal berbeda
   per wilayah, tautan situs kota, tips bahasa.
3. Transportasi: JR Joban, Shin-Keisei, IC card, cara ke masjid dari Tokyo/Ueno/Kashiwa, parkir sepeda.
4. Halal sehari-hari: tautan ke `/halal`, supermarket dengan pojok halal, label yang harus dicek.
5. Darurat: 110 polisi, 119 ambulans/kebakaran, 171 pesan bencana, gempa (shelter terdekat, tas siaga),
   nomor konsulat/KBRI, rumah sakit dengan layanan bahasa asing.
6. Kehidupan muslim di tempat kerja/sekolah: minta tempat salat, Jumat, puasa, makan siang sekolah
   (surat untuk sekolah, tautan kamus).
7. Kontak pengurus dan tombol WhatsApp; unduh ringkasan sebagai halaman cetak.
Gunakan kartu bernomor (`NumberedItem`), `Accordion` untuk detail, dan ikon lucide.

## `/halal`
- `HaramKanjiSearch`: pencarian kanji/kana/romaji/arti, filter haram/syubhat, kartu dengan kanji besar,
  bacaan, arti per bahasa, catatan; tombol salin kanji; bagian "cara membaca label" (成分, 原材料名,
  アレルギー, 豚由来) dan "frasa untuk bertanya" (dari kamus kategori food).
- `HalalRadar`: peta Leaflet dengan marker berwarna per jenis, daftar tempat terurut jarak dari masjid
  (atau dari lokasi pengguna bila diizinkan: hitung haversine di client), filter jenis, badge terverifikasi,
  tautan Google Maps, tombol "usulkan tempat" (membuka WhatsApp dengan template).
- Kartu "Kuliner halal Chiba & Tokyo timur" dan "Aplikasi & sumber" (Halal Navi, Halal Gourmet Japan)
  sebagai tautan.

## `/dictionary` dan `/app/dictionary`
- `DictionarySearch`: cari kata (Jepang, bacaan, arti), tab kategori (ibadah, makanan, harian, darurat,
  frasa), kartu entri: kanji besar + bacaan + arti; contoh kalimat Jepang besar untuk ditunjukkan ke
  lawan bicara, tombol "Tunjukkan" (dialog layar penuh dengan teks Jepang sangat besar + terjemahan kecil),
  tombol salin, pengucapan dengan `speechSynthesis` (lang ja-JP) bila tersedia.
- Versi App: `compact`, tanpa hero, kotak cari di atas, "Tunjukkan" sebagai aksi utama.

## `/app/radar`
`HalalRadar` versi App: peta tinggi 45vh + daftar; tombol "lokasi saya".

## Pesan
Namespace `newcomers` (semua teks panduan), `halal`, `dictionary`, `radar`. Isi ketiga bahasa, terutama
Jepang untuk contoh kalimat dan Indonesia untuk panduan.

## Selesai berarti
typecheck, lint, test, build lulus; peta tampil (client only) tanpa error SSR; pencarian berjalan;
dialog "Tunjukkan" terbaca dari jarak 1 meter. Laporkan file yang dibuat.
