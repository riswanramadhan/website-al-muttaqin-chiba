import type { Metadata } from "next";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getEvents } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { AppScreenHeader } from "@/components/app/shell";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { AddToCalendar, EventCard } from "@/components/activities";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: t("app.title"), description: t("app.description") };
}

export default async function AppAgendaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, upcoming] = await Promise.all([getTranslations({ locale, namespace: "events" }), getTranslations({ locale, namespace: "app" }), getEvents({ upcoming: true, limit: 8 })]);

  return (
    <div>
      <AppScreenHeader title={t("app.title")} description={t("app.description")} backLabel={ta("back")} />
      {upcoming.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title={t("app.empty")} />
      ) : (
        <ul className="grid gap-4">
          {upcoming.map((e) => (
            <li key={e.id} className="space-y-2">
              <EventCard event={e} locale={locale} compact past={false} />
              <AddToCalendar event={e} locale={locale} siteUrl={siteUrl} className="px-1" />
            </li>
          ))}
        </ul>
      )}
      <Link href="/events" className={buttonVariants({ variant: "outline", size: "md", className: "mt-6 w-full" })}>
        {t("app.seeAll")}
        <ArrowRight />
      </Link>
    </div>
  );
}
