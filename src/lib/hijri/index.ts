import type { Locale } from "@/lib/types";
import { TOKYO_TZ, addDays } from "@/lib/utils/i18n";

/**
 * Kalender Hijriah memakai Intl (kalender islamic-umalqura), dengan koreksi ±1 hari
 * dari admin (PRD §6.1). Semua perhitungan memakai tanggal sipil Asia/Tokyo.
 */

export type HijriDate = { year: number; month: number; day: number };

const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
  timeZone: TOKYO_TZ,
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

export const HIJRI_MONTHS: Record<Locale | "ar", string[]> = {
  ar: [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الآخر",
    "جمادى الأولى",
    "جمادى الآخرة",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ],
  en: [
    "Muharram",
    "Safar",
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    "Jumada al-Ula",
    "Jumada al-Akhirah",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qa'dah",
    "Dhu al-Hijjah",
  ],
  id: [
    "Muharram",
    "Safar",
    "Rabiul Awal",
    "Rabiul Akhir",
    "Jumadil Awal",
    "Jumadil Akhir",
    "Rajab",
    "Syaban",
    "Ramadan",
    "Syawal",
    "Zulkaidah",
    "Zulhijah",
  ],
  ja: [
    "ムハッラム",
    "サファル",
    "ラビーウ・アル＝アウワル",
    "ラビーウ・アッ＝サーニー",
    "ジュマーダー・アル＝ウーラー",
    "ジュマーダー・アル＝アーヒラ",
    "ラジャブ",
    "シャアバーン",
    "ラマダーン",
    "シャウワール",
    "ズー・アル＝カアダ",
    "ズー・アル＝ヒッジャ",
  ],
};

/** Konversi instant ke tanggal Hijriah (tanggal sipil Tokyo) dengan koreksi hari. */
export function toHijri(date: Date, adjustment = 0): HijriDate {
  const parts = formatter.formatToParts(addDays(date, adjustment));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function hijriMonthName(month: number, locale: Locale | "ar"): string {
  return HIJRI_MONTHS[locale][month - 1] ?? "";
}

export function formatHijri(date: Date, locale: Locale, adjustment = 0, withArabic = false): string {
  const h = toHijri(date, adjustment);
  const base =
    locale === "ja"
      ? `ヒジュラ暦${h.year}年 ${hijriMonthName(h.month, "ja")} ${h.day}日`
      : `${h.day} ${hijriMonthName(h.month, locale)} ${h.year} H`;
  return withArabic ? `${base} · ${h.day} ${hijriMonthName(h.month, "ar")} ${h.year}` : base;
}

const HIJRI_EPOCH_MS = Date.UTC(622, 6, 16); // 1 Muharram 1 H (proleptik)
const MEAN_YEAR_DAYS = 354.36707;
const MEAN_MONTH_DAYS = 29.530589;

/**
 * Tanggal Gregorian (instant tengah malam Tokyo) untuk tanggal Hijriah tertentu.
 * Perkiraan astronomis lalu dikoreksi dengan Intl sampai cocok (toleransi ±5 hari).
 */
export function fromHijri(h: HijriDate, adjustment = 0): Date {
  const approxDays = (h.year - 1) * MEAN_YEAR_DAYS + (h.month - 1) * MEAN_MONTH_DAYS + (h.day - 1);
  let guess = new Date(HIJRI_EPOCH_MS + approxDays * 86_400_000);
  for (let i = 0; i < 10; i++) {
    const got = toHijri(guess, adjustment);
    const diff = hijriDiffDays(got, h);
    if (diff === 0) break;
    guess = addDays(guess, -diff);
  }
  // Normalisasi ke tengah malam Tokyo.
  const shifted = new Date(guess.getTime() + 9 * 3_600_000);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - 9 * 3_600_000,
  );
}

function hijriDiffDays(a: HijriDate, b: HijriDate): number {
  const da = (a.year - 1) * MEAN_YEAR_DAYS + (a.month - 1) * MEAN_MONTH_DAYS + a.day;
  const db = (b.year - 1) * MEAN_YEAR_DAYS + (b.month - 1) * MEAN_MONTH_DAYS + b.day;
  return Math.round(da - db);
}

/** Panjang bulan Hijriah (29 atau 30) menurut kalender Umm al-Qura. */
export function hijriMonthLength(year: number, month: number, adjustment = 0): number {
  const first = fromHijri({ year, month, day: 1 }, adjustment);
  const nextMonth = month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
  const next = fromHijri(nextMonth, adjustment);
  return Math.round((next.getTime() - first.getTime()) / 86_400_000);
}

/** Bulan Hijriah sebagai daftar hari dengan padanan Gregorian. */
export function hijriMonthGrid(year: number, month: number, adjustment = 0): { hijriDay: number; date: Date }[] {
  const first = fromHijri({ year, month, day: 1 }, adjustment);
  const length = hijriMonthLength(year, month, adjustment);
  return Array.from({ length }, (_, i) => ({ hijriDay: i + 1, date: addDays(first, i) }));
}

/** Apakah hari ini termasuk Ayyamul Bidh (13, 14, 15). */
export function isAyyamulBidh(h: HijriDate): boolean {
  return h.day >= 13 && h.day <= 15;
}
