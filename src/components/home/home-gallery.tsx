import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getGallery } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { GalleryGrid } from "@/components/about";
import { HomeSection } from "./home-section";

/** Galeri (PRD-03b §12): enam foto kegiatan terbaru. */
export async function HomeGallery({ locale }: { locale: Locale }) {
  const [t, items] = await Promise.all([getTranslations({ locale, namespace: "home" }), getGallery()]);

  return (
    <HomeSection id="gallery">
      <SectionHeading
        tag={t("gallery.tag")}
        title={t("gallery.title")}
        highlight={t("gallery.highlight")}
        description={t("gallery.description")}
        action={
          <Link href="/gallery" className={buttonVariants({ variant: "outline" })}>
            {t("gallery.seeAll")}
            <ArrowRight />
          </Link>
        }
      />
      <GalleryGrid items={items} locale={locale} limit={6} className="mt-10" />
    </HomeSection>
  );
}
