import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, CalendarCheck, CircleQuestionMark, Users } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getTransparencyReports } from "@/lib/data";
import { EmptyState, IconCircle } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { DonateCta, TransparencyChart, TransparencyReportCard } from "@/components/donate";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "transparency" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const PRINCIPLE_ICONS = { "1": BadgeCheck, "2": Users, "3": CalendarCheck, "4": CircleQuestionMark } as const;

export default async function TransparencyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, reports] = await Promise.all([getTranslations({ locale, namespace: "transparency" }), getTransparencyReports()]);
  const [latest, ...older] = reports;

  return (
    <div className="container-site space-y-16 py-12 lg:space-y-20 lg:py-16">
      <SectionHeading as="h1" tag={t("tag")} tri={{ ja: "会計報告", ar: "شفافية" }} title={t("title")} highlight={t("highlight")} description={t("description")} />

      <section aria-labelledby="principles-title" className="space-y-6">
        <SectionHeading as="h2" tag={t("principles.tag")} title={t("principles.title")} />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["1", "2", "3", "4"] as const).map((k) => {
            const Icon = PRINCIPLE_ICONS[k];
            return (
              <li key={k} className="card-muted flex flex-col gap-3 p-5">
                <IconCircle tone="soft" shape="square" size="sm">
                  <Icon />
                </IconCircle>
                <p className="font-bold">{t(`principles.${k}.title`)}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`principles.${k}.text`)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {reports.length === 0 ? (
        <EmptyState title={t("report.empty")} />
      ) : (
        <>
          <TransparencyChart reports={reports} locale={locale} months={6} />

          <section className="space-y-6" aria-label={t("report.latest")}>
            <TransparencyReportCard report={latest} locale={locale} featured />
          </section>

          {older.length > 0 && (
            <section className="space-y-6" aria-labelledby="archive-title">
              <h2 id="archive-title" className="headline text-2xl sm:text-3xl">
                {t("report.archive")}
              </h2>
              <div className="grid gap-6">
                {older.map((report) => (
                  <TransparencyReportCard key={report.id} report={report} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <DonateCta locale={locale} tone="inverse" />
    </div>
  );
}
