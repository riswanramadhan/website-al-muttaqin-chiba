import { describe, expect, it } from "vitest";
import type { PrayerConfig } from "@/lib/types";
import { getPrayerTimesToday } from "@/lib/prayer";
import {
  DEFAULT_PUSH_PREFS,
  buildReminderMessage,
  getCronEvents,
  getDueReminders,
  getNextLocalReminder,
  getReminderEvents,
  minuteFloor,
  normalizePreferences,
  pruneFiredLog,
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
  /** Simulasikan cron tiap `interval` menit (dengan jeda detik acak penjadwal) dan catat kapan kejadian dikirim. */
  function simulate(interval: number, offsetSec: number, from: number, to: number) {
    const sent: { tag: string; at: number; notifyAt: number }[] = [];
    for (let t = from + offsetSec * 1000; t <= to; t += interval * 60_000) {
      for (const e of getCronEvents(config, coords, new Date(t), interval)) {
        sent.push({ tag: reminderTag(e), at: t, notifyAt: reminderNotifyAt(e).getTime() });
      }
    }
    return sent;
  }

  it("delivers adhan in the same minute as the adhan time with a 1-minute trigger", () => {
    const today = getPrayerTimesToday(config, coords, wednesday);
    const target = today.times.asr.getTime();
    const sent = simulate(1, 7, minuteFloor(new Date(target - 30 * 60_000)), target + 10 * 60_000).filter((s) => s.tag.startsWith("adhan-asr"));
    expect(sent).toHaveLength(1);
    expect(sent[0].at - target).toBeGreaterThanOrEqual(0);
    expect(sent[0].at - target).toBeLessThan(60_000);
  });

  it("sends every event of a day exactly once, including iqamah and Friday reminders", () => {
    for (const day of [wednesday, friday]) {
      const expected = getReminderEvents(config, coords, DEFAULT_PUSH_PREFS, day, 1);
      expect(expected.length).toBeGreaterThan(0);
      for (const event of expected) {
        const tag = reminderTag(event);
        const notifyAt = reminderNotifyAt(event).getTime();
        // Cron tiap menit (detik ke-5) dari 3 menit sebelum sampai 3 menit sesudah waktu tampil.
        const sent = simulate(1, 5, minuteFloor(new Date(notifyAt - 3 * 60_000)), notifyAt + 3 * 60_000).filter((s) => s.tag === tag);
        expect(sent).toHaveLength(1);
        expect(sent[0].at).toBeGreaterThanOrEqual(notifyAt);
        expect(sent[0].at - notifyAt).toBeLessThan(60_000);
      }
    }
  });

  it("still sends each event once (never late) with a 5-minute trigger", () => {
    const today = getPrayerTimesToday(config, coords, wednesday);
    const target = today.times.maghrib.getTime();
    const sent = simulate(5, 0, minuteFloor(new Date(target - 60 * 60_000)) + 2 * 60_000, target + 10 * 60_000).filter((s) => s.tag.startsWith("adhan-maghrib"));
    expect(sent).toHaveLength(1);
    expect(sent[0].at).toBeLessThanOrEqual(target);
    expect(target - sent[0].at).toBeLessThan(5 * 60_000);
  });

  it("schedules Friday reminder 30 minutes before jumuah", () => {
    const at = new Date("2026-11-13T03:00:20Z");
    const events = getCronEvents(config, coords, at);
    expect(events.map((e) => e.kind)).toContain("jumuah");
  });
});

describe("getDueReminders", () => {
  it("returns reminders due now and skips ones that are too late", () => {
    const today = getPrayerTimesToday(config, coords, wednesday);
    const dhuhr = today.times.dhuhr.getTime();
    expect(getDueReminders(config, coords, DEFAULT_PUSH_PREFS, new Date(dhuhr - 1000))).toHaveLength(0);
    const due = getDueReminders(config, coords, DEFAULT_PUSH_PREFS, new Date(dhuhr + 20_000));
    expect(due.map(reminderTag)).toEqual(["adhan-dhuhr-2026-11-11"]);
    expect(getDueReminders(config, coords, DEFAULT_PUSH_PREFS, new Date(dhuhr + 4 * 60_000)).some((e) => e.kind === "adhan")).toBe(false);
    expect(getDueReminders(config, coords, { ...DEFAULT_PUSH_PREFS, dhuhr: false }, new Date(dhuhr + 20_000))).toHaveLength(0);
  });

  it("prunes old fired tags", () => {
    const now = Date.now();
    expect(pruneFiredLog({ a: now - 1000, b: now - 3 * 24 * 60 * 60_000 }, now)).toEqual({ a: now - 1000 });
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
