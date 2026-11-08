import { describe, expect, it } from "vitest";
import { fromHijri, hijriMonthGrid, hijriMonthLength, toHijri } from "@/lib/hijri";
import { tokyoDate, tokyoDateKey } from "@/lib/utils/i18n";

describe("hijri calendar", () => {
  it("mengonversi tanggal Gregorian ke Hijriah (Umm al-Qura)", () => {
    // 1 Ramadan 1447 H jatuh pada 18 atau 19 Februari 2026 menurut Umm al-Qura.
    const h = toHijri(tokyoDate(2026, 2, 19, 12));
    expect(h.year).toBe(1447);
    expect(h.month).toBe(9);
    expect([1, 2]).toContain(h.day);
  });

  it("koreksi admin menggeser tanggal satu hari", () => {
    const base = toHijri(tokyoDate(2026, 11, 4, 12));
    const plus = toHijri(tokyoDate(2026, 11, 4, 12), 1);
    const diff = (plus.day - base.day + 30) % 30;
    expect([1, 29]).toContain(diff);
  });

  it("fromHijri dan toHijri saling konsisten", () => {
    const target = { year: 1448, month: 9, day: 1 };
    const g = fromHijri(target);
    const back = toHijri(new Date(g.getTime() + 12 * 3_600_000));
    expect(back).toEqual(target);
    // Awal Ramadan 1448 diperkirakan Februari 2027.
    expect(tokyoDateKey(g).startsWith("2027-02")).toBe(true);
  });

  it("panjang bulan 29 atau 30 hari dan grid lengkap", () => {
    const len = hijriMonthLength(1448, 9);
    expect([29, 30]).toContain(len);
    const grid = hijriMonthGrid(1448, 9);
    expect(grid).toHaveLength(len);
    expect(grid[0].hijriDay).toBe(1);
  });
});
