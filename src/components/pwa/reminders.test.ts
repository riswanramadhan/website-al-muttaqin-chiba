import { describe, expect, it } from "vitest";
import type { PrayerConfig } from "@/lib/types";
import { getPrayerTimesToday } from "@/lib/prayer";
import {
  DEFAULT_PUSH_PREFS,
  buildReminderMessage,
  getCronEvents,
  getNextLocalReminder,
  getReminderEvents,
  normalizePreferences,
  reminderNotifyAt,
  reminderTag,
  wantsEvent,
} from "./reminders";

const config: PrayerConfig = {
  method: "MuslimWorldLeague",
  madhab: "shafi",
  highLatitudeRule: "MiddleOfTheNight",
  adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  iqamah: {
    fajr: { type: "offset", minutes: 20 },
    dhuhr: { type: "offset", minutes: 15 },
    asr: { type: "offset", minutes: 15 },
    maghrib: { type: "offset", minutes: 5 },
    isha: { type: "offset", minutes: 15 },
  },
  hijriAdjustment: 0,
  timezone: "Asia/Tokyo",
  jumuah: { time: "12:30" },
};
const coords = { lat: 35.787, lng: 139.903 };
// Rabu 2026-11-11 08:00 JST
const wednesday = new Date("2026-11-10T23:00:00Z");
// Jumat 2026-11-13 08:00 JST
const friday = new Date("2026-11-12T23:00:00Z");

describe("normalizePreferences", () => {
  it("fills defaults and keeps valid booleans", () => {
    expect(normalizePreferences(null)).toEqual(DEFAULT_PUSH_PREFS);
    expect(normalizePreferences({ fajr: false, extra: true, asr: "no" })).toEqual({ ...DEFAULT_PUSH_PREFS, fajr: false });
  });
});

describe("getReminderEvents", () => {
  it("creates adhan and iqamah events per enabled prayer", () => {
    const events = getReminderEvents(config, coords, DEFAULT_PUSH_PREFS, wednesday, 1);
    expect(events.filter((e) => e.kind === "adhan")).toHaveLength(5);
    expect(events.filter((e) => e.kind === "iqamah")).toHaveLength(5);
    const prefs = { ...DEFAULT_PUSH_PREFS, asr: false, iqamahReminder: false };
    const filtered = getReminderEvents(config, coords, prefs, wednesday, 1);
    expect(filtered.map((e) => e.prayer)).toEqual(["fajr", "dhuhr", "maghrib", "isha"]);
  });

  it("replaces dhuhr with jumuah on Friday", () => {
    const events = getReminderEvents(config, coords, DEFAULT_PUSH_PREFS, friday, 1);
    const jumuah = events.find((e) => e.kind === "jumuah");
    expect(jumuah?.time.toISOString()).toBe("2026-11-13T03:30:00.000Z");
    expect(events.some((e) => e.kind === "adhan" && e.prayer === "dhuhr")).toBe(false);
    expect(reminderNotifyAt(jumuah!).toISOString()).toBe("2026-11-13T03:00:00.000Z");
  });
});

describe("getNextLocalReminder", () => {
  it("returns the next reminder after now, with iqamah 10 minutes early", () => {
    const today = getPrayerTimesToday(config, coords, wednesday);
    const next = getNextLocalReminder(config, coords, DEFAULT_PUSH_PREFS, wednesday);
    expect(next?.event.kind).toBe("adhan");
    expect(next?.event.prayer).toBe("dhuhr");
    expect(next?.notifyAt.getTime()).toBe(today.times.dhuhr.getTime());

    const afterDhuhr = new Date(today.times.dhuhr.getTime() + 60_000);
    const iq = getNextLocalReminder(config, coords, DEFAULT_PUSH_PREFS, afterDhuhr);
    expect(iq?.event.kind).toBe("iqamah");
    expect(iq?.notifyAt.getTime()).toBe(today.iqamah.dhuhr.getTime() - 10 * 60_000);
  });
});

describe("getCronEvents", () => {
  it("sends each event exactly once across 5-minute cron runs", () => {
    const today = getPrayerTimesToday(config, coords, wednesday);
    const target = today.times.asr.getTime();
    let hits = 0;
    for (let t = target - 30 * 60_000; t <= target + 5 * 60_000; t += 5 * 60_000) {
      const events = getCronEvents(config, coords, new Date(t));
      hits += events.filter((e) => e.kind === "adhan" && e.prayer === "asr").length;
    }
    expect(hits).toBe(1);
  });
});

describe("messages", () => {
  it("builds localized text and stable tags", () => {
    const [event] = getReminderEvents(config, coords, DEFAULT_PUSH_PREFS, wednesday, 1);
    const msg = buildReminderMessage(event, "en", (key, v) => `${key}:${v.prayer}:${v.time}`, (p) => p.toUpperCase());
    expect(msg.title).toMatch(/^adhanTitle:FAJR:\d{2}:\d{2}$/);
    expect(reminderTag(event)).toBe("adhan-fajr-2026-11-11");
    expect(wantsEvent({ ...DEFAULT_PUSH_PREFS, iqamahReminder: false }, { ...event, kind: "iqamah" })).toBe(false);
  });
});
