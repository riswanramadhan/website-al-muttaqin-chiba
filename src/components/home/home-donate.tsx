import { getTranslations } from "next-intl/server";
import { ArrowRight, Landmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { IconCircle } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { DonateCta, DonationAccountsList, DonationProgress } from "@/components/donate";
import { HomeSection } from "./home-section";

/**
 * Infaq (PRD-03b §7): section gelap berisi ajakan infaq, dua program donasi berjalan,
 * dan rekening ringkas. Kartu terang diberi `text-foreground` agar teks tidak mewarisi warna hero.
 */
export async function HomeDonate({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <HomeSection id="infaq" tone="dark">
      <SectionHeading tone="inverse" tag={t("donate.tag")} tri={{ ar: "إنفاق" }} title={t("donate.title")} highlight={t("donate.highlight")} description={t("donate.description")} />
      <div className="mt-10 overflow-hidden rounded-2xl border border-hero-foreground/15">
        <DonateCta locale={locale} tone="inverse" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="text-foreground lg:col-span-7">
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-hero-muted uppercase">{t("donate.programsTitle")}</h3>
          <DonationProgress locale={locale} limit={2} columns={2} />
        </div>
        <div className="lg:col-span-5">
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-hero-muted uppercase">{t("donate.accountsTitle")}</h3>
          <div className="card-surface p-5 text-foreground sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <IconCircle size="sm" tone="soft">
                <Landmark />
              </IconCircle>
              <p className="text-sm text-muted-foreground">{t("donate.accountsDescription")}</p>
            </div>
            <DonationAccountsList locale={locale} compact />
            <Link href="/donate" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline">
              {t("donate.accountsCta")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
