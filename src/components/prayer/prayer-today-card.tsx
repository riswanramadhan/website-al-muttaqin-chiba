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
 *
 * Tata letak:
 * - site: kartu lebar penuh. Mobile/tablet bertumpuk (hitung mundur, busur, daftar); mulai lg
 *   dua zona: hitung mundur + daftar di kiri (5/12), busur langit interaktif besar di kanan (7/12).
 * - hero: di atas latar gelap, satu kolom (hitung mundur, busur statis, daftar).
 * - app: selebar HP; busur langit interaktif sekaligus menjadi hitung mundur, lalu daftar.
 */
export async function PrayerTodayCard({ locale, variant = "site" }: PrayerTodayCardProps) {
  const [config, profile, t] = await Promise.all([getPrayerConfig(), getProfile(), getTranslations({ locale, namespace: "prayer" })]);
  const now = new Date();
  const today = serializeDay(getPrayerTimesToday(config, profile.coordinates, now));
  const inverse = variant === "hero";
  const compact = variant === "app";
  const site = variant === "site";
  const tone = inverse ? "inverse" : "default";

  const list = (
    <div>
      <div className={cn("flex justify-end gap-3 px-2 text-xs", inverse ? "text-hero-muted" : "text-muted-foreground")}>
        <span>{t("today.adhan")}</span>
        <span className="w-12 text-right">{t("today.iqamah")}</span>
      </div>
      <PrayerDayList day={today} config={config} coordinates={profile.coordinates} tone={tone} compact={compact} />
    </div>
  );

  return (
    <section
      className={cn(
        "rounded-3xl",
        inverse ? "border border-hero-foreground/15 bg-hero-foreground/5 text-hero-foreground backdrop-blur-sm" : "card-surface",
        compact ? "p-4" : site ? "p-5 sm:p-6 lg:p-8" : "p-5 sm:p-6",
      )}
      aria-label={t("today.title")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={cn("text-xs font-semibold tracking-wide uppercase", inverse ? "text-hero-muted" : "text-muted-foreground")}>{t("today.title")}</p>
          <p className={cn("font-bold", compact ? "text-base" : "text-lg", site && "lg:text-xl")}>
            {formatWeekday(now, locale)}, {formatDate(now, locale, compact ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <HijriDateBadge locale={locale} tone={tone} withArabic={!compact} />
      </div>

      {compact && (
        <>
          <PrayerArc config={config} coordinates={profile.coordinates} interactive idleReadout="next" className="mt-3" />
          <div className="mt-3">{list}</div>
        </>
      )}

      {inverse && (
        <>
          <div className="mt-5">
            <NextPrayerCountdown config={config} coordinates={profile.coordinates} variant="hero" />
          </div>
          {/* Busur langit interaktif yang sama dengan beranda (panel langitnya sendiri tetap terbaca di hero gelap). */}
          <PrayerArc config={config} coordinates={profile.coordinates} interactive idleReadout="clock" className="mx-auto mt-5 w-full max-w-xl" />
          <div className="mt-4">{list}</div>
        </>
      )}

      {site && (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:mt-6 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-6">
          <div className="lg:col-span-5 lg:row-start-1">
            <NextPrayerCountdown config={config} coordinates={profile.coordinates} variant="site" />
          </div>
          <PrayerArc
            config={config}
            coordinates={profile.coordinates}
            interactive
            idleReadout="clock"
            className="mx-auto w-full max-w-2xl lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:max-w-none"
          />
          <div className="lg:col-span-5 lg:row-start-2">{list}</div>
        </div>
      )}
    </section>
  );
}
