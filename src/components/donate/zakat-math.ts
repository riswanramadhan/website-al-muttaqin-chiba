/**
 * Perhitungan zakat (PRD-05, halaman /donate/zakat). Fungsi murni, tanpa penyimpanan.
 * Semua nilai uang dalam mata uang yang dipilih pengguna; konversi JPY<->IDR memakai kurs manual.
 */
export type ZakatCurrency = "JPY" | "IDR";

export const ZAKAT_RATE = 0.025;
export const NISAB_GOLD_GRAMS = 85;
export const FITRAH_RICE_KG_PER_PERSON = 2.5;

/** Nilai bawaan (PRD-05): 1 JPY = Rp105, emas ¥16.000/g, beras ¥500/kg. */
export const DEFAULT_IDR_PER_JPY = 105;
export const DEFAULT_GOLD_PRICE_JPY_PER_GRAM = 16000;
export const DEFAULT_RICE_PRICE_JPY_PER_KG = 500;

/** Konversi nilai JPY ke mata uang tampilan. */
export function fromJpy(amountJpy: number, currency: ZakatCurrency, idrPerJpy: number): number {
  return currency === "JPY" ? amountJpy : amountJpy * idrPerJpy;
}

/** Konversi nilai mata uang tampilan ke JPY. */
export function toJpy(amount: number, currency: ZakatCurrency, idrPerJpy: number): number {
  if (currency === "JPY") return amount;
  return idrPerJpy > 0 ? amount / idrPerJpy : 0;
}

/** Nilai setara di mata uang lain (untuk baris "sekitar ..."). */
export function convert(amount: number, from: ZakatCurrency, to: ZakatCurrency, idrPerJpy: number): number {
  if (from === to) return amount;
  return from === "JPY" ? amount * idrPerJpy : idrPerJpy > 0 ? amount / idrPerJpy : 0;
}

function clean(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function roundMoney(amount: number): number {
  return Math.round(amount);
}

export type ZakatMaalInput = {
  goldGrams: number;
  goldPricePerGram: number;
  silverValue: number;
  savings: number;
  receivables: number;
  tradeGoods: number;
  debts: number;
};

export type ZakatMaalResult = {
  nisab: number;
  totalAssets: number;
  netAssets: number;
  eligible: boolean;
  zakat: number;
};

/** Zakat maal: (emas + perak + tabungan + piutang + dagang - utang) x 2,5 % bila >= nisab 85 g emas. */
export function calcZakatMaal(input: ZakatMaalInput): ZakatMaalResult {
  const goldPrice = clean(input.goldPricePerGram);
  const nisab = NISAB_GOLD_GRAMS * goldPrice;
  const totalAssets =
    clean(input.goldGrams) * goldPrice +
    clean(input.silverValue) +
    clean(input.savings) +
    clean(input.receivables) +
    clean(input.tradeGoods);
  const netAssets = Math.max(0, totalAssets - clean(input.debts));
  const eligible = nisab > 0 && netAssets >= nisab;
  return { nisab, totalAssets, netAssets, eligible, zakat: eligible ? roundMoney(netAssets * ZAKAT_RATE) : 0 };
}

export type ZakatIncomeInput = {
  amount: number;
  period: "monthly" | "yearly";
  goldPricePerGram: number;
};

export type ZakatIncomeResult = {
  nisabYearly: number;
  annualIncome: number;
  eligible: boolean;
  zakatMonthly: number;
  zakatYearly: number;
};

/** Zakat penghasilan: 2,5 % dari penghasilan bila penghasilan setahun >= nisab 85 g emas. */
export function calcZakatIncome(input: ZakatIncomeInput): ZakatIncomeResult {
  const nisabYearly = NISAB_GOLD_GRAMS * clean(input.goldPricePerGram);
  const amount = clean(input.amount);
  const annualIncome = input.period === "monthly" ? amount * 12 : amount;
  const eligible = nisabYearly > 0 && annualIncome >= nisabYearly;
  const zakatYearly = eligible ? roundMoney(annualIncome * ZAKAT_RATE) : 0;
  return { nisabYearly, annualIncome, eligible, zakatMonthly: eligible ? roundMoney((annualIncome / 12) * ZAKAT_RATE) : 0, zakatYearly };
}

export type ZakatFitrahInput = { persons: number; ricePricePerKg: number };

export type ZakatFitrahResult = { persons: number; riceKg: number; perPerson: number; total: number };

/** Zakat fitrah: jumlah jiwa x 2,5 kg beras x harga beras per kg. */
export function calcZakatFitrah(input: ZakatFitrahInput): ZakatFitrahResult {
  const persons = Math.max(0, Math.floor(clean(input.persons)));
  const price = clean(input.ricePricePerKg);
  const perPerson = roundMoney(FITRAH_RICE_KG_PER_PERSON * price);
  return { persons, riceKg: persons * FITRAH_RICE_KG_PER_PERSON, perPerson, total: perPerson * persons };
}
