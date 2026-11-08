import { getTranslations } from "next-intl/server";
import { CalendarClock, MapPin, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getProfile } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { buttonVariants } from "@/components/ui/button";
import { SectionTag } from "@/components/ui/section-tag";
import { TwoToneTitle } from "@/components/ui/two-tone-title";
import { HijriDateBadge, PrayerTodayCard } from "@/components/prayer";

/**
 * Hero beranda (PRD-03b §1): latar hitam berpola CSS (tanpa gambar, LCP ringan), tag tiga aksara,
 * judul dua warna, dua tombol utama, tanggal Hijriah, dan kartu salat hari ini di kanan.
 */
export async function HomeHero({ locale }: { locale: Locale }) {
  const [t, profile] = await Promise.all([getTranslations({ locale, namespace: "home" }), getProfile()]);

  return (
    <section className="hero-surface">
      <div className="container-site relative py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div className="animate-fade-up">
            <SectionTag tone="inverse" tri={{ ja: "マスジド", ar: "مسجد" }}>
              {t("hero.tag")}
            </SectionTag>
            <TwoToneTitle
              as="h1"
              text={t("hero.title")}
              highlight={t("hero.highlight")}
              className="mt-5 max-w-3xl text-4xl text-hero-foreground sm:text-5xl lg:text-6xl"
            />
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-hero-muted sm:text-lg">{t("hero.description")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/prayer-times" className={buttonVariants({ variant: "inverse", size: "lg" })}>
                <CalendarClock />
                {t("hero.prayerCta")}
              </Link>
              <Link href="/app" className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
                <Smartphone />
                {t("hero.appCta")}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <HijriDateBadge locale={locale} tone="inverse" />
              <p className="flex items-center gap-2 text-sm text-hero-muted">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span>
                  {pick(profile.city, locale)}, {pick(profile.prefecture, locale)}
                </span>
              </p>
            </div>
          </div>
          <div className="animate-fade-up [animation-delay:120ms]">
            <PrayerTodayCard locale={locale} variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
