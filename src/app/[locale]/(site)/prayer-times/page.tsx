import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bell, CalendarPlus, ChevronLeft, ChevronRight, Calculator, Clock, Globe, Moon, MoonStar, Sun, Sunrise, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { METHOD_LABELS, OBLIGATORY_PRAYERS, PRAYER_NAMES, getPrayerTimesToday, isRamadan } from "@/lib/prayer";
import type { Locale } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { IconCircle } from "@/components/ui/primitives";
import { Card } from "@/components/ui/card";
import { HijriDateBadge, PrayerTimesTable, PrayerTodayCard } from "@/components/prayer";
import { PrintButton } from "@/components/prayer/print-button";
import { TimeCountdown } from "@/components/prayer/time-countdown";
import { duhaFrom, imsakFrom, monthKey, resolveMonth, shiftMonth } from "@/components/prayer/prayer-utils";

/** Tanggal "hari ini" dan hitungan bulan bergantung jam server; jangan diprerender saat build. */
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prayer" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function PrayerTimesPage({ params, searchParams }: PageProps) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const query = await searchParams;
  const [t, tc, config, profile] = await Promise.all([
    getTranslations({ locale, namespace: "prayer" }),
    getTranslations({ locale, namespace: "common" }),
    getPrayerConfig(),
    getProfile(),
  ]);

  const now = new Date();
  const { year, month } = resolveMonth(query.month, now);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const monthLabel = formatDate(Date.UTC(year, month - 1, 15), locale, { month: "long", year: "numeric" });
  const today = getPrayerTimesToday(config, profile.coordinates, now);
  const ramadan = isRamadan(config, now);
  const icsHref = `/api/prayer/calendar.ics?locale=${locale}&days=30`;
  const adjustments = PRAYER_NAMES.filter((name) => config.adjustments[name] !== 0).map(
    (name) => `${t(`names.${name}`)} ${config.adjustments[name] > 0 ? "+" : ""}${config.adjustments[name]}`,
  );
  const iqamahRules = OBLIGATORY_PRAYERS.map((name) => {
    const rule = config.iqamah[name];
    return rule.type === "offset" ? t("table.offsetRule", { prayer: t(`names.${name}`), count: rule.minutes }) : t("table.fixedRule", { prayer: t(`names.${name}`), time: rule.time });
  });

  return (
    <>
      {/* Saat mencetak, hanya tabel bulanan yang ditampilkan; header/footer situs ikut disembunyikan. */}
      <style>{`@media print { body > header, body > footer, header, footer, nav { display: none !important; } }`}</style>

      <section className="hero-surface print:hidden">
        <div className="container-site relative py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
            <div className="animate-fade-up">
              <SectionHeading as="h1" tone="inverse" tag={t("hero.tag")} tri={{ ja: tc("triScript.ja"), ar: tc("triScript.ar") }} title={t("hero.title")} highlight={t("hero.highlight")} description={t("hero.description")} />
              <div className="mt-6">
                <HijriDateBadge locale={locale} tone="inverse" withArabic />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={icsHref} download className={buttonVariants({ variant: "inverse", size: "lg" })}>
                  <CalendarPlus />
                  {t("hero.ics")}
                </a>
                <Link href="/app/prayer" className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
                  <Bell />
                  {t("hero.openApp")}
                </Link>
              </div>
            </div>
            <div className="animate-fade-up [animation-delay:120ms]">
              <PrayerTodayCard locale={locale} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {ramadan && (
        <section className="container-site pt-12 lg:pt-16 print:hidden">
          <Card variant="dark" className="grid grid-cols-1 gap-6 rounded-3xl p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-center">
            <div>
              <SectionHeading tone="inverse" tag={t("ramadan.tag")} title={t("ramadan.title")} highlight={t("ramadan.highlight")} description={t("ramadan.description")} />
              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-hero-foreground/15 bg-hero-foreground/5 p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-hero-muted uppercase">
                    <MoonStar className="size-4" aria-hidden />
                    {t("ramadan.imsak")}
                  </dt>
                  <dd className="tabular mt-1 text-3xl font-bold">{formatTime(imsakFrom(today.times.fajr), locale)}</dd>
                </div>
                <div className="rounded-2xl border border-hero-foreground/15 bg-hero-foreground/5 p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold tracking-wide text-hero-muted uppercase">
                    <Sun className="size-4" aria-hidden />
                    {t("ramadan.iftar")}
                  </dt>
                  <dd className="tabular mt-1 text-3xl font-bold">{formatTime(today.times.maghrib, locale)}</dd>
                </div>
              </dl>
            </div>
            <TimeCountdown targetIso={today.times.maghrib.toISOString()} label={t("ramadan.countdown")} doneLabel={t("ramadan.done")} tone="inverse" size="lg" />
          </Card>
        </section>
      )}

      <section className="container-site py-12 lg:py-16 print:py-0" id="monthly">
        <SectionHeading
          tag={t("table.tag")}
          title={t("table.title", { month: monthLabel })}
          highlight={monthLabel}
          description={t("table.description")}
          className="print:hidden"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/prayer-times?month=${monthKey(prev.year, prev.month)}#monthly`} className={buttonVariants({ variant: "outline", size: "iconSm" })} aria-label={t("table.prevMonth")}>
                <ChevronLeft />
              </Link>
              <Link href={`/prayer-times?month=${monthKey(next.year, next.month)}#monthly`} className={buttonVariants({ variant: "outline", size: "iconSm" })} aria-label={t("table.nextMonth")}>
                <ChevronRight />
              </Link>
              <PrintButton label={t("table.print")} />
              <a href={icsHref} download className={buttonVariants({ variant: "soft", size: "sm" })}>
                <CalendarPlus />
                {t("table.ics")}
              </a>
            </div>
          }
        />
        <h2 className="hidden text-xl font-bold print:block">
          {profile.shortName} · {t("table.caption", { month: monthLabel })}
        </h2>
        <div className="mt-8 print:mt-4">
          <PrayerTimesTable locale={locale} year={year} month={month} />
        </div>
      </section>

      <section className="container-site pb-12 lg:pb-16 print:hidden">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card variant="muted" className="rounded-3xl">
            <SectionHeading as="h3" tag={t("guide.tag")} title={t("guide.title")} highlight={t("guide.highlight")} />
            <dl className="mt-6 divide-y divide-border">
              <GuideRow icon={<Calculator />} term={t("guide.method")} detail={METHOD_LABELS[config.method]} />
              <GuideRow icon={<Sun />} term={t("guide.madhab")} detail={config.madhab === "hanafi" ? t("guide.hanafi") : t("guide.shafi")} />
              <GuideRow icon={<Globe />} term={t("guide.highLatitude")} detail={config.highLatitudeRule} />
              <GuideRow icon={<Clock />} term={t("guide.adjustments")} detail={adjustments.length ? adjustments.join(", ") : t("guide.adjustmentsNone")} />
              <GuideRow icon={<Bell />} term={t("guide.iqamah")} detail={iqamahRules.join("; ")} />
              <GuideRow
                icon={<Moon />}
                term={t("guide.jumuah")}
                detail={
                  <>
                    {t("guide.jumuahBody", { time: config.jumuah.time })}{" "}
                    <Link href="/jumuah" className="text-brand font-semibold underline-offset-4 hover:underline">
                      {t("guide.jumuahLink")}
                    </Link>
                  </>
                }
              />
              <GuideRow icon={<Globe />} term={t("guide.timezone")} detail={t("guide.timezoneBody")} />
            </dl>
            <div className="mt-6 rounded-2xl bg-background p-4">
              <p className="font-semibold">{t("guide.notifications")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("guide.notificationsBody")}</p>
              <Link href="/app/prayer" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
                <Bell />
                {t("guide.openApp")}
              </Link>
            </div>
          </Card>

          <Card className="rounded-3xl">
            <SectionHeading as="h3" tag={t("sunnah.tag")} title={t("sunnah.title")} highlight={t("sunnah.highlight")} description={t("sunnah.description")} />
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SunnahTile icon={<Moon />} title={t("sunnah.midnight")} hint={t("sunnah.midnightHint")} time={formatTime(today.sunnah.middleOfTheNight, locale)} />
              <SunnahTile icon={<MoonStar />} title={t("sunnah.lastThird")} hint={t("sunnah.lastThirdHint")} time={formatTime(today.sunnah.lastThirdOfTheNight, locale)} />
              <SunnahTile icon={<Sunrise />} title={t("sunnah.duha")} hint={t("sunnah.duhaHint")} time={formatTime(duhaFrom(today.times.sunrise), locale)} />
            </ul>
            <div className="mt-6 rounded-2xl bg-surface p-4">
              <p className="flex items-center gap-2 font-semibold">
                <TriangleAlert className="size-4 text-warning" aria-hidden />
                {t("sunnah.forbidden")}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>{t("sunnah.forbiddenAfterFajr", { from: formatTime(today.times.fajr, locale), to: formatTime(today.times.sunrise, locale) })}</li>
                <li>{t("sunnah.forbiddenNoon")}</li>
                <li>{t("sunnah.forbiddenAfterAsr", { from: formatTime(today.times.asr, locale), to: formatTime(today.times.maghrib, locale) })}</li>
              </ul>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}

function GuideRow({ icon, term, detail }: { icon: ReactNode; term: string; detail: ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <IconCircle size="sm" tone="soft">
        {icon}
      </IconCircle>
      <div className="min-w-0">
        <dt className="text-sm font-semibold">{term}</dt>
        <dd className="mt-0.5 text-sm text-muted-foreground">{detail}</dd>
      </div>
    </div>
  );
}

function SunnahTile({ icon, title, hint, time }: { icon: ReactNode; title: string; hint: string; time: string }) {
  return (
    <li className="card-muted flex flex-col gap-3 p-4">
      <IconCircle size="sm" tone="soft">
        {icon}
      </IconCircle>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="tabular mt-1 text-2xl font-bold">{time}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </li>
  );
}
