/**
 * Nominal unik (PRD-05 §4).
 *
 * Nominal dasar dibulatkan ke ribuan terdekat, lalu ditambah kode unik 1..999 sehingga
 * TIGA DIGIT TERAKHIR nominal transfer adalah kode uniknya:
 *   JPY: 5000   + 123 -> 5123   (¥5.000  -> ¥5.123)
 *   IDR: 100000 + 371 -> 100371 (Rp100.000 -> Rp100.371, bukan 100000371)
 * Dengan begitu bendahara bisa membaca kode dari mutasi rekening dengan `amount % 1000`
 * dan nominal dasar dengan `amount - amount % 1000` (lihat splitUniqueAmount).
 * Semua fungsi murni dan tanpa efek samping agar mudah diuji.
 */
export type DonationCurrency = "JPY" | "IDR";

export const QUICK_AMOUNTS: Record<DonationCurrency, readonly number[]> = {
  JPY: [1000, 3000, 5000, 10000],
  IDR: [50000, 100000, 250000, 500000],
};

/** Nominal dasar minimum per mata uang (kelipatan 1.000). */
export const MIN_BASE_AMOUNT: Record<DonationCurrency, number> = { JPY: 1000, IDR: 10000 };

export const UNIQUE_CODE_MIN = 1;
export const UNIQUE_CODE_MAX = 999;

/** Kode unik acak 1..999. `random` bisa disuntik untuk pengujian. */
export function randomUniqueCode(random: () => number = Math.random): number {
  const span = UNIQUE_CODE_MAX - UNIQUE_CODE_MIN + 1;
  return UNIQUE_CODE_MIN + Math.floor(Math.min(Math.max(random(), 0), 0.999999) * span);
}

/** Bulatkan nominal dasar ke ribuan terdekat dan terapkan batas minimum. */
export function normalizeBaseAmount(amount: number, currency: DonationCurrency): number {
  if (!Number.isFinite(amount)) return MIN_BASE_AMOUNT[currency];
  const rounded = Math.round(amount / 1000) * 1000;
  return Math.max(MIN_BASE_AMOUNT[currency], rounded);
}

/**
 * Nominal unik = nominal dasar (dibulatkan ke ribuan) + kode 1..999.
 * Kode di luar rentang akan dijepit agar nominal tetap valid.
 */
export function makeUniqueAmount(base: number, currency: DonationCurrency, code: number = randomUniqueCode()): number {
  const safeCode = Math.min(UNIQUE_CODE_MAX, Math.max(UNIQUE_CODE_MIN, Math.floor(code)));
  return normalizeBaseAmount(base, currency) + safeCode;
}

/** Pecah nominal transfer menjadi nominal dasar dan kode unik (0 bila tidak ada kode). */
export function splitUniqueAmount(amount: number): { base: number; code: number } {
  const whole = Math.max(0, Math.floor(amount));
  const code = whole % 1000;
  return { base: whole - code, code };
}

/** Kode unik selalu ditampilkan tiga digit, mis. 7 -> "007". */
export function formatUniqueCode(code: number): string {
  return String(Math.max(0, Math.floor(code))).padStart(3, "0");
}
