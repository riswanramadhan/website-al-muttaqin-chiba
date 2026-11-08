"use client";

import { useLocale, useTranslations } from "next-intl";
import { OBLIGATORY_PRAYERS, PRAYER_NAMES, type SerializedDay } from "@/lib/prayer";
import type { Locale } from "@/lib/types";
import { formatDate, formatTime, formatWeekday, parseTokyoDate } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PrayerDayPickerProps = {
  /** Jadwal berurutan mulai hari ini (minimal 7 hari). */
  days: SerializedDay[];
  className?: string;
};

function DayDetail({ day, locale, iqamahLabel, adhanLabel, names }: { day: SerializedDay; locale: Locale; iqamahLabel: string; adhanLabel: string; names: (n: (typeof PRAYER_NAMES)[number]) => string }) {
  const date = parseTokyoDate(day.dateKey);
  return (
    <div className="card-surface p-4">
      <p className="text-sm font-semibold">
        {formatWeekday(date, locale)}, {formatDate(date, locale, { day: "numeric", month: "long" })}
      </p>
      <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-4 text-xs text-muted-foreground">
        <span />
        <span className="text-right">{adhanLabel}</span>
        <span className="w-12 text-right">{iqamahLabel}</span>
      </div>
      <ul className="mt-1 divide-y divide-border">
        {PRAYER_NAMES.map((name) => (
          <li key={name} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 py-2 text-sm">
            <span className="font-semibold">{names(name)}</span>
            <span className="tabular text-right font-bold">{formatTime(day.times[name], locale)}</span>
            <span className="tabular w-12 text-right text-muted-foreground">{name === "sunrise" ? "—" : formatTime(day.iqamah[name], locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Pemilih hari (hari ini / besok / 7 hari) untuk layar App; data sudah terserialisasi. */
export function PrayerDayPicker({ days, className }: PrayerDayPickerProps) {
  const t = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const today = days[0];
  const tomorrow = days[1];
  const week = days.slice(0, 7);
  const names = (n: (typeof PRAYER_NAMES)[number]) => t(`names.${n}`);

  if (!today) return null;

  return (
    <Tabs defaultValue="today" className={className}>
      <TabsList className="w-full" aria-label={t("app.title")}>
        <TabsTrigger value="today" className="flex-1">
          {t("app.today")}
        </TabsTrigger>
        <TabsTrigger value="tomorrow" className="flex-1" disabled={!tomorrow}>
          {t("app.tomorrow")}
        </TabsTrigger>
        <TabsTrigger value="week" className="flex-1">
          {t("app.week")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="today" className="mt-3">
        <DayDetail day={today} locale={locale} adhanLabel={t("today.adhan")} iqamahLabel={t("today.iqamah")} names={names} />
      </TabsContent>
      <TabsContent value="tomorrow" className="mt-3">
        {tomorrow && <DayDetail day={tomorrow} locale={locale} adhanLabel={t("today.adhan")} iqamahLabel={t("today.iqamah")} names={names} />}
      </TabsContent>
      <TabsContent value="week" className="mt-3">
        <div className="card-surface overflow-x-auto">
          <table className="tabular w-full min-w-[22rem] text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="px-2 py-2 text-left font-medium">
                  {t("table.date")}
                </th>
                {OBLIGATORY_PRAYERS.map((name) => (
                  <th key={name} scope="col" className="px-1 py-2 text-right font-medium">
                    {names(name)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {week.map((day, i) => {
                const date = parseTokyoDate(day.dateKey);
                return (
                  <tr
                    key={day.dateKey}
                    className={cn("border-t border-border", i === 0 && "bg-accent font-semibold", day.isFriday && "text-brand")}
                    aria-current={i === 0 ? "date" : undefined}
                  >
                    <th scope="row" className="px-2 py-2 text-left font-semibold whitespace-nowrap">
                      {formatWeekday(date, locale, "short")} {formatDate(date, locale, { day: "numeric" })}
                    </th>
                    {OBLIGATORY_PRAYERS.map((name) => (
                      <td key={name} className="px-1 py-2 text-right">
                        {formatTime(day.times[name], locale)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
