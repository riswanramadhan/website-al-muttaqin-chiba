import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { getUpcomingSchedule, serializeDay } from "@/lib/prayer";
import type { Locale } from "@/lib/types";
import { AppScreenHeader } from "@/components/app/shell";
import { buttonVariants } from "@/components/ui/button";
import { JumuahCard, PrayerTodayCard } from "@/components/prayer";
import { OfflineSchedule } from "@/components/prayer/offline-schedule";

/** Jadwal mulai "hari ini" bergantung jam server; jangan diprerender saat build. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prayer" });
  return { title: t("app.title"), description: t("app.description") };
}

export default async function AppPrayerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, config, profile] = await Promise.all([
    getTranslations({ locale, namespace: "prayer" }),
    getTranslations({ locale, namespace: "app" }),
    getPrayerConfig(),
    getProfile(),
  ]);
  const initialDays = getUpcomingSchedule(7, config, profile.coordinates).map(serializeDay);

  return (
    <div className="space-y-5">
      <AppScreenHeader title={t("app.title")} description={t("app.description")} backLabel={ta("back")} />
      <PrayerTodayCard locale={locale} variant="app" />
      <OfflineSchedule initialDays={initialDays} />
      <JumuahCard locale={locale} compact />
      <Link href="/prayer-times" className={buttonVariants({ variant: "outline", size: "md", className: "w-full" })}>
        <CalendarDays />
        {t("app.fullSchedule")}
      </Link>
    </div>
  );
}
