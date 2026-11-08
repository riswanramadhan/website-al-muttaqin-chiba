import { getTranslations } from "next-intl/server";
import { ArrowRight, Quote } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getHadithOfTheDay } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { IconCircle } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { HomeSection } from "./home-section";

/** Hadis hari ini (PRD-03b §9): teks Arab (font-arabic, RTL) dan terjemahan sesuai bahasa. */
export async function HomeHadith({ locale }: { locale: Locale }) {
  const [t, hadith] = await Promise.all([getTranslations({ locale, namespace: "home" }), getHadithOfTheDay()]);

  return (
    <HomeSection id="hadith" tone="surface">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading tag={t("hadith.tag")} tri={{ ar: "حديث" }} title={t("hadith.title")} highlight={t("hadith.highlight")} description={t("hadith.description")} />
          <Link href="/islam" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline">
            {t("hadith.more")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <figure className="card-surface relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:col-span-8">
          <span className="pattern-star-subtle pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <IconCircle tone="brand">
              <Quote />
            </IconCircle>
            {hadith.arabic && (
              <p lang="ar" dir="rtl" className="font-arabic mt-6 text-right text-2xl leading-loose sm:text-3xl">
                {hadith.arabic}
              </p>
            )}
            <blockquote className="mt-6 text-lg leading-relaxed font-medium sm:text-xl">
              <p>{pick(hadith.text, locale)}</p>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px w-8 bg-brand" aria-hidden />
              <span>
                {t("hadith.source")}: {hadith.source}
              </span>
            </figcaption>
          </div>
        </figure>
      </div>
    </HomeSection>
  );
}
