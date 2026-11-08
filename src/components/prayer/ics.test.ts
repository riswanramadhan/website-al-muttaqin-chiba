import { describe, expect, it } from "vitest";
import { getUpcomingSchedule } from "@/lib/prayer";
import { prayerConfig } from "@/data/prayer-config";
import { profile } from "@/data/profile";
import { tokyoDate } from "@/lib/utils/i18n";
import { buildPrayerCalendar, escapeText, foldLine, toTokyoStamp, triggerFor } from "./ics";
import { clampDays, imsakFrom, resolveMonth, shiftMonth } from "./prayer-utils";

const names = { fajr: "Subuh", dhuhr: "Zuhur", asr: "Asar", maghrib: "Magrib", isha: "Isya" };

describe("ICS jadwal salat", () => {
  const from = tokyoDate(2026, 11, 4, 9, 0);
  const ics = buildPrayerCalendar({
    days: getUpcomingSchedule(2, prayerConfig, profile.coordinates, from),
    names,
    mosqueName: "Al Muttaqin",
    location: "Matsudo, Chiba",
    url: "https://almuttaqinculturalcenter.org/id/prayer-times",
    iqamahLabel: "Iqamah",
    domain: "almuttaqinculturalcenter.org",
    generatedAt: new Date("2026-11-04T00:00:00Z"),
  });
  const lines = ics.split("\r\n");

  it("memakai CRLF, VTIMEZONE Asia/Tokyo, dan satu VEVENT per salat wajib", () => {
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.includes("\n") && !ics.includes("\r\n")).toBe(false);
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("TZID:Asia/Tokyo");
    expect(lines.filter((l) => l === "BEGIN:VEVENT")).toHaveLength(10);
    expect(lines.filter((l) => l === "BEGIN:VALARM")).toHaveLength(10);
    expect(lines.at(-2)).toBe("END:VCALENDAR");
  });

  it("menulis SUMMARY dengan nama salat dan jam JST", () => {
    const summary = lines.find((l) => l.startsWith("SUMMARY:Subuh"));
    expect(summary).toMatch(/^SUMMARY:Subuh \d{2}:\d{2} · Al Muttaqin$/);
    expect(lines.some((l) => l.startsWith("DTSTART;TZID=Asia/Tokyo:20261104T"))).toBe(true);
  });

  it("alarm 10 menit sebelum iqamah (Subuh +20 menit -> PT10M, Magrib +5 menit -> -PT5M)", () => {
    const fajrIndex = lines.findIndex((l) => l === "UID:2026-11-04-fajr@almuttaqinculturalcenter.org");
    const fajrBlock = lines.slice(fajrIndex, fajrIndex + 20).join("\n");
    expect(fajrBlock).toContain("TRIGGER:PT10M");
    const maghribIndex = lines.findIndex((l) => l === "UID:2026-11-04-maghrib@almuttaqinculturalcenter.org");
    const maghribBlock = lines.slice(maghribIndex, maghribIndex + 20).join("\n");
    expect(maghribBlock).toContain("TRIGGER:-PT5M");
  });

  it("tidak ada baris fisik lebih dari 75 oktet", () => {
    const encoder = new TextEncoder();
    for (const line of lines) expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
  });
});

describe("util ICS", () => {
  it("melipat baris panjang dengan spasi di awal lanjutan, aman untuk multibyte", () => {
    const folded = foldLine("DESCRIPTION:" + "礼拝".repeat(40));
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    for (const [i, part] of parts.entries()) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
      if (i > 0) expect(part.startsWith(" ")).toBe(true);
    }
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join("")).toBe("DESCRIPTION:" + "礼拝".repeat(40));
  });

  it("escape teks dan stempel waktu Tokyo", () => {
    expect(escapeText("a;b,c\nd\\e")).toBe("a\\;b\\,c\\nd\\\\e");
    expect(toTokyoStamp(tokyoDate(2026, 11, 4, 5, 7))).toBe("20261104T050700");
    expect(triggerFor(-5)).toBe("-PT5M");
    expect(triggerFor(0)).toBe("PT0M");
  });
});

describe("util modul prayer", () => {
  it("resolveMonth memvalidasi query dan jatuh ke bulan Tokyo saat ini", () => {
    expect(resolveMonth("2026-02")).toEqual({ year: 2026, month: 2 });
    expect(resolveMonth(["2027-12", "x"])).toEqual({ year: 2027, month: 12 });
    const fallback = resolveMonth("2026-13", tokyoDate(2026, 11, 4));
    expect(fallback).toEqual({ year: 2026, month: 11 });
    expect(resolveMonth("1999-01", tokyoDate(2026, 11, 4))).toEqual({ year: 2026, month: 11 });
    expect(resolveMonth(undefined, tokyoDate(2026, 12, 31, 23, 59))).toEqual({ year: 2026, month: 12 });
  });

  it("shiftMonth melewati batas tahun", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("clampDays membatasi 1..60 dan imsak 10 menit sebelum Subuh", () => {
    expect(clampDays(null)).toBe(30);
    expect(clampDays("0")).toBe(1);
    expect(clampDays("999")).toBe(60);
    expect(clampDays("abc")).toBe(30);
    const fajr = tokyoDate(2026, 11, 4, 4, 40);
    expect(imsakFrom(fajr).getTime()).toBe(fajr.getTime() - 10 * 60_000);
  });
});
