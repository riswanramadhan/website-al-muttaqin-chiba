"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatCountdown, getNextPrayer } from "@/lib/prayer";
import type { GeoPoint, Locale, PrayerConfig } from "@/lib/types";
import { formatTime } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/primitives";
import { useNow } from "./use-now";

export type NextPrayerCountdownProps = {
  config: PrayerConfig;
  coordinates: GeoPoint;
  variant?: "site" | "hero" | "app";
};

/**
 * Hitung mundur ke salat berikutnya, dihitung di klien tiap detik dari getNextPrayer.
 * Setelah Isya otomatis menunjuk Subuh besok. Sebelum mount menampilkan "--:--" agar
 * HTML server dan klien identik.
 */
export function NextPrayerCountdown({ config, coordinates, variant = "site" }: NextPrayerCountdownProps) {
  const t = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const now = useNow(1000);
  const info = now ? getNextPrayer(config, coordinates, now) : null;
  const inverse = variant === "hero";
  const compact = variant === "app";
  const prayerName = info ? t(`names.${info.name}`) : t("today.next");

  return (
    <div
      className={cn(
        "rounded-2xl",
        inverse ? "border border-hero-foreground/15 bg-hero-foreground/5 text-hero-foreground" : "card-muted",
        compact ? "p-4" : "p-5",
      )}
      aria-live="off"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-xs font-semibold tracking-wide uppercase", inverse ? "text-hero-muted" : "text-muted-foreground")}>
            {t("countdown.toward", { prayer: prayerName })}
          </p>
          <p
            className={cn("tabular mt-1 font-bold leading-none", compact ? "text-3xl" : "text-4xl sm:text-5xl")}
            aria-label={t("countdown.label", { prayer: prayerName })}
          >
            {info ? formatCountdown(info.remainingMs) : t("countdown.placeholder")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          {info?.isTomorrow && <Badge variant={inverse ? "inverse" : "soft"}>{t("today.tomorrow")}</Badge>}
          <p className={cn("tabular text-sm font-semibold", !info && "opacity-0")} aria-hidden={!info}>
            {info ? t("countdown.adhanAt", { time: formatTime(info.time, locale) }) : t("countdown.placeholder")}
          </p>
          {info?.iqamah && (
            <p className={cn("tabular text-xs", inverse ? "text-hero-muted" : "text-muted-foreground")}>
              {t("countdown.iqamahAt", { time: formatTime(info.iqamah, locale) })}
            </p>
          )}
        </div>
      </div>
      <Progress
        value={info ? info.progress * 100 : 0}
        tone={inverse ? "inverse" : "brand"}
        label={t("countdown.progressLabel")}
        className={cn("mt-4", compact && "mt-3 h-1.5")}
      />
    </div>
  );
}
