import type { Metadata } from "next";
import { ArrowRight, BookOpen, DoorOpen, HeartHandshake, Languages, Mic, School, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale, Program } from "@/lib/types";
import { getEvents, getPrograms } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { IconCircle } from "@/components/ui/primitives";
import { EventBrowser } from "@/components/activities";

const ROUTINE_PROGRAMS: Program["id"][] = ["weekly-kajian", "tpa", "japanese-class"];

const PROGRAM_ICONS: Record<Program["icon"], typeof BookOpen> = {
  "book-open": BookOpen,
  "heart-handshake": HeartHandshake,
  languages: Languages,
  "door-open": DoorOpen,
  school: School,
  mic: Mic,
  users: Users,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function EventsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const { tab } = await searchParams;
  const [t, upcoming, past, programs] = await Promise.all([
    getTranslations({ locale, namespace: "events" }),
    getEvents({ upcoming: true }),
    getEvents({ past: true }),
    getPrograms(),
  ]);
  const routine = ROUTINE_PROGRAMS.map((id) => programs.find((p) => p.id === id)).filter((p): p is Program => Boolean(p));

  return (
    <div className="container-site space-y-14 py-12 lg:space-y-20 lg:py-16">
      <SectionHeading as="h1" tag={t("tag")} title={t("title")} highlight={t("highlight")} description={t("description")} />

      <EventBrowser upcoming={upcoming} past={past} locale={locale} initialTab={tab === "past" ? "past" : "upcoming"} />

      {routine.length > 0 && (
        <section aria-labelledby="events-routine">
          <SectionHeading tag={t("routine.tag")} title={t("routine.title")} highlight={t("routine.highlight")} description={t("routine.description")} />
          <h2 id="events-routine" className="sr-only">
            {t("routine.tag")}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routine.map((p) => {
              const Icon = PROGRAM_ICONS[p.icon];
              return (
                <li key={p.id}>
                  <Link href={`/programs/${p.slug}`} className="card-surface lift group flex h-full flex-col gap-4 p-5">
                    <IconCircle tone="soft" shape="square">
                      <Icon />
                    </IconCircle>
                    <div className="flex-1">
                      <h3 className="font-bold group-hover:text-brand">{pick(p.title, locale)}</h3>
                      <p className="mt-1 text-sm font-semibold text-brand">{pick(p.schedule, locale)}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{pick(p.excerpt, locale)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                      {t("routine.more")}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
