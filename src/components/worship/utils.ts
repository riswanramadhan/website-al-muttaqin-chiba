import type { GeoPoint, Locale, QuranSurahMeta } from "@/lib/types";
import { fromHijri, toHijri, type HijriDate } from "@/lib/hijri";
import { tokyoDateKey, tokyoParts, toIntlLocale } from "@/lib/utils/i18n";

/** Koordinat Ka'bah, Makkah. */
export const KAABA: GeoPoint = { lat: 21.4225, lng: 39.8262 };

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Jarak lingkaran besar (haversine) dalam kilometer. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Normalisasi sudut ke rentang [0, 360). */
export function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Selisih sudut terpendek dari `from` ke `to` dalam rentang (-180, 180]. */
export function shortestDelta(from: number, to: number): number {
  let d = normalizeDegrees(to) - normalizeDegrees(from);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/** Selisih mutlak antara dua arah (0..180). */
export function angularDistance(a: number, b: number): number {
  return Math.abs(shortestDelta(a, b));
}

export function googleMapsQiblaUrl(origin: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${KAABA.lat},${KAABA.lng}`;
}

/** Arah mata angin 16 titik dari derajat. */
export function compassPoint(deg: number): string {
  const points = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return points[Math.round(normalizeDegrees(deg) / 22.5) % 16];
}

/** Tengah malam Tokyo untuk instant tertentu (sebagai instant UTC). */
export function tokyoMidnight(date: Date): Date {
  const p = tokyoParts(date);
  return new Date(Date.UTC(p.year, p.month - 1, p.day) - 9 * 3_600_000);
}

/**
 * Jumlah hari dari `now` (tanggal Tokyo) menuju tanggal Hijriah berikutnya
 * dengan bulan/hari tertentu. Hari ini = 0; bila sudah lewat, dipakai tahun depan.
 */
export function daysUntilHijri(month: number, day: number, now: Date, adjustment = 0): { days: number; date: Date; hijri: HijriDate } {
  const todayMidnight = tokyoMidnight(now);
  const current = toHijri(new Date(todayMidnight.getTime() + 12 * 3_600_000), adjustment);
  let year = current.year;
  let target = fromHijri({ year, month, day }, adjustment);
  if (target.getTime() < todayMidnight.getTime()) {
    year += 1;
    target = fromHijri({ year, month, day }, adjustment);
  }
  const days = Math.round((target.getTime() - todayMidnight.getTime()) / 86_400_000);
  return { days, date: target, hijri: { year, month, day } };
}

/** Kunci tanggal Tokyo untuk N hari terakhir (termasuk hari ini), urut lama ke baru. */
export function lastDateKeys(count: number, now: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => tokyoDateKey(new Date(now.getTime() - (count - 1 - i) * 86_400_000)));
}

/** Nama hari pendek, dimulai dari Minggu, sesuai bahasa. */
export function weekdayShortNames(locale: Locale): string[] {
  const fmt = new Intl.DateTimeFormat(toIntlLocale(locale), { weekday: "short", timeZone: "UTC" });
  // 2023-01-01 adalah hari Minggu.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2023, 0, 1 + i))));
}

/** Basmalah yang ditampilkan sekali di atas surah (selain Al-Fatihah & At-Taubah). */
export const BASMALAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

/** Kerangka huruf basmalah (tanpa harakat & spasi) untuk pencocokan yang tahan variasi penulisan. */
const BASMALAH_SKELETON = "بسماللهالرحمنالرحيم";

/** Harakat, tanda waqaf/tilawah Uthmani, alif khanjariyah, dan tatweel. */
function isArabicMark(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return (
    (c >= 0x0610 && c <= 0x061a) ||
    (c >= 0x064b && c <= 0x065f) ||
    c === 0x0670 ||
    c === 0x0640 ||
    (c >= 0x06d6 && c <= 0x06dc) ||
    (c >= 0x06df && c <= 0x06e8) ||
    (c >= 0x06ea && c <= 0x06ed)
  );
}

/** Samakan bentuk huruf: alif wasla/hamzah → alif, ya Persia → ya Arab. */
function baseLetter(ch: string): string {
  if (ch === "ٱ" || ch === "أ" || ch === "إ" || ch === "آ") return "ا";
  if (ch === "ی" || ch === "ى") return "ي";
  return ch;
}

/**
 * Hapus basmalah pembuka dari teks ayat pertama (selain Al-Fatihah & At-Taubah). Teks API
 * memakai urutan harakat yang berbeda-beda (mis. syadah sebelum/ sesudah fathah), jadi yang
 * dicocokkan hanya kerangka hurufnya; harakat penutup basmalah ikut terbuang.
 */
export function stripBasmalah(text: string): string {
  const trimmed = text.trim();
  const chars = Array.from(trimmed);
  let k = 0;
  let i = 0;
  for (; i < chars.length && k < BASMALAH_SKELETON.length; i++) {
    const ch = chars[i];
    if (ch === " " || ch === " " || isArabicMark(ch)) continue;
    if (baseLetter(ch) !== BASMALAH_SKELETON[k]) return trimmed;
    k++;
  }
  if (k < BASMALAH_SKELETON.length) return trimmed;
  while (i < chars.length && isArabicMark(chars[i])) i++;
  return chars.slice(i).join("").trim();
}

/** Normalisasi teks pencarian: huruf kecil, tanpa diakritik Latin & harakat Arab. */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/['’`-]/g, "");
}

/** Nama surah dalam bahasa antarmuka (aman dipakai di server maupun client). */
export function surahLocalName(s: QuranSurahMeta, locale: Locale): string {
  if (locale === "ja") return s.japaneseName;
  if (locale === "id") return s.indonesianName;
  return s.englishName;
}
