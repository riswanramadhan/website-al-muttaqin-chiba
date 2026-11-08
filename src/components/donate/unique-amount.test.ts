import { describe, expect, it } from "vitest";
import {
  formatUniqueCode,
  makeUniqueAmount,
  normalizeBaseAmount,
  randomUniqueCode,
  splitUniqueAmount,
} from "./unique-amount";

describe("makeUniqueAmount", () => {
  it("adds a three-digit code to a yen amount", () => {
    expect(makeUniqueAmount(5000, "JPY", 123)).toBe(5123);
  });

  it("adds the code as the last three digits of a rupiah amount (not concatenated)", () => {
    expect(makeUniqueAmount(100000, "IDR", 371)).toBe(100371);
  });

  it("rounds the base to the nearest thousand first", () => {
    expect(makeUniqueAmount(5400, "JPY", 5)).toBe(5005);
    expect(makeUniqueAmount(5600, "JPY", 5)).toBe(6005);
  });

  it("clamps the code into 1..999", () => {
    expect(makeUniqueAmount(1000, "JPY", 0)).toBe(1001);
    expect(makeUniqueAmount(1000, "JPY", 5000)).toBe(1999);
  });

  it("applies the minimum base per currency", () => {
    expect(normalizeBaseAmount(10, "JPY")).toBe(1000);
    expect(normalizeBaseAmount(0, "IDR")).toBe(10000);
    expect(normalizeBaseAmount(Number.NaN, "IDR")).toBe(10000);
  });
});

describe("splitUniqueAmount", () => {
  it("recovers base and code from a transfer amount", () => {
    expect(splitUniqueAmount(100371)).toEqual({ base: 100000, code: 371 });
    expect(splitUniqueAmount(5123)).toEqual({ base: 5000, code: 123 });
    expect(splitUniqueAmount(3000)).toEqual({ base: 3000, code: 0 });
  });

  it("round-trips with makeUniqueAmount", () => {
    for (const code of [1, 42, 500, 999]) {
      const amount = makeUniqueAmount(250000, "IDR", code);
      expect(splitUniqueAmount(amount)).toEqual({ base: 250000, code });
    }
  });
});

describe("randomUniqueCode", () => {
  it("stays within 1..999 for the whole random range", () => {
    expect(randomUniqueCode(() => 0)).toBe(1);
    expect(randomUniqueCode(() => 0.5)).toBe(500);
    expect(randomUniqueCode(() => 0.999999)).toBe(999);
    expect(randomUniqueCode(() => 1)).toBe(999);
  });
});

describe("formatUniqueCode", () => {
  it("pads to three digits", () => {
    expect(formatUniqueCode(7)).toBe("007");
    expect(formatUniqueCode(371)).toBe("371");
  });
});
