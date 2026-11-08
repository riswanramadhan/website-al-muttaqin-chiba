import { getTranslations } from "next-intl/server";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { OBLIGATORY_PRAYERS, PRAYER_NAMES, getMonthSchedule, isRamadan } from "@/lib/prayer";
import type { Locale } from "@/lib/types";
import { formatDate, formatTime, formatWeekday, tokyoDateKey } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { imsakFrom } from "./prayer-utils";

export type PrayerTimesTableProps = {
  locale: Locale;
  year: number;
  month: number;
  highlightToday?: boolean;
  className?: string;
};

/**
 * Tabel jadwal satu bulan (Server Component): baris hari ini disorot, Jumat ditandai,
 * kolom Imsak muncul bila ada hari Ramadan dalam bulan tersebut.
 */
export async function PrayerTimesTable({ locale, year, month, highlightToday = true, className }: PrayerTimesTableProps) {
  const [config, profile, t] = await Promise.all([getPrayerConfig(), getProfile(), getTranslations({ locale, namespace: "prayer" })]);
  const schedule = getMonthSchedule(year, month, config, profile.coordinates);
  const todayKey = tokyoDateKey();
  const showImsak = schedule.some((day) => isRamadan(config, day.date));
  const monthLabel = formatDate(schedule[0].date, locale, { month: "long", year: "numeric" });
  const names = (name: (typeof PRAYER_NAMES)[number]) => t(`names.${name}`);
  const rules = OBLIGATORY_PRAYERS.map((name) => {
    const rule = config.iqamah[name];
    return rule.type === "offset" ? t("table.offsetRule", { prayer: names(name), count: rule.minutes }) : t("table.fixedRule", { prayer: names(name), time: rule.time });
  }).join(", ");

  return (
    <div className={cn("card-surface overflow-hidden print:border-0 print:shadow-none", className)}>
      <div className="overflow-x-auto">
        <table className="tabular w-full min-w-[40rem] text-sm">
          <caption className="sr-only">{t("table.caption", { month: monthLabel })}</caption>
          <thead className="bg-surface text-xs text-muted-foreground print:bg-transparent">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-surface px-3 py-3 text-left font-medium print:static">
                {t("table.date")}
              </th>
              {showImsak && (
                <th scope="col" className="px-2 py-3 text-right font-medium">
                  {t("table.imsak")}
                </th>
              )}
              {PRAYER_NAMES.map((name) => (
                <th key={name} scope="col" className="px-2 py-3 text-right font-medium">
                  {names(name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((day) => {
              const isToday = highlightToday && day.dateKey === todayKey;
              return (
                <tr
                  key={day.dateKey}
                  aria-current={isToday ? "date" : undefined}
                  className={cn("border-t border-border", isToday && "bg-accent font-semibold", day.isFriday && !isToday && "bg-surface/60", day.isFriday && "text-brand")}
                >
                  <th
                    scope="row"
                    className={cn("sticky left-0 z-10 px-3 py-2 text-left font-semibold whitespace-nowrap print:static", isToday ? "bg-accent" : day.isFriday ? "bg-surface" : "bg-card")}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="w-6 text-right">{formatDate(day.date, locale, { day: "numeric" })}</span>
                      <span className={cn("text-xs font-medium", day.isFriday ? "text-brand" : "text-muted-foreground")}>{formatWeekday(day.date, locale, "short")}</span>
                      {isToday && (
                        <Badge variant="brand" className="print:hidden">
                          {t("table.today")}
                        </Badge>
                      )}
                      {day.isFriday && !isToday && (
                        <Badge variant="soft" className="print:hidden">
                          {t("table.friday")}
                        </Badge>
                      )}
                    </span>
                  </th>
                  {showImsak && <td className="px-2 py-2 text-right text-muted-foreground">{isRamadan(config, day.date) ? formatTime(imsakFrom(day.times.fajr), locale) : "—"}</td>}
                  {PRAYER_NAMES.map((name) => (
                    <td key={name} className={cn("px-2 py-2 text-right", name === "sunrise" && "text-muted-foreground")}>
                      {formatTime(day.times[name], locale)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-1 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <p>{t("table.iqamahNote", { rules })}</p>
        {showImsak && <p>{t("table.imsakNote")}</p>}
      </div>
    </div>
  );
}
