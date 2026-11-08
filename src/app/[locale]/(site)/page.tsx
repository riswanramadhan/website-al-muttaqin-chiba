import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { siteUrl } from "@/lib/site";
import {
  HomeContact,
  HomeDonate,
  HomeFaq,
  HomeGallery,
  HomeHadith,
  HomeHero,
  HomeJsonLd,
  HomeJumuah,
  HomeLectures,
  HomeLiveStrip,
  HomeNewcomers,
  HomeNews,
  HomePortal,
  HomePrograms,
  HomeServices,
  HomeStats,
} from "@/components/home";

/** Beranda memuat "hari ini" (salat, Hijriah, hadis harian, Jumat pekan ini); jangan diprerender saat build. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const title = t("meta.title");
  const description = t("meta.description");
  const url = `${siteUrl}/${locale}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Beranda situs (PRD-03b): 14 section berurutan, mobile-first. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;

  return (
    <>
      <HomeJsonLd locale={locale} />
      {/* 1. Hero + status live dan pengumuman tersemat */}
      <HomeHero locale={locale} />
      <HomeLiveStrip locale={locale} />
      {/* 2. Portal jamaah */}
      <HomePortal locale={locale} />
      {/* 3. Jumat pekan ini */}
      <HomeJumuah locale={locale} />
      {/* 4. Layanan kami 01-06 */}
      <HomeServices locale={locale} />
      {/* 5. Program */}
      <HomePrograms locale={locale} />
      {/* 6. Kajian terbaru */}
      <HomeLectures locale={locale} />
      {/* 7. Infaq */}
      <HomeDonate locale={locale} />
      {/* 8. Statistik */}
      <HomeStats locale={locale} />
      {/* 9. Hadis hari ini */}
      <HomeHadith locale={locale} />
      {/* 10. Berita & pengumuman */}
      <HomeNews locale={locale} />
      {/* 11. Baru di Chiba */}
      <HomeNewcomers locale={locale} />
      {/* 12. Galeri */}
      <HomeGallery locale={locale} />
      {/* 13. FAQ */}
      <HomeFaq locale={locale} />
      {/* 14. Kontak & akses */}
      <HomeContact locale={locale} />
    </>
  );
}
