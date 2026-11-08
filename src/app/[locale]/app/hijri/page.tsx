import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getHijriImportantDates, getPrayerConfig } from "@/lib/data";
import { AppScreenHeader } from "@/components/app/shell";
import { HijriCalendar } from "@/components/worship";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hijri" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function HijriPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, config, importantDates] = await Promise.all([
    getTranslations({ locale, namespace: "hijri" }),
    getTranslations({ locale, namespace: "app" }),
    getPrayerConfig(),
    getHijriImportantDates(),
  ]);

  return (
    <div>
      <AppScreenHeader title={t("title")} description={t("description")} backLabel={ta("back")} />
      <HijriCalendar adjustment={config.hijriAdjustment} importantDates={importantDates} locale={locale} />
    </div>
  );
}
