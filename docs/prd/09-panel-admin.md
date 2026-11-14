# PRD-09 · Panel Admin (modul `admin`)

Lingkup: `/admin/**` di luar segmen locale (UI bahasa Indonesia & Jepang, pilih lewat tombol), login
Supabase Auth (email + password / magic link), dashboard, CRUD konten, inbox formulir publik, ekspor CSV,
dan log aktivitas. Tanpa Supabase, panel menampilkan halaman "Mode demo: hubungkan Supabase" dengan
data seed hanya-baca agar tetap bisa dipresentasikan. Baca `CLAUDE.md`.

## File yang dimiliki modul ini
- `src/app/admin/**` (root layout sendiri dengan `<html lang="id">`, tanpa next-intl; pesan admin dari
  `src/messages/{id,ja}/admin.json` dimuat manual lewat util kecil `src/components/admin/i18n.ts`)
- `src/components/admin/*`
- `src/actions/admin/*.ts` (semua memeriksa sesi admin dan peran lewat `@/lib/supabase/admin.ts` yang
  modul ini buat: klien SSR `@supabase/ssr` dengan cookie, `requireAdmin(roles)`)
- `src/proxy.ts` TIDAK diubah (sudah melewati `/admin`); proteksi dilakukan di layout admin (redirect ke
  `/admin/login` bila tidak ada sesi).
- `src/messages/{id,ja,en}/admin.json`

## Halaman
1. `/admin/login`: form email + password, magic link, pesan error; redirect ke `/admin` setelah masuk.
2. `/admin` dashboard: kartu ringkasan (pengumuman aktif, agenda mendatang, konfirmasi donasi pending,
   pendaftar baru, saran baru, subscription push), pintasan "Terbitkan pengumuman 3 bahasa < 3 menit"
   (formulir cepat), aktivitas terakhir.
3. `/admin/announcements`, `/admin/events`, `/admin/jumuah`, `/admin/lectures`, `/admin/news`: tabel
   (status, judul ID, tanggal), filter, pencarian; form buat/ubah dengan tiga bahasa dalam satu formulir
   (tab JA/EN/ID per kolom teks, tombol "salin dari ID"), editor blok sederhana untuk `ContentBlock[]`
   (paragraf, judul, daftar, kutipan, callout) tanpa library berat, simpan draf, terbitkan, arsipkan;
   setelah terbitkan panggil `POST /api/revalidate` dengan `REVALIDATE_SECRET`.
4. `/admin/prayer`: ubah koreksi menit per salat, aturan iqamah, jam Jumat, koreksi Hijriah, rentang
   Ramadan (`prayer_config`).
5. `/admin/donations`: daftar konfirmasi (pending/matched/rejected), pencocokan manual (tandai cocok +
   catatan), donatur tetap, ekspor CSV (hanya `super_admin` & `donation_admin`).
6. `/admin/inbox`: pendaftar agenda/program, peminjaman ruangan, saran/laporan fasilitas, pesan kontak;
   ubah status; ekspor CSV.
7. `/admin/push`: jumlah subscription per bahasa, kirim pengumuman push manual (judul/isi 3 bahasa) ke
   `POST /api/push/send` mode `broadcast`.
8. `/admin/admins` (super_admin): kelola admin & peran; `/admin/activity`: log aktivitas.

## Aturan
- Setiap mutasi lewat Server Action yang memanggil `requireAdmin` + validasi zod + tulis `activity_log`.
- UI memakai komponen `ui/*` yang sama (tanpa shadcn tambahan), tabel responsif (kartu di mobile).
- Tanpa Supabase (`!isSupabaseConfigured()`): semua halaman menampilkan banner demo dan data seed
  hanya-baca; tombol simpan nonaktif dengan tooltip.

## Selesai berarti
typecheck, lint, test, build lulus; `/admin` dapat dibuka dalam mode demo tanpa env; dengan Supabase,
alur login → buat pengumuman → terbitkan → revalidate bekerja. Laporkan file yang dibuat.

## Tambahan (11 Nov 2026): CMS generik, pengaturan situs, dan unggah media
Semua isi situs yang wajar diubah pengurus kini dikelola dari panel, bukan dari `src/data`:

- **Koleksi** (`content_items`, satu baris per item, `data` jsonb berbentuk tipe di `src/lib/types.ts`):
  FAQ, galeri, program, ruangan, tempat halal, pengurus, fasilitas, sejarah, rekening donasi, program donasi,
  laporan keuangan. Rute `/admin/cms/<slug>` (daftar, `new`, `[id]`).
- **Pengaturan tunggal** (`site_settings`): profil & kontak, video unggulan, pop-up promo. Rute `/admin/settings/<slug>`.
- **Akun saya** (`/admin/account`): nama tampilan dan ganti kata sandi.
- Definisi kolom di `src/components/admin/cms/registry.ts`; formulir (`cms-fields.tsx`), pembersihan dan validasi Zod
  (`fields.ts`), serta aksi server (`src/actions/admin/cms.ts`) dibangun dari definisi yang sama.
- Unggah gambar (`image-upload.tsx` + `src/actions/admin/media.ts`): kompres WebP di browser, signed upload URL,
  langsung ke bucket `media`; berkas yang tidak lagi dirujuk dihapus saat simpan/hapus.
- Peran: koleksi donasi hanya `donation_admin` + `super_admin` (fungsi SQL `can_manage_collection`), lainnya `content_admin`.
- Data rujukan tetap (kamus, doa, hadis, bahan haram, tanggal penting Hijriah, metadata surah) tetap di `src/data`.
- Setelah mutasi: `revalidatePublic()` = `updateTag("cms")` + `revalidatePath("/", "layout")`.
- Skema: `supabase/migrations/0003_cms.sql`; berkas siap tempel `supabase/setup-all.sql` (dibuat `pnpm db:sql`).
