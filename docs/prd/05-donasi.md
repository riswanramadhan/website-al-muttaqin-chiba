# PRD-05 · Infaq & Donasi (modul `donate`)

Lingkup: `/donate`, `/donate/zakat`, `/transparency`, layar App `/app/donate`, Server Action konfirmasi
donasi & donatur tetap. Donasi Rupiah lewat QRIS, Yen lewat Japan Post Bank; gateway otomatis (Midtrans/
Stripe) hanya placeholder di balik feature flag `PAYMENT_GATEWAY_ENABLED`. Baca `CLAUDE.md` dulu.

## File yang dimiliki modul ini
- `src/components/donate/*` (ekspor publik lewat `src/components/donate/index.ts`)
- `src/app/[locale]/(site)/donate/page.tsx`, `src/app/[locale]/(site)/donate/zakat/page.tsx`
- `src/app/[locale]/(site)/transparency/page.tsx`
- `src/app/[locale]/app/donate/page.tsx`
- `src/actions/donations.ts` (pakai `createAction` dari `@/lib/actions`)
- `src/data/donations.ts` (perluas bila perlu: program, laporan 2-3 bulan)
- `src/messages/{ja,en,id}/{donate,zakat,transparency}.json`

## Kontrak ekspor (dipakai beranda & App home)
```ts
export { DonationAccountsList } from "./donation-accounts-list"; // Server: { locale: Locale; compact?: boolean }
export { DonateCta } from "./donate-cta";                         // Server: { locale: Locale; tone?: "default" | "inverse" }
export { DonationProgress } from "./donation-progress";           // Server: { locale: Locale; limit?: number }
export { ZakatCalculator } from "./zakat-calculator";             // Client: { locale: Locale }
```

## Halaman `/donate`
1. Hero: judul dua warna, penjelasan infaq operasional (masjid sudah berdiri; fokus pemakmuran).
2. Program donasi (`getDonationPrograms`): kartu dengan ikon lucide, progres (`Progress`), target & terkumpul
   (`formatCurrency`), status (buka/ditutup/selesai; wakaf pembangunan ditampilkan sebagai lunas).
3. Rekening resmi (`DonationAccountsList`): kartu per rekening dengan tombol `CopyButton` untuk nomor
   rekening, nama, kode cabang; QRIS menampilkan gambar `qrImage` + tombol unduh; keterangan per bahasa.
   Tab mata uang (JPY / IDR) memakai `Tabs`.
4. Nominal unik (PRD-05): pilihan nominal cepat (¥1.000/3.000/5.000/10.000 atau Rp50.000/100.000/250.000/
   500.000) + input bebas; sistem menambahkan 3 digit unik acak (JPY: ¥5.000 → ¥5.123; IDR: +ribuan unik,
   mis. Rp100.000 → Rp100.371). Nominal unik ditampilkan besar dan ikut tersalin ke formulir konfirmasi.
5. Formulir konfirmasi (react-hook-form + zod): program, rekening/metode, mata uang, nominal (prefill
   nominal unik), tanggal transfer, nama (opsional/anonim), kontak, atas nama (orang tua/almarhum), pesan,
   persetujuan privasi, honeypot. Submit → `confirmDonation` action: simpan ke tabel
   `donation_confirmations` bila Supabase aktif; selain itu kembalikan `{ fallback: "whatsapp", url }` dari
   `buildWhatsAppUrl(profile.whatsapp, composeMessage(...))`; UI menampilkan sukses + tombol "Kirim via WhatsApp".
6. Donatur tetap: penjelasan, formulir pendaftaran (nama, kontak, nominal bulanan, tanggal, metode, izin
   publikasi nama, persetujuan) → `registerRecurringDonor`; tombol "Pasang pengingat kalender" membuat
   tautan Google Calendar berulang bulanan.
7. Kalkulator zakat ringkas + tautan ke `/donate/zakat`; FAQ donasi (`getFaqs("donation")`) dengan `Accordion`.
8. Jalur otomatis: bila `process.env.PAYMENT_GATEWAY_ENABLED === "true"`, tampilkan kartu "Bayar otomatis"
   dengan tombol nonaktif bertuliskan "segera"; selain itu sembunyikan.

## Halaman `/donate/zakat`
`ZakatCalculator` (client): tab Zakat Maal (emas/perak/tabungan/piutang/dagang, kurangi utang, nisab 85 g
emas dengan harga emas per gram bisa diubah, default ¥16.000/g; 2,5 %), Zakat Penghasilan (bulanan/
tahunan, nisab 85 g emas setahun, 2,5 %), Zakat Fitrah (jumlah jiwa × 2,5 kg beras, harga beras per kg
bisa diubah, default ¥500/kg; tampilkan juga setara ¥). Mata uang JPY/IDR (kurs manual, default 1 JPY =
Rp105). Hasil besar, penjelasan singkat dalil, tombol "Salurkan sekarang" ke `/donate`. Semua hitungan
di client, tanpa penyimpanan.

## Halaman `/transparency`
Daftar laporan bulanan (`getTransparencyReports`): ringkasan saldo awal, pemasukan, pengeluaran, saldo
akhir; tabel rincian pemasukan & pengeluaran; grafik batang sederhana SVG (tanpa library) pemasukan vs
pengeluaran 6 bulan terakhir; catatan verifikasi bendahara; tombol unduh PDF bila `fileUrl` ada; prinsip
transparansi (siapa menandatangani, kapan dirilis).

## Layar App `/app/donate`
Ringkas: tab JPY/IDR rekening dengan salin, QRIS besar, nominal unik, tombol konfirmasi (formulir sama,
tampilan satu kolom), tautan kalkulator zakat.

## Pesan
Namespace `donate` (hero, program, rekening, nominal unik, formulir, donatur tetap, gateway, FAQ, meta),
`zakat` (kalkulator), `transparency`. Isi ketiga bahasa.

## Selesai berarti
typecheck, lint, test, build lulus; formulir memvalidasi dan menampilkan fallback WhatsApp tanpa Supabase;
tombol salin bekerja; tampilan rapi di 360 px & 1280 px. Laporkan file yang dibuat.
