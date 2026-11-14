# CLAUDE.md — Web Publik Al Muttaqin Cultural Center

## Konteks
Web publik almuttaqinculturalcenter.org: situs tiga bahasa (ja, en, id), App Jamaah (PWA), dan
admin konten untuk Al Muttaqin Cultural Center (masjid & pusat budaya Islam) di Matsudo, Chiba, Jepang.
Web internal pengurus (pengurus-acc.online) adalah aplikasi TERPISAH dan bukan bagian repo ini.
PRD induk: `docs/prd/00-master.md`. Baca bagian yang relevan sebelum mengerjakan modul.

## Stack (terpasang)
Next.js 16.4 App Router (Turbopack) + TypeScript strict, Tailwind CSS v4 (loader `@tailwindcss/turbopack`,
token di `src/app/globals.css`), `radix-ui` (paket terpadu: `import { Dialog, Tabs } from "radix-ui"`),
lucide-react, Motion, Embla, next-intl 4 (rute `/ja`, `/en`, `/id`), adhan, Serwist (Turbopack),
react-hook-form + zod, Leaflet (react-leaflet), Supabase (opsional; tanpa env memakai data seed).

## Aturan desain
- Gaya referensi UI: modern minimalis, hero hitam berpola (`hero-surface`), judul dua warna
  (`<TwoToneTitle>` / `<SectionHeading highlight>`), kartu membulat (`card-surface`, `card-muted`),
  tag pill di atas tiap section (`<SectionTag>`), daftar bernomor (`<NumberedItem>`).
- Warna hanya dari token Tailwind: `bg-background text-foreground bg-surface bg-primary text-brand
  bg-accent text-muted-foreground border-border bg-hero text-hero-foreground`. Tidak ada hex di komponen.
- Tanpa emoji di UI, kode, notifikasi, maupun seed data. Ikon hanya `lucide-react` 1.x (stroke 1,5 lewat
  `<IconCircle>`). Pakai nama ikon kanonik lucide 1.x: `TriangleAlert`, `CircleAlert`, `CircleCheck`,
  `CircleX`, `CircleQuestionMark`, `LoaderCircle`, `Ellipsis`, `House`, `FingerprintPattern`
  (TIDAK ADA: AlertTriangle, Home, Loader2, CircleHelp, Fingerprint, dan semua ikon merek seperti
  Youtube/Instagram/Facebook; untuk sosial pakai `@/components/site/social-icons`). Bila ragu, cek
  `node_modules/lucide-react/dist/lucide-react.d.ts` dengan grep sebelum memakai nama ikon.
- Mobile-first dan responsif penuh (uji 360, 768, 1280, 1536 px); mode terang & gelap (`.dark` di html,
  otomatis lewat `ThemeProvider`; tidak perlu `dark:` kecuali untuk kasus khusus karena token sudah berubah).
- Hormati `prefers-reduced-motion`. Animasi masuk pakai `animate-fade-up` atau Motion dengan `useReducedMotion`.
- Teks Jepang: biarkan `:lang(ja)` di globals.css menangani font & pemenggalan; jangan `word-break: keep-all`.

## Aturan kode
- Semua teks UI lewat `src/messages/{ja,en,id}/{namespace}.json`. Satu namespace per modul
  (daftar tetap di `src/messages/index.ts`). Kunci yang hilang otomatis jatuh ke EN, tetapi isi KETIGA bahasa.
  Jangan menambah namespace baru tanpa menambahkannya ke `NAMESPACES`.
- Konten database/seed berbentuk `{ ja, en, id }` (`LocalizedText`) atau `LocalizedBlocks`
  (`src/lib/types.ts`). Ambil dengan `pick(text, locale)` / `pickBlocks(blocks, locale)` dari `@/lib/utils/i18n`
  dan render blok dengan `<RichText blocks>`.
- Data hanya lewat `@/lib/data` (`getProfile`, `getPrayerConfig`, `getJumuahThisWeek`, `getAnnouncements`,
  `getEvents`, `getLectures`, `getNews`, `getDonationAccounts`, `getFaqs`, `getDictionary`, `getHalalPlaces`,
  `getDuas`, `getPrograms`, dst.). Jangan impor `@/data/*` langsung dari komponen/halaman.
- Server Components default; `"use client"` hanya untuk bagian interaktif (form, countdown, peta, dialog).
  Di client, pakai `useTranslations("namespace")`, `useLocale()`; di server `getTranslations({ locale, namespace })`.
- SETIAP `page.tsx` dan `layout.tsx` di bawah `[locale]` memanggil `setRequestLocale(locale)` sebelum
  fungsi next-intl lain (lihat template di bawah). `params` adalah Promise: `const { locale } = await params`.
- Navigasi hanya lewat `Link`, `useRouter`, `usePathname`, `redirect` dari `@/i18n/navigation`
  (bukan `next/link` / `next/navigation`). Href relatif tanpa prefix locale: `href="/prayer-times"`.
- Waktu: simpan ISO UTC, tampilkan Asia/Tokyo dengan `formatDate/formatTime/formatDateTime` dari
  `@/lib/utils/i18n`. Waktu salat lewat `@/lib/prayer` (`getPrayerTimesToday`, `getNextPrayer`,
  `getMonthSchedule`, `getQiblaDirection`), Hijriah lewat `@/lib/hijri`.
