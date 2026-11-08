import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, HeartHandshake, Languages, Scale, Shield, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getBoard, getFacilities, getProfile, getTimeline } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionTag } from "@/components/ui/section-tag";
import { TwoToneTitle } from "@/components/ui/two-tone-title";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle, NumberedItem } from "@/components/ui/primitives";
import { BoardGrid, FacilitiesGrid, PartnersStrip, StatsRow, Timeline } from "@/components/about";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const PILLAR_ICONS = [Users, HeartHandshake, BookOpen, Languages] as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, profile, board, timeline, facilities] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getProfile(),
    getBoard(),
    getTimeline(),
    getFacilities(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="hero-surface">
        <div className="container-site relative py-16 lg:py-24">
          <SectionTag tone="inverse" tri={{ ja: "私たちについて", ar: "عن المركز" }}>
            {t("hero.tag")}
          </SectionTag>
          <TwoToneTitle as="h1" text={t("hero.title")} highlight={t("hero.highlight")} className="mt-5 max-w-3xl text-4xl text-hero-foreground sm:text-5xl lg:text-6xl" />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-hero-muted sm:text-lg">{t("hero.description")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className={buttonVariants({ variant: "inverse", size: "lg" })}>
              {t("hero.primaryCta")}
            </Link>
            <Link href="/gallery" className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
              {t("hero.secondaryCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Profil */}
      <section className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading tag={t("profile.tag")} title={t("profile.title")} highlight={t("profile.highlight")} />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-foreground/90 lg:col-span-7">
            <p className="text-lg">{pick(profile.description, locale)}</p>
            <p>{t("profile.body")}</p>
            <p className="text-sm text-muted-foreground">{pick(profile.legalName, locale)}</p>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="container-site pb-12 lg:pb-16">
        <StatsRow locale={locale} />
      </section>

      {/* Visi & misi */}
      <section className="bg-surface">
        <div className="container-site py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading tag={t("vision.tag")} title={t("vision.title")} highlight={t("vision.highlight")} description={t("vision.statement")} />
            </div>
            <div className="card-surface px-5 sm:px-6 lg:col-span-7">
              {PILLAR_ICONS.map((Icon, i) => (
                <NumberedItem key={i} index={i + 1} title={t(`vision.pillars.${i}.title`)} description={t(`vision.pillars.${i}.description`)} icon={<Icon />} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah */}
      <section className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading tag={t("history.tag")} title={t("history.title")} highlight={t("history.highlight")} description={t("history.description")} />
          </div>
          <div className="lg:col-span-7">
            <Timeline items={timeline} locale={locale} />
          </div>
        </div>
      </section>

      {/* Mitra */}
      <section className="bg-surface">
        <div className="container-site py-12 lg:py-16">
          <SectionHeading tag={t("partners.tag")} title={t("partners.title")} highlight={t("partners.highlight")} description={t("partners.description")} className="mb-8" />
          <PartnersStrip locale={locale} />
        </div>
      </section>

      {/* Pengurus */}
      <section className="container-site py-12 lg:py-16">
        <SectionHeading tag={t("board.tag")} title={t("board.title")} highlight={t("board.highlight")} description={t("board.description")} className="mb-8" />
        <BoardGrid members={board} locale={locale} placeholderLabel={t("board.placeholder")} />
      </section>

      {/* Fasilitas */}
      <section className="bg-surface">
        <div className="container-site py-12 lg:py-16">
          <SectionHeading tag={t("facilities.tag")} title={t("facilities.title")} highlight={t("facilities.highlight")} description={t("facilities.description")} className="mb-8" />
          <FacilitiesGrid items={facilities} locale={locale} />
        </div>
      </section>

      {/* Tata kelola & transparansi + relawan */}
      <section className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="hero-surface rounded-2xl p-6 sm:p-8">
            <div className="relative">
              <IconCircle tone="inverse">
                <Scale />
              </IconCircle>
              <SectionTag tone="inverse" className="mt-6">
                {t("governance.tag")}
              </SectionTag>
              <TwoToneTitle as="h2" text={t("governance.title")} highlight={t("governance.highlight")} className="mt-4 text-2xl text-hero-foreground sm:text-3xl" />
              <p className="mt-4 text-sm leading-relaxed text-hero-muted">{t("governance.body")}</p>
              <ul className="mt-5 space-y-2 text-sm text-hero-foreground/90">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex gap-3">
                    <Shield className="mt-0.5 size-4 shrink-0 text-hero-muted" aria-hidden />
                    <span>{t(`governance.items.${i}`)}</span>
                  </li>
                ))}
              </ul>
              <Link href="/transparency" className={cn(buttonVariants({ variant: "inverse" }), "mt-6")}>
                {t("governance.cta")}
                <ArrowRight />
              </Link>
            </div>
          </div>

          <div className="card-muted p-6 sm:p-8">
            <IconCircle tone="brand">
              <HeartHandshake />
            </IconCircle>
            <SectionTag className="mt-6">{t("volunteer.tag")}</SectionTag>
            <TwoToneTitle as="h2" text={t("volunteer.title")} highlight={t("volunteer.highlight")} className="mt-4 text-2xl sm:text-3xl" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("volunteer.body")}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  <span>{t(`volunteer.items.${i}`)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact?subject=volunteer" className={buttonVariants({ variant: "primary" })}>
                {t("volunteer.cta")}
                <ArrowRight />
              </Link>
              <Link href="/programs" className={buttonVariants({ variant: "outline" })}>
                {t("volunteer.secondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
