# Konten & Keputusan dari Pengurus (PRD-13)

Situs sudah berjalan penuh dengan data contoh. Daftar di bawah adalah nilai PLACEHOLDER yang
harus diganti pengurus sebelum launch. Lokasi file disebutkan agar mudah dicari; setelah Supabase
aktif, sebagian besar bisa diubah dari panel admin.

> Setelah Supabase aktif, isi lewat panel admin (`/admin`), bukan lewat berkas di bawah:
> Profil & kontak, Pengurus, Rekening donasi, Program donasi, Laporan keuangan, Galeri foto, Program & kelas,
> Tempat halal, FAQ, Waktu salat, Jadwal Jumat, Pengumuman, Agenda, Kajian video, Berita. Nama berkas di bawah
> hanya menunjukkan asal data contohnya.

## Identitas & kontak (`src/data/profile.ts`)
- [ ] Alamat jalan lengkap, kode pos, dan koordinat persis masjid (saat ini pusat kota Matsudo: 35.7876, 139.9031)
- [ ] Nomor telepon dan WhatsApp pengurus
- [ ] Email resmi (saat ini info@almuttaqinculturalcenter.org)
- [ ] Tautan YouTube, Instagram, Facebook resmi
- [ ] Jam buka masjid, stasiun terdekat & menit jalan kaki
- [ ] Nama pengurus (sekretaris, bendahara, koordinator pendidikan) dan foto
- [ ] Tahun berdiri, kapasitas jamaah, daftar fasilitas

## Logo & foto
- [ ] Logo resmi (ganti `public/icons/icon.svg`, `icon-maskable.svg`, lalu `npm run icons`)
- [ ] Foto masjid dan kegiatan (ganti `public/images/gallery/*.svg` dan `src/data/gallery.ts`)
- [ ] Gambar QRIS resmi (`public/images/qris-placeholder.svg`)

## Waktu salat (`src/data/prayer-config.ts`)
- [ ] Metode hitung (saat ini Muslim World League, mazhab Syafi'i)
- [ ] Aturan iqamah per salat (offset menit atau jam tetap)
- [ ] Jam khutbah Jumat (saat ini 12:30) dan catatan
- [ ] Koreksi tanggal Hijriah bila berbeda dengan rukyat setempat
- [ ] Tanggal Ramadan 1448 H

## Donasi (`src/data/donations.ts`)
- [ ] Nomor rekening Japan Post Bank (kigou/bangou + kode cabang) dan nama pemilik
- [ ] QRIS resmi dan nama merchant
- [ ] Rekening Indonesia (BSI) bila dipakai
- [ ] Program donasi aktif dan target bulanan
- [ ] Laporan keuangan bulanan pertama (`transparencyReports`)

## Konten (`src/data/*.ts`)
- [ ] Jadwal khatib & imam Jumat beberapa pekan ke depan
- [ ] Pengumuman, agenda, dan rekaman kajian (ID video YouTube asli; sekarang placeholder)
- [ ] Program (TPA, kelas muallaf, kelas bahasa Jepang, open mosque) dan jadwal pastinya
- [ ] Daftar toko & restoran halal sekitar Matsudo (radar halal)
- [ ] FAQ tambahan dan kamus dakwah

## Keputusan
- [ ] Siapa admin pertama dan bahasa yang mereka pakai (untuk panel admin)
- [ ] Domain `almuttaqinculturalcenter.org` dan DNS
- [ ] Akun Supabase, Vercel, Cloudflare Turnstile, Resend, VAPID (lihat `.env.example`)
- [ ] Kebijakan privasi (APPI) ditinjau pengurus sebelum publikasi
