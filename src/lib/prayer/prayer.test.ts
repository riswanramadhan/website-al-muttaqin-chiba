import { describe, expect, it } from "vitest";
import { formatCountdown, getNextPrayer, getPrayerTimesFor, getQiblaDirection, getUpcomingSchedule } from "@/lib/prayer";
import { prayerConfig } from "@/data/prayer-config";
import { profile } from "@/data/profile";
import { formatTime, tokyoDate } from "@/lib/utils/i18n";

const coords = profile.coordinates;

describe("prayer times (Matsudo)", () => {
  it("menghasilkan urutan waktu yang masuk akal untuk 4 Nov 2026", () => {
    const day = getPrayerTimesFor(2026, 11, 4, prayerConfig, coords);
    const { fajr, sunrise, dhuhr, asr, maghrib, isha } = day.times;
    expect(fajr.getTime()).toBeLessThan(sunrise.getTime());
    expect(sunrise.getTime()).toBeLessThan(dhuhr.getTime());
    expect(dhuhr.getTime()).toBeLessThan(asr.getTime());
    expect(asr.getTime()).toBeLessThan(maghrib.getTime());
    expect(maghrib.getTime()).toBeLessThan(isha.getTime());
    // Matahari terbit di Tokyo awal November sekitar 06:05 dan terbenam sekitar 16:40 JST.
    expect(formatTime(sunrise)).toMatch(/^0[56]:/);
    expect(formatTime(maghrib)).toMatch(/^16:/);
    expect(day.isFriday).toBe(false);
  });

  it("menandai Jumat dan menerapkan iqamah offset", () => {
    const friday = getPrayerTimesFor(2026, 11, 6, prayerConfig, coords);
    expect(friday.isFriday).toBe(true);
    const diff = (friday.iqamah.fajr.getTime() - friday.times.fajr.getTime()) / 60_000;
    expect(diff).toBe(20);
  });

  it("menemukan salat berikutnya relatif terhadap jam Tokyo", () => {
    const now = tokyoDate(2026, 11, 4, 13, 0); // 13:00 JST
    const next = getNextPrayer(prayerConfig, coords, now);
    expect(next.name).toBe("asr");
    expect(next.current).toBe("dhuhr");
    expect(next.isTomorrow).toBe(false);
    expect(next.remainingMs).toBeGreaterThan(0);
  });

  it("setelah Isya, salat berikutnya adalah Subuh besok", () => {
    const now = tokyoDate(2026, 11, 4, 23, 30);
    const next = getNextPrayer(prayerConfig, coords, now);
    expect(next.name).toBe("fajr");
    expect(next.isTomorrow).toBe(true);
  });

  it("jadwal 30 hari berurutan tanpa lompatan", () => {
    const days = getUpcomingSchedule(30, prayerConfig, coords, tokyoDate(2026, 11, 1));
    expect(days).toHaveLength(30);
    expect(days[0].dateKey).toBe("2026-11-01");
    expect(days[29].dateKey).toBe("2026-11-30");
  });

  it("arah kiblat dari Matsudo sekitar 293 derajat", () => {
    const qibla = getQiblaDirection(coords);
    expect(qibla).toBeGreaterThan(290);
    expect(qibla).toBeLessThan(296);
  });

  it("memformat hitung mundur", () => {
    expect(formatCountdown(0)).toBe("00:00");
    expect(formatCountdown(65_000)).toBe("01:05");
    expect(formatCountdown(3_725_000)).toBe("1:02:05");
  });
});
