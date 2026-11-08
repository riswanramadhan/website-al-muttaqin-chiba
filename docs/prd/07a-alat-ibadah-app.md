# PRD-07a · Alat Ibadah App Jamaah (modul `worship`)

Lingkup: layar App `/app/qibla`, `/app/dua`, `/app/tasbih`, `/app/quran`, `/app/quran/[surah]`,
`/app/hijri`. Semua layar dibungkus `AppScreenHeader` (lebar HP). Baca `CLAUDE.md` dulu.

## File yang dimiliki modul ini
- `src/components/worship/*`
- `src/app/[locale]/app/{qibla,dua,tasbih,quran,hijri}/**`
- `src/data/dua.ts` (perluas: minimal 25 doa/dzikir pagi-petang, harian, salat, perjalanan, Ramadan, Jumat)
- `src/data/hijri-dates.ts` (boleh ditambah)
- `src/messages/{ja,en,id}/{qibla,dua,tasbih,quran,hijri}.json`

## Kiblat (`/app/qibla`)
- Arah kiblat masjid dari `getQiblaDirection(profile.coordinates)`; bila pengguna mengizinkan lokasi,
  hitung dari koordinat pengguna.
- Kompas visual (SVG): jarum/penanda Ka'bah berputar mengikuti `deviceorientation` (iOS perlu
  `DeviceOrientationEvent.requestPermission()` lewat tombol). Tampilkan derajat dari utara, jarak ke
  Makkah (haversine), status sensor, dan panduan "putar HP sampai penanda di atas". Fallback tanpa
  sensor: tampilkan derajat + tautan Google Maps arah kiblat.
- Peringatan kalibrasi magnetik; hormati reduced motion.

## Doa & dzikir (`/app/dua`)
- Tab kategori (pagi, petang, harian, salat, perjalanan, Ramadan, Jumat) memakai `Tabs`.
- Kartu doa: judul, teks Arab (`font-arabic`, ukuran bisa diubah: kecil/sedang/besar disimpan di
  `localStorage`), transliterasi (bisa disembunyikan), terjemahan sesuai bahasa, sumber, jumlah ulangan
  dengan penghitung ketuk (tap) yang mereset per doa.
- Pencarian teks di dalam kategori; tombol salin & bagikan (`navigator.share` bila ada).
- Sesi dzikir pagi/petang otomatis dipilih berdasarkan jam Tokyo (sebelum Zuhur = pagi).

## Tasbih digital (`/app/tasbih`)
- Tombol besar hitung (tap/space), target 33/99/100/custom, putaran (laps), getar ringan
  (`navigator.vibrate`) opsional, suara klik opsional (Web Audio, tanpa file), reset dengan konfirmasi,
  preset dzikir (Subhanallah, Alhamdulillah, Allahu Akbar, Astaghfirullah, salawat, La ilaha illallah)
  dengan teks Arab, total harian tersimpan di `localStorage` (`acc-tasbih`), statistik 7 hari sederhana.

## Al-Qur'an (`/app/quran`, `/app/quran/[surah]`)
- Daftar 114 surah dari `getSurahList()` dengan pencarian (nama Latin/Arab/Jepang/Indonesia, nomor),
  filter Makkiyah/Madaniyah, kartu "lanjutkan membaca" dari `localStorage` (`acc-quran-last`).
- Halaman surah: ambil teks dari `https://api.alquran.cloud/v1/surah/{n}/editions/quran-uthmani,{edisi}`
  dengan edisi terjemahan per bahasa: id → `id.indonesian`, en → `en.sahih`, ja → `ja.ryoichi`
  (lihat https://api.alquran.cloud/v1/edition). Fetch di client dengan status loading/error/retry; hasil
  di-cache service worker (sudah dikonfigurasi) dan simpan juga di `localStorage` per surah agar bisa offline.
- Tampilan ayat: nomor ayat dalam lingkaran, Arab besar (`font-arabic`, ukuran bisa diubah), terjemahan,
  basmalah di awal (kecuali At-Taubah), navigasi surah sebelumnya/berikutnya, tandai terakhir dibaca
  (simpan surah+ayat saat scroll lewat `IntersectionObserver`), tombol lompat ke ayat, mode "Arab saja".
- Audio opsional: tautan putar per surah dari `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/{n}.mp3`
  memakai elemen `<audio>` sederhana.

## Kalender Hijriah (`/app/hijri`)
- Tampilan bulan Hijriah (grid 7 kolom) dari `hijriMonthGrid`, dengan padanan Masehi kecil di tiap sel,
  navigasi bulan sebelumnya/berikutnya, hari ini disorot, Ayyamul Bidh (13-15) ditandai, Senin-Kamis
  ditandai halus, tanggal penting dari `getHijriImportantDates()` ditampilkan sebagai daftar di bawah grid.
- Pengalih tampilan bulan Masehi ↔ Hijriah, hitung hari menuju Ramadan/Idulfitri/Iduladha berikutnya,
  catatan koreksi `hijriAdjustment` dari `getPrayerConfig()`.

## Pesan
Namespace `qibla`, `dua`, `tasbih`, `quran`, `hijri`: judul layar, deskripsi, label tombol, status sensor/
izin, pesan error/offline, nama kategori doa, label filter. Isi ketiga bahasa.

## Selesai berarti
typecheck, lint, test, build lulus; semua layar bekerja di 360 px; tanpa `any`; fetch Al-Qur'an punya
fallback offline; kompas tidak error di desktop tanpa sensor. Laporkan file yang dibuat.
