import { describe, expect, it } from "vitest";
import type { PrayerName } from "@/lib/types";
import en from "@/messages/en/prayer.json";
import id from "@/messages/id/prayer.json";
import ja from "@/messages/ja/prayer.json";
import {
  ARC,
  ARC_END,
  ARC_ORDER,
  ARC_START,
  boxesOverlap,
  computeViewBox,
  estimateTextWidth,
  fractionOf,
  labelBox,
  layoutLabels,
  skyWeights,
  type ArcTimes,
} from "./arc-geometry";

/** Jam Tokyo (JST = UTC+9) pada satu tanggal sebagai instant. */
function jst(date: string, hm: string): Date {
  return new Date(`${date}T${hm}:00+09:00`);
}

function day(date: string, hms: [string, string, string, string, string, string]): ArcTimes {
  const [fajr, sunrise, dhuhr, asr, maghrib, isha] = hms;
  return {
    fajr: jst(date, fajr),
    sunrise: jst(date, sunrise),
    dhuhr: jst(date, dhuhr),
    asr: jst(date, asr),
    maghrib: jst(date, maghrib),
    isha: jst(date, isha),
  };
}

// Kisaran nyata Matsudo (Chiba) sepanjang tahun, termasuk jarak Subuh-syuruk/Magrib-Isya terpendek.
const SEASONS: Record<string, ArcTimes> = {
  winter: day("2026-12-21", ["05:15", "06:46", "11:35", "14:05", "16:28", "17:52"]),
  spring: day("2026-03-20", ["04:23", "05:46", "11:50", "15:15", "17:55", "19:12"]),
  summer: day("2026-06-21", ["02:48", "04:25", "11:43", "15:32", "19:01", "20:44"]),
  autumn: day("2026-09-23", ["04:13", "05:28", "11:35", "14:58", "17:41", "18:56"]),
  shortTwilight: day("2026-11-08", ["05:00", "05:50", "11:30", "14:10", "16:35", "17:20"]),
};

const NAMES: Record<string, Record<PrayerName, string>> = { en: en.names, id: id.names, ja: ja.names };

function layoutFor(times: ArcTimes, names: Record<PrayerName, string>) {
  const fractions = {} as Record<PrayerName, number>;
  const widths = {} as Record<PrayerName, number>;
  for (const name of ARC_ORDER) {
    fractions[name] = fractionOf(times[name].getTime(), times);
    widths[name] = Math.max(estimateTextWidth(names[name], ARC.NAME_SIZE, true), estimateTextWidth("00:00", ARC.TIME_SIZE));
  }
  return layoutLabels(fractions, widths);
}

describe("fractionOf", () => {
  const times = SEASONS.winter;
  it("maps sunrise to 0, maghrib to 1 and dhuhr near the top", () => {
    expect(fractionOf(times.sunrise.getTime(), times)).toBeCloseTo(0);
    expect(fractionOf(times.maghrib.getTime(), times)).toBeCloseTo(1);
    const dhuhr = fractionOf(times.dhuhr.getTime(), times);
    expect(dhuhr).toBeGreaterThan(0.4);
    expect(dhuhr).toBeLessThan(0.6);
  });

  it("places fajr and isha below the horizon and clamps the night", () => {
    expect(fractionOf(times.fajr.getTime(), times)).toBeCloseTo(-ARC.TWILIGHT);
    expect(fractionOf(times.isha.getTime(), times)).toBeCloseTo(1 + ARC.TWILIGHT);
    expect(fractionOf(jst("2026-12-21", "00:30").getTime(), times)).toBeCloseTo(ARC_START);
    expect(fractionOf(jst("2026-12-21", "23:59").getTime(), times)).toBeCloseTo(ARC_END);
  });

  it("is monotonic across the day", () => {
    let prev = -Infinity;
    for (let m = 0; m < 24 * 60; m += 5) {
      const t = jst("2026-12-21", "00:00").getTime() + m * 60_000;
      const f = fractionOf(t, times);
      expect(f).toBeGreaterThanOrEqual(prev);
      prev = f;
    }
  });
});

describe("layoutLabels", () => {
  for (const [season, times] of Object.entries(SEASONS)) {
    for (const [locale, names] of Object.entries(NAMES)) {
      it(`has no overlapping labels and fits the viewBox (${season}, ${locale})`, () => {
        const labels = layoutFor(times, names);
        const boxes = labels.map(labelBox);
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            expect(boxesOverlap(boxes[i], boxes[j]), `${labels[i].name} vs ${labels[j].name}`).toBe(false);
          }
        }
        const vb = computeViewBox(labels);
        for (const b of boxes) {
          expect(b.left).toBeGreaterThanOrEqual(vb.x + ARC.PAD - 0.01);
          expect(b.right).toBeLessThanOrEqual(vb.x + vb.width - ARC.PAD + 0.01);
          expect(b.top).toBeGreaterThanOrEqual(vb.y + ARC.PAD - 1);
          expect(b.bottom).toBeLessThanOrEqual(vb.y + vb.height - ARC.PAD + 1);
        }
        // Simetris di sekitar pusat busur.
        expect(vb.x).toBe(-vb.width / 2);
      });
    }
  }

  it("keeps labels from covering any marker", () => {
    for (const times of Object.values(SEASONS)) {
      const labels = layoutFor(times, NAMES.ja);
      for (const l of labels) {
        const b = labelBox(l);
        for (const other of labels) {
          const { x, y } = other.marker;
          const inside = x > b.left - 4 && x < b.right + 4 && y > b.top - 4 && y < b.bottom + 4;
          expect(inside, `${l.name} label covers ${other.name} marker`).toBe(false);
        }
      }
    }
  });
});

describe("skyWeights", () => {
  const times = SEASONS.autumn;
  const sum = (w: Record<string, number>) => Object.values(w).reduce((a, b) => a + b, 0);
  it("sums to one and follows the day", () => {
    const at = (hm: string) => skyWeights(jst("2026-09-23", hm).getTime(), times);
    for (const hm of ["01:00", "04:30", "05:30", "09:00", "12:00", "17:30", "18:30", "22:00"]) {
      expect(sum(at(hm))).toBeCloseTo(1);
    }
    expect(at("01:00").night).toBe(1);
    expect(at("12:00").day).toBe(1);
    expect(at("05:20").dawn).toBeGreaterThan(0.5);
    expect(at("17:45").dusk).toBeGreaterThan(0.5);
  });
});
