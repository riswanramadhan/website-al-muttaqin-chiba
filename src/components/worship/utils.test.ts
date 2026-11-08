import { describe, expect, it } from "vitest";
import { tokyoDate, tokyoDateKey } from "@/lib/utils/i18n";
import { toHijri } from "@/lib/hijri";
import { angularDistance, compassPoint, daysUntilHijri, haversineKm, KAABA, lastDateKeys, normalizeDegrees, normalizeSearch, shortestDelta, stripBasmalah } from "./utils";

describe("haversine", () => {
  it("jarak Matsudo ke Makkah sekitar 9.500 km", () => {
    const km = haversineKm({ lat: 35.7876, lng: 139.9031 }, KAABA);
    expect(km).toBeGreaterThan(9300);
    expect(km).toBeLessThan(9700);
  });

  it("jarak titik yang sama adalah nol", () => {
    expect(haversineKm(KAABA, KAABA)).toBe(0);
  });
});

describe("sudut", () => {
  it("normalisasi dan selisih terpendek", () => {
    expect(normalizeDegrees(-90)).toBe(270);
    expect(normalizeDegrees(720)).toBe(0);
    expect(shortestDelta(350, 10)).toBe(20);
    expect(shortestDelta(10, 350)).toBe(-20);
    expect(angularDistance(359, 2)).toBe(3);
  });

  it("arah mata angin", () => {
    expect(compassPoint(0)).toBe("N");
    expect(compassPoint(293)).toBe("WNW");
    expect(compassPoint(359)).toBe("N");
  });
});

describe("hitung hari ke tanggal Hijriah", () => {
  it("1 Ramadan berikutnya dari pertengahan Syaban kurang dari 30 hari", () => {
    // 2026-02-01 adalah sekitar 13 Syaban 1447.
    const now = tokyoDate(2026, 2, 1, 12);
    const r = daysUntilHijri(9, 1, now);
    expect(r.hijri.year).toBe(1447);
    expect(r.days).toBeGreaterThan(10);
    expect(r.days).toBeLessThan(30);
    expect(toHijri(new Date(r.date.getTime() + 12 * 3_600_000))).toEqual({ year: 1447, month: 9, day: 1 });
  });

  it("tanggal yang sudah lewat memakai tahun Hijriah berikutnya", () => {
    const now = tokyoDate(2026, 4, 1, 12); // sekitar 13 Syawal 1447
    const r = daysUntilHijri(9, 1, now);
    expect(r.hijri.year).toBe(1448);
    expect(r.days).toBeGreaterThan(300);
    expect(r.days).toBeLessThan(360);
  });

  it("hari ini menghasilkan 0", () => {
    const now = tokyoDate(2026, 2, 1, 12);
    const h = toHijri(now);
    const r = daysUntilHijri(h.month, h.day, now);
    expect(r.days).toBe(0);
  });
});

describe("util lain", () => {
  it("kunci tanggal 7 hari terakhir berurutan dan diakhiri hari ini", () => {
    const now = tokyoDate(2026, 3, 10, 12);
    const keys = lastDateKeys(7, now);
    expect(keys).toHaveLength(7);
    expect(keys[6]).toBe(tokyoDateKey(now));
    expect(keys[0]).toBe("2026-03-04");
  });

  it("membuang basmalah di awal ayat", () => {
    const text = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ";
    expect(stripBasmalah(text)).toBe("الٓمٓ");
    expect(stripBasmalah("الٓمٓ")).toBe("الٓمٓ");
  });

  it("normalisasi pencarian mengabaikan harakat dan apostrof", () => {
    expect(normalizeSearch("Al-Fātiḥah")).toBe("alfatihah");
    expect(normalizeSearch("ٱلرَّحِيمِ")).toBe("ٱلرحيم");
  });
});
