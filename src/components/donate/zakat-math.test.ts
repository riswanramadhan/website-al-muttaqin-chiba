import { describe, expect, it } from "vitest";
import { calcZakatFitrah, calcZakatIncome, calcZakatMaal, convert } from "./zakat-math";
import { buildRecurringCalendarUrl } from "./calendar-link";

describe("calcZakatMaal", () => {
  const base = { goldGrams: 0, goldPricePerGram: 16000, silverValue: 0, savings: 0, receivables: 0, tradeGoods: 0, debts: 0 };

  it("uses 85 g of gold as nisab", () => {
    expect(calcZakatMaal(base).nisab).toBe(1_360_000);
  });

  it("is not due below nisab", () => {
    const r = calcZakatMaal({ ...base, savings: 1_000_000 });
    expect(r.eligible).toBe(false);
    expect(r.zakat).toBe(0);
  });

  it("charges 2.5 percent of net assets at or above nisab", () => {
    const r = calcZakatMaal({ ...base, goldGrams: 50, savings: 1_000_000, debts: 200_000 });
    expect(r.totalAssets).toBe(1_800_000);
    expect(r.netAssets).toBe(1_600_000);
    expect(r.eligible).toBe(true);
    expect(r.zakat).toBe(40_000);
  });

  it("ignores negative or invalid inputs", () => {
    const r = calcZakatMaal({ ...base, savings: -5, receivables: Number.NaN });
    expect(r.totalAssets).toBe(0);
  });
});

describe("calcZakatIncome", () => {
  it("annualises monthly income and compares to yearly nisab", () => {
    const r = calcZakatIncome({ amount: 300_000, period: "monthly", goldPricePerGram: 16000 });
    expect(r.annualIncome).toBe(3_600_000);
    expect(r.nisabYearly).toBe(1_360_000);
    expect(r.eligible).toBe(true);
    expect(r.zakatMonthly).toBe(7_500);
    expect(r.zakatYearly).toBe(90_000);
  });

  it("is not due when yearly income is below nisab", () => {
    const r = calcZakatIncome({ amount: 1_000_000, period: "yearly", goldPricePerGram: 16000 });
    expect(r.eligible).toBe(false);
    expect(r.zakatYearly).toBe(0);
  });
});

describe("calcZakatFitrah", () => {
  it("multiplies people by 2.5 kg rice and price", () => {
    const r = calcZakatFitrah({ persons: 4, ricePricePerKg: 500 });
    expect(r.riceKg).toBe(10);
    expect(r.perPerson).toBe(1250);
    expect(r.total).toBe(5000);
  });
});

describe("convert", () => {
  it("converts between yen and rupiah with the manual rate", () => {
    expect(convert(1000, "JPY", "IDR", 105)).toBe(105_000);
    expect(convert(105_000, "IDR", "JPY", 105)).toBe(1000);
    expect(convert(5, "JPY", "JPY", 105)).toBe(5);
  });
});

describe("buildRecurringCalendarUrl", () => {
  it("builds a monthly RRULE starting from the next occurrence in Tokyo", () => {
    // 2026-11-07 12:00 JST
    const now = new Date("2026-11-07T03:00:00.000Z");
    const url = new URL(buildRecurringCalendarUrl({ title: "Infaq", day: 5, now }));
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("recur")).toBe("RRULE:FREQ=MONTHLY;BYMONTHDAY=5");
    expect(url.searchParams.get("dates")).toBe("20261205T090000/20261205T093000");
    expect(url.searchParams.get("ctz")).toBe("Asia/Tokyo");
  });

  it("keeps the current month when the day has not passed and clamps to 1..28", () => {
    const now = new Date("2026-11-07T03:00:00.000Z");
    expect(new URL(buildRecurringCalendarUrl({ title: "x", day: 20, now })).searchParams.get("dates")).toBe("20261120T090000/20261120T093000");
    expect(new URL(buildRecurringCalendarUrl({ title: "x", day: 31, now })).searchParams.get("recur")).toBe("RRULE:FREQ=MONTHLY;BYMONTHDAY=28");
  });
});
