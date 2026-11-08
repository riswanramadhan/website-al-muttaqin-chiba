import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { OBLIGATORY_PRAYERS, getUpcomingSchedule } from "@/lib/prayer";
import { siteUrl } from "@/lib/site";
import type { Locale, ObligatoryPrayer } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { buildPrayerCalendar } from "@/components/prayer/ics";
import { clampDays } from "@/components/prayer/prayer-utils";

/**
 * GET /api/prayer/calendar.ics?locale=id&days=30 — berkas iCalendar jadwal salat N hari
 * (VTIMEZONE Asia/Tokyo, satu VEVENT per salat wajib, alarm 10 menit sebelum iqamah).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("locale");
  const locale: Locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const days = clampDays(url.searchParams.get("days"));

  const [config, profile, t] = await Promise.all([getPrayerConfig(), getProfile(), getTranslations({ locale, namespace: "prayer" })]);
  const names = {} as Record<ObligatoryPrayer, string>;
  for (const name of OBLIGATORY_PRAYERS) names[name] = t(`names.${name}`);

  const body = buildPrayerCalendar({
    days: getUpcomingSchedule(days, config, profile.coordinates),
    names,
    mosqueName: profile.shortName,
    location: `${pick(profile.name, locale)}, ${pick(profile.address, locale)}`,
    url: `${siteUrl}/${locale}/prayer-times`,
    iqamahLabel: t("today.iqamah"),
    domain: new URL(siteUrl).hostname,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="almuttaqin-prayer-times.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
