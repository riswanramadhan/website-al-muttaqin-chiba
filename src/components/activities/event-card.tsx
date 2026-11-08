import { CalendarPlus, Clock, MapPin, Mic, Repeat } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale, MosqueEvent } from "@/lib/types";
import { formatCurrency, formatDate, formatTime, formatWeekday, pick, tokyoParts } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

/** Status pendaftaran agenda, dihitung dari data registrasi dan waktu. */
export function registrationState(event: MosqueEvent, now: number = Date.now()): { open: boolean; full: boolean; deadlinePassed: boolean; remaining?: number; past: boolean } {
  const past = new Date(event.endsAt).getTime() < now;
  const reg = event.registration;
  const remaining = reg.quota !== undefined ? Math.max(0, reg.quota - (reg.registered ?? 0)) : undefined;
  const full = remaining === 0;
  const deadlinePassed = reg.deadline ? new Date(reg.deadline).getTime() < now : false;
  return { open: reg.required && !past && !deadlinePassed, full, deadlinePassed, remaining, past };
}

/**
 * Kartu agenda: tanggal besar (hari, tanggal, bulan), jam JST, lokasi, bahasa, kuota.
 * Sinkron tanpa API server sehingga bisa dirender di Server Component maupun
 * dari daftar terfilter di klien (EventBrowser).
 */
export function EventCard({ event, locale, compact = false, past }: { event: MosqueEvent; locale: Locale; compact?: boolean; past?: boolean }) {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const state = registrationState(event);
  const isPast = past ?? state.past;
  const start = new Date(event.startsAt);
  const day = tokyoParts(start).day;

  return (
    <Link href={`/events/${event.slug}`} className={cn("card-surface lift group flex gap-4 p-4 sm:gap-5 sm:p-5", isPast && "opacity-80")}>
      <div className={cn("flex w-16 shrink-0 flex-col items-center justify-center rounded-xl py-2 text-center", isPast ? "bg-surface text-muted-foreground" : "bg-accent text-accent-foreground")}>
        <span className="text-[0.65rem] font-semibold tracking-wide uppercase">{formatWeekday(start, locale, "short")}</span>
        <span className="text-2xl leading-none font-bold tabular">{day}</span>
        <span className="mt-1 text-[0.7rem] font-semibold">{formatDate(start, locale, { month: "short" })}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="soft">{tc(`categories.${event.category}`)}</Badge>
          {isPast ? (
            <Badge variant="outline">{t("card.finished")}</Badge>
          ) : event.registration.required ? (
            state.full ? (
              <Badge variant="warning">{t("card.waitlist")}</Badge>
            ) : state.open ? (
              <Badge variant="success">{t("card.registrationOpen")}</Badge>
            ) : null
          ) : (
            <Badge variant="outline">{t("card.noRegistration")}</Badge>
          )}
        </div>
        <h3 className="mt-2 text-base leading-snug font-bold group-hover:text-brand sm:text-lg">{pick(event.title, locale)}</h3>
        {!compact && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{pick(event.excerpt, locale)}</p>}

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            <dt className="sr-only">{tc("labels.time")}</dt>
            <dd className="tabular">
              {formatTime(event.startsAt, locale)}–{formatTime(event.endsAt, locale)} {tc("labels.jst")}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            <dt className="sr-only">{tc("labels.location")}</dt>
            <dd>{pick(event.location, locale)}</dd>
          </div>
          {!compact && event.speaker && (
            <div className="flex items-center gap-1.5">
              <Mic className="size-3.5" aria-hidden />
              <dt className="sr-only">{tc("labels.speaker")}</dt>
              <dd>{event.speaker}</dd>
            </div>
          )}
          {!compact && event.recurring && (
            <div className="flex items-center gap-1.5">
              <Repeat className="size-3.5" aria-hidden />
              <dt className="sr-only">{t("detail.recurring")}</dt>
              <dd>{pick(event.recurring, locale)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {event.languages.map((lang) => (
            <Badge key={lang} variant="outline" className="px-2 py-0 text-[0.65rem]">
              {lang.toUpperCase()}
            </Badge>
          ))}
          {!isPast && event.registration.required && state.remaining !== undefined && (
            <span className={cn("ml-auto inline-flex items-center gap-1 text-xs font-semibold", state.full ? "text-warning" : "text-brand")}>
              <CalendarPlus className="size-3.5" aria-hidden />
              {state.full ? tc("labels.quotaFull") : tc("labels.remaining", { count: state.remaining })}
            </span>
          )}
          {!isPast && event.registration.fee && (
            <span className="ml-auto text-xs font-semibold text-muted-foreground">{t("card.fee", { amount: formatCurrency(event.registration.fee.amount, event.registration.fee.currency, locale) })}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
