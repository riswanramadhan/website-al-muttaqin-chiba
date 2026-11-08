import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getGallery, getProfile } from "@/lib/data";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { InstagramIcon } from "@/components/site/social-icons";
import { GalleryGrid } from "@/components/about";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, tc, items, profile] = await Promise.all([
    getTranslations({ locale, namespace: "gallery" }),
    getTranslations({ locale, namespace: "common" }),
    getGallery(),
    getProfile(),
  ]);

  return (
    <div className="container-site py-12 lg:py-16">
      <SectionHeading as="h1" tag={t("hero.tag")} tri={{ ja: "ギャラリー", ar: "معرض الصور" }} title={t("hero.title")} highlight={t("hero.highlight")} description={t("hero.description")} />

      <div className="mt-10">
        <GalleryGrid items={items} locale={locale} />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{t("placeholderNote")}</p>

      {profile.social.instagram && (
        <section className="hero-surface mt-16 rounded-2xl p-6 sm:p-10 lg:mt-20">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-wide text-hero-muted uppercase">{t("instagram.tag")}</p>
              <h2 className="headline mt-3 text-2xl text-hero-foreground sm:text-3xl">{t("instagram.title")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-hero-muted">{t("instagram.body")}</p>
            </div>
            <a href={profile.social.instagram} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "inverse", size: "lg" })}>
              <InstagramIcon className="size-4" />
              {t("instagram.cta")}
              <ExternalLink className="size-3.5" aria-hidden />
              <span className="sr-only">({tc("a11y.externalLink")})</span>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
