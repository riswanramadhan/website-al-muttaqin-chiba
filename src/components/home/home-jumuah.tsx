import { getTranslations } from "next-intl/server";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getEvents } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { JumuahCard } from "@/components/prayer";
import { EventCard } from "@/components/activities";
import { HomeSection } from "./home-section";

/** Jumat pekan ini + tiga agenda terdekat (PRD-03b §3). */
export async function HomeJumuah({ locale }: { locale: Locale }) {
  const [t, events] = await Promise.all([getTranslations({ locale, namespace: "home" }), getEvents({ upcoming: true, limit: 3 })]);

  return (
    <HomeSection id="this-week" tone="surface">
      <SectionHeading
        tag={t("jumuah.tag")}
        title={t("jumuah.title")}
        highlight={t("jumuah.highlight")}
        description={t("jumuah.description")}
        action={
          <Link href="/events" className={buttonVariants({ variant: "outline" })}>
            {t("jumuah.seeAll")}
            <ArrowRight />
          </Link>
        }
      />
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <JumuahCard locale={locale} className="h-full" />
        </div>
        <div className="lg:col-span-7">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            <CalendarDays className="size-4" aria-hidden />
            {t("jumuah.agendaTitle")}
          </h3>
          {events.length === 0 ? (
            <EmptyState icon={<CalendarDays />} title={t("jumuah.empty")} />
          ) : (
            <ul className="grid gap-4">
              {events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} locale={locale} compact />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </HomeSection>
  );
}
