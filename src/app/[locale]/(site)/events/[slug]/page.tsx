import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, Languages, MapPin, Mic, Repeat, Ticket, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { getEventBySlug, getEvents, getProfile } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { formatCurrency, formatDate, formatDateTime, formatTime, formatWeekday, pick, pickBlocks } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { AddToCalendar, EventCard, EventRegistrationForm, ShareButton, registrationState } from "@/components/activities";

export async function generateStaticParams() {
  const events = await getEvents();
  return routing.locales.flatMap((locale) => events.map((e) => ({ locale, slug: e.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return { title: pick(event.title, locale as Locale), description: pick(event.excerpt, locale as Locale) };
}

export default async function EventDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const [t, tc, others, profile] = await Promise.all([
    getTranslations({ locale, namespace: "events" }),
    getTranslations({ locale, namespace: "common" }),
    getEvents({ upcoming: true, limit: 4 }),
    getProfile(),
  ]);
  const title = pick(event.title, locale);
  const state = registrationState(event);
  const reg = event.registration;
  const otherEvents = others.filter((e) => e.id !== event.id).slice(0, 3);
  const eventUrl = `/${locale}/events/${event.slug}`;
  const showForm = reg.required && !state.past && !state.deadlinePassed;

  return (
    <div className="container-site py-12 lg:py-16">
      <Link href="/events" className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-3" })}>
        <ArrowLeft />
        {t("detail.back")}
      </Link>

      <article className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="soft">{tc(`categories.${event.category}`)}</Badge>
            {state.past ? (
              <Badge variant="outline">{t("card.finished")}</Badge>
            ) : reg.required ? (
              state.full ? <Badge variant="warning">{t("card.waitlist")}</Badge> : state.open ? <Badge variant="success">{t("card.registrationOpen")}</Badge> : <Badge variant="outline">{t("detail.deadlinePassed")}</Badge>
            ) : (
              <Badge variant="outline">{t("card.noRegistration")}</Badge>
            )}
            {event.languages.map((lang) => (
              <Badge key={lang} variant="outline" className="px-2 py-0 text-[0.65rem]">
                {lang.toUpperCase()}
              </Badge>
            ))}
          </div>
          <h1 className="headline mt-4 text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{pick(event.excerpt, locale)}</p>

          <div className="card-muted mt-6 flex items-center gap-4 p-4 sm:p-5">
            <div className="flex w-20 shrink-0 flex-col items-center rounded-xl bg-background py-2 text-center">
              <span className="text-[0.65rem] font-semibold tracking-wide uppercase">{formatWeekday(event.startsAt, locale, "short")}</span>
              <span className="text-3xl leading-none font-bold tabular">{formatDate(event.startsAt, locale, { day: "numeric" })}</span>
              <span className="mt-1 text-xs font-semibold">{formatDate(event.startsAt, locale, { month: "short", year: "numeric" })}</span>
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{formatDate(event.startsAt, locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              <p className="mt-1 text-muted-foreground tabular">
                {formatTime(event.startsAt, locale)}–{formatTime(event.endsAt, locale)} {tc("labels.jst")}
              </p>
              {event.recurring && <p className="mt-1 text-muted-foreground">{pick(event.recurring, locale)}</p>}
            </div>
          </div>

          <section className="mt-8" aria-labelledby="event-about">
            <h2 id="event-about" className="text-xl font-bold">
              {t("detail.about")}
            </h2>
            <RichText blocks={pickBlocks(event.description, locale)} className="mt-4" />
          </section>

          {state.past && <p className="card-muted mt-8 p-4 text-sm text-muted-foreground">{t("detail.pastEvent")}</p>}

          {showForm && (
            <section className="mt-10" aria-label={t("form.title")}>
              <EventRegistrationForm eventSlug={event.slug} eventTitle={title} locale={locale} full={state.full} closed={false} />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.practical")}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">{t("detail.date")}</dt>
                  <dd className="font-semibold">{formatDate(event.startsAt, locale, { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">{t("detail.time")}</dt>
                  <dd className="font-semibold tabular">
                    {formatTime(event.startsAt, locale)}–{formatTime(event.endsAt, locale)} {tc("labels.jst")}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">{t("detail.location")}</dt>
                  <dd className="font-semibold">{pick(event.location, locale)}</dd>
                  <dd className="text-muted-foreground">{pick(profile.name, locale)}</dd>
                  <dd>
                    <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="tap-link mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                      <ExternalLink className="size-3.5" aria-hidden />
                      {t("detail.openMaps")}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Languages className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">{t("detail.languages")}</dt>
                  <dd className="font-semibold">{event.languages.map((l) => l.toUpperCase()).join(" · ")}</dd>
                </div>
              </div>
              {event.speaker && (
                <div className="flex gap-3">
                  <Mic className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("detail.speaker")}</dt>
                    <dd className="font-semibold">{event.speaker}</dd>
                  </div>
                </div>
              )}
              {event.recurring && (
                <div className="flex gap-3">
                  <Repeat className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("detail.recurring")}</dt>
                    <dd className="font-semibold">{pick(event.recurring, locale)}</dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Ticket className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">{t("detail.fee")}</dt>
                  <dd className="font-semibold">{reg.fee ? formatCurrency(reg.fee.amount, reg.fee.currency, locale) : t("detail.free")}</dd>
                  {reg.fee?.note && <dd className="text-xs text-muted-foreground">{pick(reg.fee.note, locale)}</dd>}
                </div>
              </div>
              {reg.required && reg.quota !== undefined && (
                <div className="flex gap-3">
                  <Users className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs text-muted-foreground">{t("detail.quota")}</dt>
                    <dd className="font-semibold">{t("detail.quotaValue", { registered: reg.registered ?? 0, quota: reg.quota })}</dd>
                    <dd className="mt-2">
                      <Progress value={reg.registered ?? 0} max={reg.quota} tone={state.full ? "success" : "brand"} label={t("detail.quota")} />
                    </dd>
                    <dd className="mt-1 text-xs text-muted-foreground">{t("detail.remaining", { count: state.remaining ?? 0 })}</dd>
                    {reg.deadline && !state.past && <dd className="mt-1 text-xs text-muted-foreground">{t("card.deadline", { date: formatDateTime(reg.deadline, locale) })}</dd>}
                  </div>
                </div>
              )}
              {!reg.required && (
                <div className="flex gap-3">
                  <Users className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <dd className="text-muted-foreground">{t("detail.noRegistration")}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="card-surface p-5">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.addToCalendar")}</h2>
            <AddToCalendar event={event} locale={locale} siteUrl={siteUrl} className="mt-3" />
            <ShareButton title={title} text={pick(event.excerpt, locale)} url={eventUrl} label={t("detail.share")} variant="soft" size="sm" className="mt-2" />
          </div>
        </aside>
      </article>

      {otherEvents.length > 0 && (
        <section className="mt-16" aria-labelledby="event-others">
          <SectionHeading as="h2" title={t("detail.others")} description={t("detail.othersDescription")} />
          <h2 id="event-others" className="sr-only">
            {t("detail.others")}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {otherEvents.map((e) => (
              <li key={e.id}>
                <EventCard event={e} locale={locale} compact past={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
