import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Baby, CalendarPlus, Car, Footprints, Languages, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPastJumuah, getUpcomingJumuah } from "@/lib/data";
import type { JumuahSchedule, Locale } from "@/lib/types";
import { formatDate, formatWeekday, parseTokyoDate, pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, IconCircle, NumberedItem } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { JumuahCard } from "@/components/prayer";

/** Jumat "pekan ini" bergantung tanggal server; jangan diprerender saat build. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "jumuah" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const ETIQUETTE_KEYS = ["1", "2", "3", "4", "5"] as const;
const PRACTICAL = [
  { key: "parking", Icon: Car },
  { key: "women", Icon: Users },
  { key: "shoes", Icon: Footprints },
  { key: "children", Icon: Baby },
] as const;

export default async function JumuahPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, tc, upcoming, past] = await Promise.all([
    getTranslations({ locale, namespace: "jumuah" }),
    getTranslations({ locale, namespace: "common" }),
    getUpcomingJumuah(5),
    getPastJumuah(8),
  ]);
  // Kartu "pekan ini" sudah menampilkan Jumat terdekat; daftar mendatang mulai dari Jumat berikutnya.
  const later = upcoming.slice(1);
  const icsHref = `/api/prayer/calendar.ics?locale=${locale}&days=30`;

  return (
    <>
      <section className="hero-surface">
        <div className="container-site relative py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
            <div className="animate-fade-up">
              <SectionHeading as="h1" tone="inverse" tag={t("hero.tag")} tri={{ ja: t("hero.triJa"), ar: t("hero.triAr") }} title={t("hero.title")} highlight={t("hero.highlight")} description={t("hero.description")} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/prayer-times" className={buttonVariants({ variant: "inverse", size: "lg" })}>
                  {t("card.prayerTimes")}
                </Link>
                <a href={icsHref} download className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
                  <CalendarPlus />
                  {t("ics.button")}
                </a>
              </div>
            </div>
            <div className="animate-fade-up [animation-delay:120ms]">
              <JumuahCard locale={locale} tone="inverse" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading tag={t("upcoming.tag")} title={t("upcoming.title")} highlight={t("upcoming.highlight")} description={t("upcoming.description")} />
            <div className="mt-8">
              {later.length ? (
                <ul className="space-y-3">
                  {later.map((j) => (
                    <JumuahRow key={j.id} jumuah={j} locale={locale} languageLabel={t(`languages.${j.language}`)} khatibLabel={tc("labels.khatib")} />
                  ))}
                </ul>
              ) : (
                <EmptyState title={t("upcoming.empty")} />
              )}
            </div>
          </div>
          <div>
            <SectionHeading tag={t("past.tag")} title={t("past.title")} highlight={t("past.highlight")} description={t("past.description")} />
            <div className="mt-8">
              {past.length ? (
                <ul className="space-y-3">
                  {past.map((j) => (
                    <JumuahRow key={j.id} jumuah={j} locale={locale} languageLabel={t(`languages.${j.language}`)} khatibLabel={tc("labels.khatib")} muted />
                  ))}
                </ul>
              ) : (
                <EmptyState title={t("past.empty")} />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-site pb-12 lg:pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card variant="muted" className="rounded-3xl">
            <SectionHeading as="h3" tag={t("etiquette.tag")} title={t("etiquette.title")} highlight={t("etiquette.highlight")} description={t("etiquette.description")} />
            <div className="mt-4">
              {ETIQUETTE_KEYS.map((key, i) => (
                <NumberedItem key={key} index={i + 1} title={t(`etiquette.items.${key}.title`)} description={t(`etiquette.items.${key}.body`)} />
              ))}
            </div>
          </Card>
          <div className="space-y-6">
            <Card className="rounded-3xl">
              <SectionHeading as="h3" tag={t("practical.tag")} title={t("practical.title")} highlight={t("practical.highlight")} />
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {PRACTICAL.map(({ key, Icon }) => (
                  <li key={key} className="flex items-start gap-3">
                    <IconCircle size="sm" tone="soft">
                      <Icon />
                    </IconCircle>
                    <div>
                      <p className="text-sm font-semibold">{t(`practical.items.${key}.title`)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t(`practical.items.${key}.body`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card variant="dark" className="rounded-3xl">
              <h3 className="text-lg font-bold">{t("ics.title")}</h3>
              <p className="mt-2 text-sm text-hero-muted">{t("ics.body")}</p>
              <a href={icsHref} download className={buttonVariants({ variant: "inverse", size: "md", className: "mt-5" })}>
                <CalendarPlus />
                {t("ics.button")}
              </a>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

function JumuahRow({ jumuah, locale, languageLabel, khatibLabel, muted = false }: { jumuah: JumuahSchedule; locale: Locale; languageLabel: string; khatibLabel: string; muted?: boolean }) {
  const date = parseTokyoDate(jumuah.date);
  return (
    <li className={muted ? "card-muted p-4" : "card-surface p-4"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {formatWeekday(date, locale, "short")}, {formatDate(date, locale, { day: "numeric", month: "long", year: "numeric" })}
          <span className="tabular ml-2 text-muted-foreground">{jumuah.time}</span>
        </p>
        <Badge variant={muted ? "outline" : "soft"}>
          <Languages aria-hidden />
          {languageLabel}
        </Badge>
      </div>
      {jumuah.topic && <p className="mt-2 font-semibold">{pick(jumuah.topic, locale)}</p>}
      <p className="mt-1 text-sm text-muted-foreground">
        {khatibLabel}: {jumuah.khatib}
      </p>
    </li>
  );
}
