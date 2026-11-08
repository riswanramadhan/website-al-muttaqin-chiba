import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Calculator, CircleCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getDonationAccounts, getDonationPrograms, getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  DonationAccountsList,
  DonationFaq,
  DonationFlow,
  DonationProgress,
  GatewayCard,
  RecurringDonorForm,
} from "@/components/donate";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "donate" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function DonatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, programs, accounts, profile] = await Promise.all([
    getTranslations({ locale, namespace: "donate" }),
    getDonationPrograms(),
    getDonationAccounts(),
    getProfile(),
  ]);

  const formPrograms = programs.filter((p) => p.status === "open").map((p) => ({ slug: p.slug, label: pick(p.title, locale) }));
  const formAccounts = accounts.map((a) => ({
    id: a.id,
    label: `${pick(a.bankNameLocalized, locale) || a.bankName} · ${a.accountNumber}`,
    currency: a.currency,
  }));

  return (
    <div>
      <section className="hero-surface">
        <div className="container-site relative py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center">
            <div>
              <SectionHeading as="h1" tone="inverse" tag={t("hero.tag")} tri={{ ja: "寄付", ar: "إنفاق" }} title={t("hero.title")} highlight={t("hero.highlight")} description={t("hero.description")} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/donate#accounts" className={buttonVariants({ variant: "inverse", size: "lg" })}>
                  {t("hero.primaryCta")}
                  <ArrowRight />
                </Link>
                <Link href="/transparency" className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
                  {t("hero.secondaryCta")}
                </Link>
              </div>
            </div>
            <ul className="space-y-3">
              {(["1", "2", "3"] as const).map((k) => (
                <li key={k} className="flex items-start gap-3 rounded-xl border border-hero-foreground/15 bg-hero-foreground/5 p-4 text-sm leading-relaxed">
                  <IconCircle tone="inverse" size="sm">
                    <CircleCheck />
                  </IconCircle>
                  <span>{t(`hero.points.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="container-site space-y-20 py-12 lg:space-y-24 lg:py-16">
        <section className="space-y-8" aria-labelledby="programs-title">
          <SectionHeading tag={t("programs.tag")} title={t("programs.title")} highlight={t("programs.highlight")} description={t("programs.description")} />
          <DonationProgress locale={locale} />
        </section>

        <section id="accounts" className="scroll-mt-24 space-y-8" aria-labelledby="accounts-title">
          <SectionHeading tag={t("accounts.tag")} title={t("accounts.title")} highlight={t("accounts.highlight")} description={t("accounts.description")} />
          <DonationAccountsList locale={locale} />
        </section>

        <DonationFlow locale={locale} programs={formPrograms} accounts={formAccounts} />

        <section id="recurring" className="space-y-8" aria-labelledby="recurring-title">
          <SectionHeading tag={t("recurring.tag")} title={t("recurring.title")} highlight={t("recurring.highlight")} description={t("recurring.description")} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
            <ul className="card-muted space-y-4 p-5">
              {(["1", "2", "3"] as const).map((k) => (
                <li key={k} className="flex items-start gap-3 text-sm leading-relaxed">
                  <IconCircle tone="soft" size="sm">
                    <CircleCheck />
                  </IconCircle>
                  <span>{t(`recurring.benefits.${k}`)}</span>
                </li>
              ))}
            </ul>
            <RecurringDonorForm locale={locale} siteUrl={profile.website} />
          </div>
        </section>

        <GatewayCard locale={locale} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <section className="hero-surface rounded-2xl p-6 sm:p-8" aria-labelledby="zakat-teaser-title">
            <div className="relative">
              <IconCircle tone="inverse" size="lg">
                <Calculator />
              </IconCircle>
              <SectionHeading as="h2" tone="inverse" tag={t("zakatTeaser.tag")} title={t("zakatTeaser.title")} highlight={t("zakatTeaser.highlight")} description={t("zakatTeaser.description")} className="mt-5" />
              <Link href="/donate/zakat" className={`${buttonVariants({ variant: "inverse", size: "lg" })} mt-6`}>
                {t("zakatTeaser.cta")}
                <ArrowRight />
              </Link>
            </div>
          </section>
          <section className="space-y-6" aria-labelledby="faq-title">
            <SectionHeading tag={t("faq.tag")} title={t("faq.title")} highlight={t("faq.highlight")} />
            <DonationFaq locale={locale} />
          </section>
        </div>
      </div>
    </div>
  );
}
