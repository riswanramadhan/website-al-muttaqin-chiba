import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatsRow } from "@/components/about";
import { HomeSection } from "./home-section";

/** Statistik (PRD-03b §8): StatsRow (count-up) di atas panel card-muted; ubin diberi latar terang agar kontras. */
export async function HomeStats({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <HomeSection id="stats">
      <div className="card-muted rounded-3xl p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeading tag={t("stats.tag")} title={t("stats.title")} highlight={t("stats.highlight")} description={t("stats.description")} />
          </div>
          <div className="lg:col-span-8">
            <StatsRow locale={locale} className="[&>div]:bg-background" />
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
