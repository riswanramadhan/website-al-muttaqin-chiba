import { getTranslations } from "next-intl/server";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { getPrayerTimesToday, serializeDay } from "@/lib/prayer";
import type { Locale } from "@/lib/types";
import { formatDate, formatWeekday } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { HijriDateBadge } from "./hijri-date-badge";
import { NextPrayerCountdown } from "./next-prayer-countdown";
import { PrayerArc } from "./prayer-arc";
import { PrayerDayList } from "./prayer-day-list";

export type PrayerTodayCardProps = {
  locale: Locale;
  variant?: "site" | "hero" | "app";
};

/**
 * Kartu lengkap hari ini: tanggal Masehi + Hijriah, hitung mundur salat berikutnya (klien),
 * enam waktu dengan iqamah dan penanda yang sedang berlangsung, serta busur hari.
 */
export async function PrayerTodayCard({ locale, variant = "site" }: PrayerTodayCardProps) {
  const [config, profile, t] = await Promise.all([getPrayerConfig(), getProfile(), getTranslations({ locale, namespace: "prayer" })]);
  const now = new Date();
  const today = serializeDay(getPrayerTimesToday(config, profile.coordinates, now));
  const inverse = variant === "hero";
  const compact = variant === "app";
  const tone = inverse ? "inverse" : "default";

  return (
    <section
      className={cn(
        "rounded-3xl",
        inverse ? "border border-hero-foreground/15 bg-hero-foreground/5 text-hero-foreground backdrop-blur-sm" : "card-surface",
        compact ? "p-4" : "p-5 sm:p-6",
      )}
      aria-label={t("today.title")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={cn("text-xs font-semibold tracking-wide uppercase", inverse ? "text-hero-muted" : "text-muted-foreground")}>{t("today.title")}</p>
          <p className={cn("font-bold", compact ? "text-base" : "text-lg")}>
            {formatWeekday(now, locale)}, {formatDate(now, locale, compact ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <HijriDateBadge locale={locale} tone={tone} withArabic={!compact} />
      </div>

      <div className={cn(compact ? "mt-3" : "mt-5")}>
        <NextPrayerCountdown config={config} coordinates={profile.coordinates} variant={variant} />
      </div>

      <div className={cn("grid grid-cols-1 gap-4", compact ? "mt-3" : "mt-5", !compact && "lg:grid-cols-[1fr_minmax(14rem,0.9fr)] lg:items-center")}>
        <div>
          <div className={cn("flex justify-end gap-3 px-2 text-xs", inverse ? "text-hero-muted" : "text-muted-foreground")}>
            <span>{t("today.adhan")}</span>
            <span className="w-12 text-right">{t("today.iqamah")}</span>
          </div>
          <PrayerDayList day={today} config={config} coordinates={profile.coordinates} tone={tone} compact={compact} />
        </div>
        <PrayerArc config={config} coordinates={profile.coordinates} tone={tone} className={cn(compact ? "mx-auto max-w-xs" : "max-w-md lg:max-w-none", "self-center")} />
      </div>
    </section>
  );
}
