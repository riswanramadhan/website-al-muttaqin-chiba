"use client";

import { useLocale, useTranslations } from "next-intl";
import { PRAYER_NAMES, getNextPrayer, getPrayerTimesToday, serializeDay, type SerializedDay } from "@/lib/prayer";
import type { GeoPoint, Locale, PrayerConfig } from "@/lib/types";
import { formatTime, tokyoDateKey } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { useNow } from "./use-now";

export type PrayerDayListProps = {
  /** Jadwal hari ini dari server; dihitung ulang di klien bila tanggal Tokyo sudah berganti. */
  day: SerializedDay;
  config: PrayerConfig;
  coordinates: GeoPoint;
  tone?: "default" | "inverse";
  compact?: boolean;
};

/** Daftar enam waktu hari ini dengan iqamah; baris yang sedang berlangsung disorot (diperbarui tiap menit). */
export function PrayerDayList({ day, config, coordinates, tone = "default", compact = false }: PrayerDayListProps) {
  const t = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const now = useNow(60_000);
  const inverse = tone === "inverse";
  const live = now && tokyoDateKey(now) !== day.dateKey ? serializeDay(getPrayerTimesToday(config, coordinates, now)) : day;
  const next = now ? getNextPrayer(config, coordinates, now) : null;
  const current = next?.current ?? null;
  const upcoming = next && !next.isTomorrow ? next.name : null;

  return (
    <ul className={cn("divide-y", inverse ? "divide-hero-foreground/10" : "divide-border")} aria-label={t("today.listLabel")}>
      {PRAYER_NAMES.map((name) => {
        const isCurrent = current === name;
        const isNext = upcoming === name;
        const iqamah = name === "sunrise" ? null : live.iqamah[name];
        return (
          <li
            key={name}
            aria-current={isCurrent ? "time" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2",
              compact ? "py-2" : "py-2.5",
              isCurrent && (inverse ? "bg-hero-foreground/10" : "bg-accent"),
            )}
          >
            <span
              className={cn("size-1.5 shrink-0 rounded-full", isCurrent ? (inverse ? "bg-hero-foreground" : "bg-brand") : "bg-current opacity-20")}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 items-baseline gap-2">
              <span className={cn("font-semibold", compact ? "text-sm" : "text-base")}>{t(`names.${name}`)}</span>
              <span
                lang="ar"
                dir="rtl"
                className={cn("font-arabic hidden text-sm leading-none sm:inline", inverse ? "text-hero-muted" : "text-muted-foreground")}
              >
                {t(`arabic.${name}`)}
              </span>
              {isCurrent && (
                <Badge variant={inverse ? "inverse" : "brand"} className="ml-auto hidden sm:inline-flex">
                  {t("today.ongoing")}
                </Badge>
              )}
              {!isCurrent && isNext && (
                <Badge variant={inverse ? "inverse" : "soft"} className="ml-auto hidden sm:inline-flex">
                  {t("today.next")}
                </Badge>
              )}
              {isCurrent && <span className="sr-only">{t("today.ongoing")}</span>}
            </div>
            <div className="flex shrink-0 items-baseline gap-3 text-right">
              <span className={cn("tabular font-bold", compact ? "text-sm" : "text-base")}>{formatTime(live.times[name], locale)}</span>
              <span
                className={cn("tabular w-12 text-xs", inverse ? "text-hero-muted" : "text-muted-foreground")}
                title={iqamah ? t("today.iqamah") : undefined}
              >
                {iqamah ? formatTime(iqamah, locale) : "—"}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
