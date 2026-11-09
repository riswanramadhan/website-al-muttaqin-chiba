/**
 * Ekspor publik modul prayer (PRD-04). Dipakai beranda & App home; jangan ubah nama/props.
 */
export { PrayerTodayCard } from "./prayer-today-card"; // Server: { locale: Locale; variant?: "site" | "hero" | "app" }
export { NextPrayerCountdown } from "./next-prayer-countdown"; // Client: { config: PrayerConfig; coordinates: GeoPoint; variant?: "site" | "hero" | "app" }
export { PrayerArc } from "./prayer-arc"; // Client SVG: { config: PrayerConfig; coordinates: GeoPoint; className?: string; tone?: "default" | "inverse"; interactive?: boolean; idleReadout?: "next" | "clock" }
export { JumuahCard } from "./jumuah-card"; // Server: { locale: Locale; compact?: boolean; tone?: "default" | "inverse" }
export { PrayerTimesTable } from "./prayer-times-table"; // Server: { locale: Locale; year: number; month: number; highlightToday?: boolean }
export { HijriDateBadge } from "./hijri-date-badge"; // Server: { locale: Locale; withArabic?: boolean; tone?: "default" | "inverse" }

export type { PrayerTodayCardProps } from "./prayer-today-card";
export type { NextPrayerCountdownProps } from "./next-prayer-countdown";
export type { PrayerArcProps } from "./prayer-arc";
export type { JumuahCardProps } from "./jumuah-card";
export type { PrayerTimesTableProps } from "./prayer-times-table";
export type { HijriDateBadgeProps } from "./hijri-date-badge";