- Mutasi lewat Server Actions di `src/actions/*.ts`: validasi zod, cek rate limit sederhana, simpan ke
  Supabase bila `isSupabaseConfigured()`, selain itu kembalikan `{ ok: true, fallback: "whatsapp" }`
  dengan teks pesan WhatsApp agar jamaah tetap bisa mengirim.
- Formulir: react-hook-form + zod + komponen `Field`, `Input`, `Textarea`, `Select`, `Checkbox` dari
  `@/components/ui/input`; sertakan persetujuan privasi (`common.consent.privacy`).
- Metadata: tiap halaman mengekspor `generateMetadata` dengan judul & deskripsi terjemahan.
- Tanpa `any`; jalankan `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` sebelum selesai.

## CMS panel admin (konten dari Supabase)
- Dengan Supabase aktif, database adalah sumber kebenaran; `src/data/*` hanya seed awal dan fallback tanpa Supabase.
- Koleksi (FAQ, galeri, program, ruangan, tempat halal, pengurus, fasilitas, sejarah, rekening/program donasi, laporan)
  tersimpan di `content_items`; pengaturan tunggal (profil, video unggulan, pop-up promo) di `site_settings`.
- Menambah/mengubah kolom formulir admin: edit `src/components/admin/cms/registry.ts` (FieldDef). Formulir, validasi Zod,
  dan penyimpanan mengikuti. Tes `fields.test.ts` memastikan seed tetap lolos skema dan tidak ada kolom yang hilang.
- Pembacaan publik di-cache (`unstable_cache`, tag `cms`) di `src/lib/data/supabase-adapter.ts`; setiap mutasi admin wajib
  memanggil `revalidatePublic()` dari `src/actions/admin/shared.ts`.
- Unggah gambar selalu lewat `<ImageUpload>` (kompres di browser, signed upload URL); tampilkan unggahan dengan
  `unoptimized={shouldSkipOptimization(src)}` dari `@/lib/utils/media`.
- Ringan: komponen formulir (zod + react-hook-form) diekspor dari `lazy-forms.tsx` modulnya, bukan langsung dari `index.ts`;
  namespace pesan yang hanya dipakai server didaftarkan di `SERVER_ONLY_NAMESPACES` (`src/messages/index.ts`).
- Mengubah skema: tambah berkas di `supabase/migrations/`, daftarkan di `scripts/build-sql.mjs`, jalankan `pnpm db:sql`,
  lalu uji (lihat README, bagian Menyiapkan Supabase).

## Komponen tersedia (`src/components`)
- `ui/button` (`Button`, `buttonVariants`: primary | secondary | outline | ghost | soft | link | inverse |
  outlineInverse | destructive; size sm | md | lg | icon), `ui/badge`, `ui/card` (`Card variant="default|muted|dark|brand"`),
  `ui/section-tag`, `ui/two-tone-title`, `ui/section-heading`, `ui/input` (Input, Textarea, Select, Checkbox,
  Label, Field), `ui/primitives` (Skeleton, Separator, Progress, IconCircle, EmptyState, NumberedItem),
  `ui/rich-text`, `ui/copy-button`, `ui/count-up`, `ui/tabs`, `ui/accordion`, `ui/dialog` (Dialog*, SheetContent),
  `ui/switch` (Switch, SwitchRow), `ui/tooltip`, `ui/toast` (`useToast()`), `ui/youtube-embed`
  (YouTubeEmbed, YouTubeLiveEmbed), `ui/carousel` (Carousel, CarouselItem).
- `site/header`, `site/footer`, `site/logo`, `site/nav-config` (NAV_GROUPS, APP_TABS, APP_SCREENS),
  `app/shell` (AppShell, AppScreenHeader), `app/bottom-nav`, `app/screen-icons`,
  `shared/theme-provider` (`useTheme`), `shared/theme-toggle`, `shared/language-switcher`.
- Utilitas CSS: `container-site`, `container-narrow`, `hero-surface`, `pattern-star`, `pattern-shippo`,
  `card-surface`, `card-muted`, `lift`, `headline`, `text-brand`, `safe-bottom`, `tabular`.

## Template halaman situs
```tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const t = await getTranslations({ locale, namespace: "faq" });
  return (
    <div className="container-site py-12 lg:py-16">
      <SectionHeading as="h1" tag={t("tag")} title={t("title")} highlight={t("highlight")} description={t("description")} />
    </div>
  );
}
```
Halaman App Jamaah: sama, tetapi di `src/app/[locale]/app/...` dan dibungkus `AppScreenHeader`
(konten selebar HP, maks 28rem; hindari grid lebih dari 2 kolom).

## Kepemilikan file (kerja paralel)
Setiap modul hanya menyentuh file di area miliknya: halaman di `src/app/[locale]/...` modul itu,
komponen di `src/components/<modul>/`, data seed di `src/data/<modul>.ts`, pesan di namespace miliknya,
dan `src/actions/<modul>.ts`. Jangan mengubah komponen `ui/`, `site/`, `app/shell`, layout, `globals.css`,
`src/lib/*`, atau `src/messages/index.ts`; bila perlu perubahan di sana, catat di laporan akhir.

## Selesai berarti
lint, typecheck, test, dan build lulus; laporkan file yang dibuat/diubah dan cara mengujinya.
