# PRD v2 — Web Publik Al Muttaqin Cultural Center

Oct 29, 2026 · @Riswan Ramadhan

**Ruang lingkup v2:** dokumen ini hanya untuk web publik `almuttaqinculturalcenter.org` — situs tiga bahasa, App Jamaah (PWA), dan admin konten — yang berjalan di server dan database sendiri. Web internal pengurus di `pengurus-acc.online` (kas, inventaris, data jamaah, persetujuan direktur) dibangun belakangan dan dirancang di [Sistem Internal & Donasi Al Muttaqin Cultural Center](https://claude.ai/artifact/TtYFD2mmfMnAxecMpg9Wze). Donasi: Rupiah lewat QRIS dan Yen lewat Japan Post Bank, dengan jalur otomatis Midtrans dan Stripe sebagai opsi.

## 1. Ringkasan produk

Produk ini adalah web publik Al Muttaqin Cultural Center di Matsudo, Chiba: website resmi tiga bahasa (Jepang, Inggris, Indonesia), App Jamaah yang bisa di-install di HP (PWA), dan admin konten. Dibangun dengan Next.js dan Supabase, responsif di semua layar, dengan tampilan modern minimalis mengikuti referensi UI dan palet merah gelap, hitam, putih.

**Status masjid.** Masjid sudah siap digunakan, sehingga fokus produk bergeser dari penggalangan dana pembangunan ke pemakmuran masjid: salat berjamaah, kajian, pembinaan muallaf, pendidikan anak, dan infaq operasional.

**Latar belakang.** Al-Muttaqin adalah Islamic Center di Matsudo, Chiba, hasil kolaborasi Chiba Islamic Culture Center (Sensei Kyoichiro Sugimoto) dan Dompet Dhuafa. Visinya mencakup tempat ibadah, pusat muallaf, pendidikan generasi muda, dan ekonomi halal ([Dompet Dhuafa](https://www.dompetdhuafa.org/en/to-strengthen-the-spread-of-islam-dompet-dhuafa-supports-the-construction-of-the-al-muttaqin-mosque-as-an-islamic-cultural-centre-in-chiba-japan/)).

**Standar fitur.** Acuannya adalah [Masjid As-Sunnah Hekinan](https://assunnahhekinan.org/) (web + [App Jamaah PWA](https://assunnahhekinan.org/app.html)) dan [As-Sholihin Yokohama](https://masjidassholihinyokohama.org/), lalu ditingkatkan dengan database dan panel admin sungguhan (lihat bagian 3).

**Tujuan**

1. Satu pintu informasi resmi dalam bahasa Jepang, Inggris, dan Indonesia.
2. App Jamaah yang bisa di-install: jadwal salat, notifikasi adzan, kiblat, info Jumat, kajian.
3. Infaq operasional yang transparan: rekening resmi, konfirmasi donasi, laporan berkala.
4. Pengurus mengelola semua konten sendiri tanpa developer.
5. Ramah bagi muallaf, muslim yang baru pindah ke Chiba, dan warga Jepang.

**Metrik keberhasilan (usulan, disepakati bersama pengurus)**

| Metrik | Target |
| --- | --- |
| Lighthouse mobile (performa · aksesibilitas · SEO) | ≥ 90 di ketiganya |
| PWA | Installable di Android & iOS, jadwal salat tetap tampil saat offline |
| Jamaah meng-install App | ≥ 100 perangkat dalam 3 bulan pertama |
| Waktu admin menerbitkan pengumuman 3 bahasa | < 3 menit |
| Konten diperbarui pengurus sendiri | ≥ 4 kali per bulan setelah serah terima |

**Yang baru di v2**

- Identitas Al Muttaqin Cultural Center dengan domain `almuttaqinculturalcenter.org`.
- Donasi QRIS (Rupiah) dan Japan Post Bank (Yen) dengan nominal unik dan pencocokan mutasi; jalur otomatis Midtrans dan Stripe sebagai opsi (PRD-05).
- Peminjaman ruangan, program budaya (kelas bahasa, open mosque, kunjungan sekolah), dan halaman Mengenal Islam (PRD-08).
- Elemen UI pembeda: busur hari salat, pola geometris Islam × Jepang, label tiga aksara, tema malam otomatis (PRD-01).
- Baca Al-Qur’an, tasbih digital, kalender Hijriah interaktif, dan pencarian global (PRD-03 & PRD-07).
- Prompt pack berurutan dan detail untuk Claude (PRD-15).
- Fitur keuangan internal (buku kas, anggaran, inventaris) dipindah ke web internal.

## 2. Persona pengguna

Enam kelompok pengguna dilayani, dan beranda web maupun App harus menjawab kebutuhan utama masing-masing dalam satu kali scroll.

| Persona | Siapa | Kebutuhan utama | Bahasa | Pintu masuk |
| --- | --- | --- | --- | --- |
| Jamaah tetap | Muslim yang tinggal/bekerja di Matsudo & sekitarnya | Jadwal salat & iqamah, info Jumat, kajian, pengumuman | ID, EN, JP | App Jamaah |
| Muslim baru di Chiba | Pekerja, pelajar, peserta magang yang baru pindah | Lokasi masjid, halal, transportasi, aturan sampah, kontak pengurus | ID, EN | Web → Panduan |
| Muallaf & calon muallaf | Warga Jepang yang mengenal Islam | Kelas dasar Islam, pembimbing, FAQ, materi bahasa Jepang | JP | Web |
| Donatur | Jamaah, diaspora Indonesia, perusahaan | Rekening resmi, konfirmasi infaq, donatur tetap, laporan dana | ID, JP | Web & App |
| Warga & tamu | Tetangga, sekolah, wisatawan muslim | Profil masjid, adab berkunjung, akses, kegiatan terbuka | JP, EN | Web |
| Pengurus (admin) | Tim masjid & Chiba Islamic Culture Center | Kelola konten cepat, lihat pendaftar & konfirmasi donasi | ID / JP | Panel admin |

**Pertanyaan terbuka untuk pengurus:** siapa saja admin pertama, dan bahasa apa yang mereka pakai sehari-hari?

## 3. Benchmark: Hekinan & Yokohama

Hekinan sudah sangat lengkap dari sisi fitur, tetapi datanya diambil dari file CSV dan semua formulir berakhir di WhatsApp; Al-Muttaqin mengambil seluruh fiturnya lalu memindahkannya ke database dengan panel admin sungguhan.

| Aspek | [As-Sholihin Yokohama](https://masjidassholihinyokohama.org/) | [As-Sunnah Hekinan](https://assunnahhekinan.org/) | Al-Muttaqin Chiba (target) |
| --- | --- | --- | --- |
| Teknologi | WordPress + Elementor | HTML statis, konten dari URL CSV | Next.js + Supabase, data relasional |
| Jadwal salat | Foto jadwal iqamah dari WhatsApp | Dihitung otomatis + info Jumat (khatib, imam, waktu) | Otomatis + iqamah & Jumat dari admin, Hijriah, imsakiyah Ramadan |
| App / PWA | Tidak ada | App Jamaah terpisah dengan tombol install | Satu codebase, PWA penuh: offline, notifikasi adzan, navigasi bawah |
| Infaq | Tautan LaunchGood | Rekening JP & ID + tombol salin, konfirmasi via WA, donatur tetap, progres wakaf | Semua fitur itu + konfirmasi tersimpan di database, laporan keuangan, kalkulator zakat |
| Kajian | Artikel blog | Video YouTube + deteksi live, form pendaftaran dauroh | Video & live, pendaftaran dinamis dengan kuota, ekspor CSV |
| Layanan jamaah | Halaman kontak | Panduan muslim lokal, kanji haram, kamus dakwah, radar halal, FAQ, kotak saran | Diadaptasi untuk Chiba; saran & laporan fasilitas masuk ke panel admin |
| Admin | Dashboard WordPress | Form konfigurasi URL CSV | Panel admin dengan peran, dashboard, log aktivitas |
| Bahasa | ID + JP bercampur di satu halaman | Web ID & EN; App ID, EN, JP | JP, EN, ID dengan rute terpisah |
| Gaya visual | Template Elementor | Banyak emoji | Modern minimal, ikon Lucide, tanpa emoji |

## 4. Peta modul PRD

Spesifikasi dipecah menjadi 10 PRD fitur dan 5 dokumen pelaksanaan. Untuk membangun, cukup ikuti urutan prompt di PRD-15; PRD lain menjadi rujukan detail yang dilampirkan di setiap prompt.

| PRD | Isi utama | Fase |
| --- | --- | --- |
| PRD-01 · Design System & UI | Palet, tipografi, ikon, komponen, elemen pembeda | 1 |
| PRD-02 · Database & Supabase | Skema SQL, relasi, RLS, storage, seed data | 1 |
| PRD-03 · Website Publik | Semua halaman & section web publik, pencarian global | 1 |
| PRD-04 · Jadwal Salat & Jumat | Jadwal salat, iqamah, Jumat, Hijriah, Ramadan | 1 |
| PRD-05 · Infaq & Donasi | Donasi QRIS & Japan Post Bank, pencocokan mutasi, jalur otomatis opsional | 1 |
| PRD-09 · Panel Admin | Admin konten, admin donasi sementara, peran, ekspor | 1–2, dibangun bersama modulnya |
| PRD-06 · Kegiatan & Kajian | Agenda, kajian, video live, pendaftaran, TPA, kelas muallaf | 2 |
| PRD-07 · App Jamaah (PWA) | Install, offline, notifikasi adzan, kiblat, Al-Qur’an, doa & dzikir | 2 |
| PRD-08 · Panduan & Layanan | Panduan, halal, kamus, FAQ, saran, peminjaman ruangan, program budaya | 2 |
| PRD-10 · Bahasa, SEO & Deploy | Tiga bahasa, SEO, keamanan, testing, deploy | 1 & 3 |
| PRD-11 · Backlog & Sprint | Tiket per sprint, estimasi, ketergantungan, status | Pelaksanaan |
| PRD-12 · Kontrak Action & API | Kontrak Server Action & route handler | Pelaksanaan |
| PRD-13 · Konten & Keputusan | Konten & aset dari pengurus, keputusan, agenda rapat | Pelaksanaan |
| PRD-14 · UAT, Serah Terima & Biaya | Skenario UAT, pelatihan, serah terima, perawatan, biaya | Pelaksanaan |
| PRD-15 · Prompt Pack Claude | Urutan lengkap prompt detail untuk Claude, dari setup sampai launch | Pelaksanaan |

**Fase 3 (opsional, setelah launch):** jalur donasi otomatis bila belum diaktifkan (QRIS dinamis Midtrans, Stripe untuk transfer bank virtual, kartu, dan PayPay), newsletter email, kartu ucapan hari raya, dan direktori usaha halal Chiba.

## 5. Sitemap & alur

Satu aplikasi Next.js melayani tiga pintu: website publik tiga bahasa, App Jamaah yang bisa di-install, dan panel admin tertutup untuk pengurus.

&#91;embedded content: sitemap v2 · 20 halaman web, 11 layar App, 16 menu admin\]

Web dan App memakai komponen dan data yang sama; App adalah tampilan ringkas untuk HP yang tetap bekerja offline. Setiap menu admin mengisi halaman di keduanya, dan hanya admin terverifikasi yang bisa menerbitkan.

&#91;embedded content: flowchart alur admin menerbitkan konten\]

Konten yang belum siap disimpan sebagai draf; hanya konten yang diterbitkan yang memicu revalidate dan langsung tampil.

**Alur jamaah utama:** buka web atau App → bahasa terdeteksi dari browser (bisa diganti) → beranda menampilkan salat berikutnya, hitung mundur iqamah, info Jumat, dan pengumuman → jamaah membuka kajian, mendaftar kegiatan, menyalin rekening lalu mengonfirmasi infaq, atau mengirim saran ke pengurus.

## 6. Arsitektur teknis

Web publik berjalan sebagai satu aplikasi Next.js (App Router, TypeScript) di Vercel dengan proyek Supabase sendiri, terpisah dari web internal pengurus yang dibangun belakangan. Supabase menyimpan konten, akun admin, file, dan data donasi sementara, sekaligus menjadwalkan notifikasi push.

&#91;embedded content: arsitektur sistem · Next.js di Vercel + Supabase\]

Halaman web dan App dirender di server lalu di-cache (ISR); service worker menyimpan jadwal salat dan halaman inti agar tetap terbuka saat offline. Notifikasi adzan dikirim Edge Function terjadwal lewat Web Push ke HP jamaah yang mengizinkan.

### 6.1 Tech stack

| Lapisan | Pilihan | Catatan |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript strict | Server Components, ISR, Server Actions |
| Styling & komponen | Tailwind CSS v4 + shadcn/ui (Radix) | Dikustomisasi sesuai PRD-01 |
| Ikon | lucide-react | Satu set ikon garis; tanpa emoji |
| Animasi & carousel | Motion + Embla Carousel | Hormati `prefers-reduced-motion` |
| Multibahasa | next-intl | Rute `/ja`, `/en`, `/id` |
| Backend | Supabase: Postgres, Auth, Storage, Realtime, Edge Functions | RLS di setiap tabel |
| Waktu salat | adhan (adhan-js) | Dihitung lokal dari koordinat masjid |
| Kalender Hijriah | `Intl.DateTimeFormat` kalender `islamic-umalqura` | Koreksi ±1 hari dari admin |
| PWA | Serwist (`@serwist/next`) | Precache, fallback offline |
| Notifikasi | Web Push (VAPID) + Edge Function cron | Izin diminta setelah aksi pengguna |
| Editor konten | Tiptap | Isi 3 bahasa dalam satu formulir |
| Form & validasi | React Hook Form + Zod | Satu skema untuk klien dan server |
| Peta | Leaflet + OpenStreetMap | Lokasi masjid & radar halal |
| Email & anti-spam | Resend + Cloudflare Turnstile | Notifikasi ke pengurus, form publik aman |
| Analitik | Vercel Analytics | Tanpa cookie pelacak |
| Testing | Vitest + Playwright | Unit & alur end-to-end |
| Hosting | Vercel + GitHub | Preview otomatis per branch |

### 6.2 Struktur folder

Struktur ini menjadi acuan bersama untuk semua prompt; skema database lengkap ada di PRD-02 · Database & Supabase.

```text
src/
  app/
    [locale]/
      (site)/              # website publik
        page.tsx           # beranda
        about/ prayer-times/ jumuah/ lectures/ events/ news/
        donate/ transparency/ newcomers/ halal/ gallery/ faq/ contact/
      app/                 # App Jamaah (PWA), layout dengan bottom nav
        page.tsx prayer/ qibla/ dua/ live/ donate/ help/ dictionary/ radar/ settings/
    admin/                 # panel admin (UI bahasa Indonesia & Jepang)
    api/                   # push/subscribe, revalidate, calendar.ics
    manifest.ts  sitemap.ts  robots.ts  sw.ts
  components/  ui/ site/ app/ admin/ shared/
  lib/  supabase/ prayer/ hijri/ i18n/ validations/ utils/
  messages/  ja.json en.json id.json
supabase/
  migrations/  seed.sql  functions/push-adzan/
```

### 6.3 Konvensi kode

- TypeScript strict, tanpa `any`; tipe database di-generate dengan `supabase gen types`.
- Server Components secara default; `"use client"` hanya untuk bagian interaktif.
- Semua mutasi lewat Server Actions yang memvalidasi dengan Zod dan mengecek peran admin.
- Teks antarmuka tidak boleh di-hardcode: selalu dari `messages/*.json`.
- Commit kecil per fitur dengan format Conventional Commits (`feat:`, `fix:`).

## 7. Kebutuhan non-fungsional

Produk harus ringan di HP jamaah, tetap berguna saat sinyal buruk, terbaca dalam tiga bahasa, dan aman meski dikelola pengurus non-teknis.

| Aspek | Standar | Cara memenuhi |
| --- | --- | --- |
| Performa | Lighthouse mobile ≥ 90, LCP < 2,5 dtk, CLS < 0,1 | RSC, ISR, `next/image` AVIF/WebP, font subset, JS klien minimal |
| PWA | Installable, ikon & splash screen, start URL `/[locale]/app` | Web manifest + Serwist, prompt install kustom |
| Offline | Jadwal salat 30 hari ke depan, beranda App, doa & kamus tetap terbuka | Precache + runtime cache; jadwal dihitung di perangkat |
| Notifikasi | Hanya dikirim ke yang mengizinkan; bisa dimatikan per salat | Web Push VAPID, preferensi tersimpan di `push_subscriptions` |
| Multibahasa | JP, EN, ID; fallback ke EN bila terjemahan kosong | next-intl, kolom `jsonb` per bahasa |
| Tipografi Jepang | Kanji/kana rapi, tidak terpotong | Noto Sans JP, `line-break: strict`, `word-break: keep-all` |
| SEO | Terindeks di Google Jepang & Indonesia | Metadata per bahasa, `hreflang`, sitemap, JSON-LD `Mosque` & `Event` |
| Aksesibilitas | WCAG 2.1 AA | Kontras merah gelap di atas putih ≥ 4,5:1, fokus terlihat, alt text wajib |
| Keamanan | Hanya admin terdaftar bisa menulis | RLS di setiap tabel, middleware `/admin`, Turnstile + rate limit di form publik |
| Privasi | Data jamaah hanya untuk keperluan masjid | Kebijakan privasi sesuai APPI Jepang, persetujuan di setiap form |
| Zona waktu | Semua jam dalam Asia/Tokyo | Simpan `timestamptz` UTC, tampilkan JST |
| Ketersediaan | Uptime ≥ 99,5% | Vercel + Supabase, backup database harian |
| Biaya | Rp0 selama pengembangan; produksi disarankan sekitar US$46/bulan | Paket gratis saat membangun, lalu Vercel Pro + Supabase Pro saat launch (rincian di PRD-14) |

## 8. Desain UI

Bahasa desain diambil dari referensi UI yang dilampirkan (hero gelap berpola, judul besar dua warna, kartu membulat, tag pill kecil, daftar layanan bernomor) lalu dipindah ke palet merah gelap, hitam, dan putih; tanpa emoji, semua ikon dari Lucide. Token lengkap ada di PRD-01 · Design System & UI.

| Elemen | Keputusan |
| --- | --- |
| Warna | Merah gelap `#7F1D1D` sebagai aksen, hitam `#0A0A0A`, putih `#FFFFFF`, abu `#F5F5F5` untuk kartu |
| Tipografi | Plus Jakarta Sans (Latin), Noto Sans JP (Jepang), Amiri (teks Arab) |
| Judul | Besar dan rapat; kata kunci terakhir berwarna merah, mis. “di Matsudo, Chiba.” |
| Kartu | Radius 20–24 px, latar abu sangat muda atau putih bergaris tipis, tanpa bayangan berat |
| Tag section | Pill kecil berbingkai di atas tiap judul section (Tentang kami, Layanan, Kontak) |
| Hero & footer | Hitam dengan pola geometris Islam berkontras sangat rendah |
| Ikon | Lucide, stroke 1,5 px, di dalam lingkaran atau kotak membulat |
| Interaksi | Hover naik 2 px, carousel bertombol bulat, angka statistik count-up |
| Pendekatan | Mobile-first; App Jamaah memakai navigasi bawah |

&#91;embedded content: wireframe beranda web · gaya referensi UI, palet merah gelap\]

Warna aksen di wireframe hanya penanda; di produk aksennya merah gelap. Semua angka dan teks adalah placeholder yang nanti diisi pengurus dari panel admin.

## 9. Roadmap, risiko & langkah pertama

Rilis penuh diperkirakan sekitar 10 minggu kerja, dengan soft launch web inti di minggu ke-5 agar jamaah sudah bisa memakai jadwal salat dan info infaq lebih awal; durasi ini estimasi.

&#91;embedded content: roadmap · 5 fase, 4 gerbang persetujuan, estimasi 10 minggu\]

Setiap fase menyebut PRD modul yang dikerjakan; fase berikutnya baru dimulai setelah gerbang persetujuan pengurus lulus.

### 9.1 Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Fitur sangat banyak untuk satu developer | Molor, kualitas turun | Kerjakan per modul sesuai roadmap; soft launch web inti dulu |
| Notifikasi push di iPhone hanya aktif setelah App ditambahkan ke Home Screen | Sebagian jamaah tidak menerima adzan | Panduan install bergambar per OS; alternatif unduh pengingat kalender `.ics` |
| Konten & terjemahan Jepang terlambat | Halaman JP kosong | Penerjemah relawan; fallback otomatis ke EN |
| Data donatur & pendaftar bersifat pribadi | Risiko kebocoran | RLS per peran, ekspor hanya super admin, log aktivitas |
| Jadwal salat berbeda dengan kebiasaan jamaah | Kebingungan | Metode hitung disepakati di awal; koreksi menit per salat dari admin |
| Pengurus jarang memperbarui konten | App terasa mati | Jadwal & tanggal Hijriah otomatis; panel admin sederhana + pelatihan |
| Spam di formulir publik | Beban moderasi | Turnstile + rate limit + daftar blokir |

### 9.2 Yang bisa langsung dikerjakan minggu ini

- [ ] Kirim dokumen ini ke pengurus dan jadwalkan presentasi singkat
- [ ] Minta aset: logo, foto masjid, teks profil, alamat persis, kontak WhatsApp pengurus, rekening resmi (Jepang & Indonesia), akun YouTube & Instagram
- [ ] Konfirmasi metode hitung waktu salat, jam iqamah, dan jadwal Jumat
- [ ] Tentukan admin pertama dan bahasa yang mereka pakai
- [ ] Cek ketersediaan domain (menunggu persetujuan nama)
- [ ] Buat repo GitHub, proyek Supabase, dan proyek Vercel
- [ ] Jalankan prompt setup awal (PRD-11, tiket T-003), lalu prompt PRD-01 di Claude Code

## 10. Cara membangun dengan Claude

Bangun per modul mengikuti urutan prompt di PRD-15: satu prompt per sesi, dengan tab ini plus PRD modul terkait sebagai konteks. Jangan menempel semua PRD sekaligus agar Claude tetap fokus.

1. Buat proyek: `npx create-next-app@latest masjid-almuttaqin --ts --tailwind --app --src-dir`, buat proyek Supabase, isi `.env.local`.
2. Ekspor setiap tab ke Markdown dan simpan di repo dengan nama yang dipakai prompt (01-design-system, 02-database, 03-website-publik, 04-jadwal-salat, 05-donasi, 06-kegiatan-kajian, 07-app-jamaah-pwa, 08-panduan-layanan, 09-panel-admin, 10-bahasa-seo-deploy, 11-backlog, 12-kontrak-action-api, 13-konten-keputusan, 14-uat-serah-terima, 15-prompt-pack), mulai dari `docs/prd/00-master.md` sampai `docs/prd/15-prompt-pack.md`.
3. Buat file `CLAUDE.md` di root proyek dengan isi template di bawah.
4. Jalankan prompt di akhir setiap PRD modul dengan urutan: 01 → 02 → 12 → 10 (bagian i18n) → 03 → 04 → 05 → 09 → 06 → 07 → 08 → 10 (SEO, keamanan, deploy).
5. Setelah setiap prompt: jalankan `npm run build`, cek di browser dan HP, commit, baru lanjut ke prompt berikutnya.
6. Jika ada error, tempel pesan error lengkap dan minta perbaikan tanpa mengubah fitur lain.

```markdown
# CLAUDE.md — Web Publik Al Muttaqin Cultural Center

## Konteks
Web publik almuttaqinculturalcenter.org: situs tiga bahasa (ja, en, id), App Jamaah (PWA), dan
admin konten untuk Al Muttaqin Cultural Center (masjid & pusat budaya Islam) di Matsudo, Chiba, Jepang.
Web internal pengurus (pengurus-acc.online) adalah aplikasi TERPISAH dan bukan bagian repo ini.
Sebelum mengerjakan apa pun, baca docs/prd/00-master.md dan PRD modul yang disebut di prompt.

## Stack
Next.js App Router + TypeScript strict, Tailwind CSS v4, shadcn/ui, lucide-react, Motion,
Supabase (Postgres, Auth, Storage, Edge Functions), next-intl (ja, en, id), Serwist, adhan.

## Aturan desain
- Gaya mengikuti referensi UI: modern, minimalis, hero hitam berpola, judul dua warna, kartu membulat.
- Warna hanya dari token PRD-01 (merah gelap, hitam, putih); tidak ada hex di komponen.
- Tanpa emoji di UI, kode, notifikasi, maupun seed data. Ikon hanya lucide-react.
- Mobile-first dan responsif penuh (uji 360, 768, 1280, 1536 px); mode terang & gelap.

## Aturan kode
- Semua teks UI lewat messages/{ja,en,id}.json; konten database berbentuk { ja, en, id }.
- Server Components default; "use client" hanya untuk bagian interaktif.
- Mutasi lewat createAction (PRD-12): Zod + cek peran + rate limit + revalidateTag.
- Setiap tabel baru wajib migration + RLS. Zona waktu tampilan Asia/Tokyo.
- Donasi: Rupiah via QRIS, Yen via Japan Post Bank; gateway (Midtrans/Stripe) hanya aktif lewat
  feature flag PAYMENT_GATEWAY_ENABLED.

## Selesai berarti
lint, typecheck, test, dan build lulus; laporkan file yang dibuat/diubah dan cara mengujinya.
```

## Sumber

- [Dompet Dhuafa — Masjid Al-Muttaqin sebagai Islamic Center di Matsudo, Chiba](https://www.dompetdhuafa.org/en/to-strengthen-the-spread-of-islam-dompet-dhuafa-supports-the-construction-of-the-al-muttaqin-mosque-as-an-islamic-cultural-centre-in-chiba-japan/)
- [Masjid As-Sunnah Hekinan — website](https://assunnahhekinan.org/)
- [Masjid As-Sunnah Hekinan — App Jamaah](https://assunnahhekinan.org/app.html)
- [Masjid As-Sholihin Yokohama](https://masjidassholihinyokohama.org/)
