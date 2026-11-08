import type { ContentBlock, Locale, LocalizedBlocks, LocalizedText } from "@/lib/types";

export const TOKYO_TZ = "Asia/Tokyo";
/** Jepang tidak memakai DST: offset tetap +9 jam. */
export const TOKYO_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Ambil teks sesuai bahasa, fallback ke EN lalu ke bahasa apa pun yang terisi. */
export function pick(text: LocalizedText | undefined | null, locale: Locale): string {
  if (!text) return "";
  const own = text[locale];
  if (own && own.trim() !== "") return own;
  if (text.en && text.en.trim() !== "") return text.en;
  return text.id || text.ja || "";
}

export function pickBlocks(blocks: LocalizedBlocks | undefined, locale: Locale): ContentBlock[] {
  if (!blocks) return [];
  const own = blocks[locale];
  if (own && own.length > 0) return own;
  if (blocks.en && blocks.en.length > 0) return blocks.en;
  return blocks.id?.length ? blocks.id : (blocks.ja ?? []);
}

export function toIntlLocale(locale: Locale): string {
  return locale === "ja" ? "ja-JP" : locale === "id" ? "id-ID" : "en-GB";
}

type DateInput = Date | string | number;

function toDate(input: DateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

export function formatDate(
  input: DateInput,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { timeZone: TOKYO_TZ, ...options }).format(
    toDate(input),
  );
}

export function formatWeekday(input: DateInput, locale: Locale, width: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { timeZone: TOKYO_TZ, weekday: width }).format(
    toDate(input),
  );
}

/** Jam "HH:mm" dalam Asia/Tokyo, selalu 24 jam. */
export function formatTime(input: DateInput, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    timeZone: TOKYO_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(toDate(input));
}

export function formatDateTime(input: DateInput, locale: Locale): string {
  return `${formatDate(input, locale, { month: "short", day: "numeric", year: "numeric" })} ${formatTime(input, locale)}`;
}

export function formatCurrency(amount: number, currency: "JPY" | "IDR", locale: Locale): string {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(toIntlLocale(locale)).format(value);
}

export type TokyoParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = Minggu ... 6 = Sabtu */
  weekday: number;
};

/** Komponen tanggal/jam sebuah instant dalam zona Asia/Tokyo (tanpa Intl, karena offset tetap). */
export function tokyoParts(input: DateInput = new Date()): TokyoParts {
  const shifted = new Date(toDate(input).getTime() + TOKYO_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    weekday: shifted.getUTCDay(),
  };
}

/** Instant untuk tanggal & jam sipil Tokyo. */
export function tokyoDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - TOKYO_OFFSET_MS);
}

/** "YYYY-MM-DD" menurut kalender Tokyo. */
export function tokyoDateKey(input: DateInput = new Date()): string {
  const p = tokyoParts(input);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Parse "YYYY-MM-DD" (dan opsional "HH:mm") sebagai waktu Tokyo. */
export function parseTokyoDate(dateKey: string, time = "00:00"): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return tokyoDate(y, m, d, hh, mm);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addDays(input: DateInput, days: number): Date {
  return new Date(toDate(input).getTime() + days * 86_400_000);
}

export function isSameTokyoDay(a: DateInput, b: DateInput): boolean {
  return tokyoDateKey(a) === tokyoDateKey(b);
}

/** Bahasa Arab untuk label tiga aksara (PRD §1: label tiga aksara). */
export function triScript(ja: string, latin: string, arabic: string): string {
  return `${ja} · ${latin} · ${arabic}`;
}
