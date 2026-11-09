import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CalendarClock, MapPin, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getProfile } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { buttonVariants } from "@/components/ui/button";
import { SectionTag } from "@/components/ui/section-tag";
import { TwoToneTitle } from "@/components/ui/two-tone-title";
import { LogoMark } from "@/components/site/logo";
import { HijriDateBadge, PrayerTodayCard } from "@/components/prayer";

/**
 * Hero beranda: latar maroon gelap berpola geometris, judul dua warna (highlight emas agar
 * tetap terbaca di latar gelap), foto gedung Al Muttaqin dalam bingkai lengkung mihrab dengan
 * gradasi, lalu kartu salat hari ini yang menumpang di tepi bawah hero.
 */
export async function HomeHero({ locale }: { locale: Locale }) {
  const [t, profile] = await Promise.all([getTranslations({ locale, namespace: "home" }), getProfile()]);
  const place = `${pick(profile.city, locale)}, ${pick(profile.prefecture, locale)}`;

  return (
    <>
      <section className="hero-surface">
        {/* Cahaya lembut di belakang foto */}
        <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-gold-soft/10 blur-3xl" />
        <div className="container-site relative pt-10 pb-28 sm:pt-14 sm:pb-32 lg:pt-20 lg:pb-44">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14 xl:gap-20">
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
              <div aria-hidden className="mt-6 flex items-center gap-2">
                <span className="h-px w-12 bg-gold-soft/70" />
                <span className="size-1.5 rotate-45 bg-gold-soft" />
                <span className="h-px w-24 bg-gradient-to-r from-gold-soft/70 to-transparent" />
              </div>
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
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <HijriDateBadge locale={locale} tone="inverse" />
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/30 bg-hero-foreground/10 py-1 pr-3.5 pl-1 text-sm font-semibold text-hero-foreground shadow-sm backdrop-blur-sm">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-gold-soft text-hero">
                    <MapPin className="size-3.5" aria-hidden />
                  </span>
                  {place}
                </span>
              </div>
            </div>

            <figure className="animate-fade-up relative mx-auto w-full max-w-md [animation-delay:120ms] sm:max-w-lg lg:max-w-none">
              {/* Bingkai lengkung ganda (ornamen) */}
              <div aria-hidden className="absolute -inset-3 rounded-t-[999px] rounded-b-[2.25rem] border border-gold-soft/25 sm:-inset-4" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-[999px] rounded-b-[2rem] border border-hero-foreground/15 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src="/images/masjid/masjid-al-muttaqin.jpg"
                  alt={t("hero.photoAlt")}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, (min-width: 640px) 32rem, 92vw"
                  className="object-cover object-[50%_72%] lg:object-[50%_66%]"
                />
                {/* Gradasi: langit sedikit hangat, bawah menyatu dengan hero */}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-hero-2/25 via-transparent to-transparent mix-blend-multiply" />
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-hero via-hero/55 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                  <span className="flex items-center gap-3">
                    <LogoMark tone="inverse" className="size-10 sm:size-12" />
                    <span className="leading-tight">
                      <span className="block text-lg font-bold text-hero-foreground sm:text-xl">{t("hero.photoTitle")}</span>
                      <span className="block text-xs text-hero-muted sm:text-sm">{t("hero.photoCaption")}</span>
                    </span>
                  </span>
                </figcaption>
              </div>
              <span className="absolute top-6 -left-2 hidden items-center gap-2 rounded-2xl border border-hero-foreground/15 bg-hero/70 px-3 py-2 text-xs font-semibold text-hero-foreground shadow-lg backdrop-blur-md sm:inline-flex lg:-left-8">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-soft/70 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-gold-soft" />
                </span>
                {t("hero.openDaily")}
              </span>
            </figure>
          </div>
        </div>
      </section>

      {/* Kartu salat hari ini menumpang di tepi bawah hero */}
      <div className="container-site relative z-10 -mt-20 sm:-mt-24 lg:-mt-32">
        <div className="animate-fade-up [animation-delay:200ms]">
          <PrayerTodayCard locale={locale} variant="site" />
        </div>
      </div>
    </>
  );
}
