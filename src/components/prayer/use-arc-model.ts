"use client";

import { useLocale, useTranslations } from "next-intl";
import { getNextPrayer, getPrayerTimesToday, type DailyPrayerTimes, type NextPrayerInfo } from "@/lib/prayer";
import type { GeoPoint, Locale, PrayerConfig, PrayerName } from "@/lib/types";
import { formatTime } from "@/lib/utils/i18n";
import {
  ARC,
  ARC_ORDER,
  computeViewBox,
  estimateTextWidth,
  fractionOf,
  layoutLabels,
  type ArcLabel,
  type ViewBox,
} from "./arc-geometry";

export type ArcItem = ArcLabel & { title: string; timeText: string };

export type ArcModel = {
  today: DailyPrayerTimes;
  items: ArcItem[];
  vb: ViewBox;
  /** Posisi sekarang di busur; null sebelum jam klien tersedia (render server/hidrasi). */
  nowF: number | null;
  /** Antara syuruk dan Magrib (matahari), selain itu bulan. */
  daytime: boolean;
  next: NextPrayerInfo | null;
  /** Salat berikutnya hari ini (null setelah Isya karena berikutnya Subuh besok). */
  nextToday: PrayerName | null;
};

/** Data bersama busur statis & interaktif: waktu hari ini, label tanpa tabrakan, viewBox, posisi sekarang. */
export function useArcModel(config: PrayerConfig, coordinates: GeoPoint, now: Date | null): ArcModel {
  const t = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const today = getPrayerTimesToday(config, coordinates, now ?? new Date());

  const fractions = {} as Record<PrayerName, number>;
  const widths = {} as Record<PrayerName, number>;
  const titles = {} as Record<PrayerName, string>;
  const timeTexts = {} as Record<PrayerName, string>;
  for (const name of ARC_ORDER) {
    titles[name] = t(`names.${name}`);
    timeTexts[name] = formatTime(today.times[name], locale);
    fractions[name] = fractionOf(today.times[name].getTime(), today.times);
    widths[name] = Math.max(estimateTextWidth(titles[name], ARC.NAME_SIZE, true), estimateTextWidth(timeTexts[name], ARC.TIME_SIZE));
  }
  const labels = layoutLabels(fractions, widths);
  const items = labels.map((l) => ({ ...l, title: titles[l.name], timeText: timeTexts[l.name] }));
  const vb = computeViewBox(labels);

  const nowMs = now ? now.getTime() : null;
  const nowF = nowMs === null ? null : fractionOf(nowMs, today.times);
  const daytime = nowMs === null ? true : nowMs >= today.times.sunrise.getTime() && nowMs < today.times.maghrib.getTime();
  const next = now ? getNextPrayer(config, coordinates, now) : null;
  const nextToday = next && !next.isTomorrow ? next.name : null;

  return { today, items, vb, nowF, daytime, next, nextToday };
}
