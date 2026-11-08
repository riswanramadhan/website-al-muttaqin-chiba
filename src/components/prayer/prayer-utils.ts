import type { PrayerConfig } from "@/lib/types";
import { tokyoParts } from "@/lib/utils/i18n";

export const IMSAK_OFFSET_MINUTES = 10;
export const DUHA_OFFSET_MINUTES = 15;
export const OFFLINE_STORAGE_KEY = "acc-prayer-30d";
export const OFFLINE_DAYS = 30;

/** Imsak = Subuh dikurangi 10 menit. */
export function imsakFrom(fajr: Date): Date {
  return new Date(fajr.getTime() - IMSAK_OFFSET_MINUTES * 60_000);
}

/** Duha dimulai sekitar 15 menit setelah syuruk. */
export function duhaFrom(sunrise: Date): Date {
  return new Date(sunrise.getTime() + DUHA_OFFSET_MINUTES * 60_000);
}

const MONTH_PARAM = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** Bulan dari query `?month=YYYY-MM`; bila tidak valid memakai bulan Tokyo saat ini. */
export function resolveMonth(raw: string | string[] | undefined, now: Date = new Date()): { year: number; month: number } {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = value ? MONTH_PARAM.exec(value) : null;
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (year >= 2000 && year <= 2100) return { year, month };
  }
  const p = tokyoParts(now);
  return { year: p.year, month: p.month };
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Apakah ada hari dalam bulan ini yang masuk rentang Ramadan konfigurasi. */
export function monthTouchesRamadan(config: PrayerConfig, year: number, month: number): boolean {
  if (!config.ramadan) return false;
  const first = `${monthKey(year, month)}-01`;
  const last = `${monthKey(year, month)}-31`;
  return config.ramadan.start <= last && config.ramadan.end >= first;
}

/** Batasi jumlah hari untuk API dan ICS. */
export function clampDays(raw: string | null, fallback = OFFLINE_DAYS, max = 60): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(1, n));
}
