import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from "adhan";
import type { GeoPoint, ObligatoryPrayer, PrayerConfig, PrayerName } from "@/lib/types";
import { addDays, daysInMonth, tokyoDate, tokyoParts } from "@/lib/utils/i18n";

export const PRAYER_NAMES: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
export const OBLIGATORY_PRAYERS: ObligatoryPrayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export type DailyPrayerTimes = {
  /** Kunci tanggal Tokyo "YYYY-MM-DD". */
  dateKey: string;
  /** Instant tengah malam Tokyo hari tersebut. */
  date: Date;
  times: Record<PrayerName, Date>;
  iqamah: Record<ObligatoryPrayer, Date>;
  sunnah: { middleOfTheNight: Date; lastThirdOfTheNight: Date };
  isFriday: boolean;
};

export type NextPrayerInfo = {
  name: PrayerName;
  time: Date;
  iqamah?: Date;
  /** Salat yang sedang berlangsung (waktu terakhir yang sudah masuk). */
  current: PrayerName | null;
  /** Milidetik sampai waktu berikutnya. */
  remainingMs: number;
  /** Apakah waktu berikutnya jatuh besok (setelah Isya). */
  isTomorrow: boolean;
  /** Progres 0..1 antara waktu salat sekarang dan berikutnya. */
  progress: number;
};

export function buildParams(config: PrayerConfig): CalculationParameters {
  const factory = CalculationMethod[config.method];
  const params = factory();
  params.madhab = config.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule[config.highLatitudeRule];
  params.adjustments = { ...config.adjustments };
  return params;
}

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number);
  return { hour: h, minute: m };
}

/** Waktu salat untuk tanggal sipil Tokyo tertentu. */
export function getPrayerTimesFor(
  year: number,
  month: number,
  day: number,
  config: PrayerConfig,
  coords: GeoPoint,
): DailyPrayerTimes {
  const params = buildParams(config);
  const coordinates = new Coordinates(coords.lat, coords.lng);
  // adhan membaca komponen tanggal lokal; buat Date lokal pada siang hari agar aman di zona mana pun.
  const localNoon = new Date(year, month - 1, day, 12, 0, 0, 0);
  const pt = new PrayerTimes(coordinates, localNoon, params);
  const times: Record<PrayerName, Date> = {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };
  const iqamah = {} as Record<ObligatoryPrayer, Date>;
  for (const prayer of OBLIGATORY_PRAYERS) {
    const rule = config.iqamah[prayer];
    if (rule.type === "offset") {
      iqamah[prayer] = new Date(times[prayer].getTime() + rule.minutes * 60_000);
    } else {
      const { hour, minute } = parseTime(rule.time);
      iqamah[prayer] = tokyoDate(year, month, day, hour, minute);
    }
  }
  const sunnah = new SunnahTimes(pt);
  const date = tokyoDate(year, month, day);
  return {
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    date,
    times,
    iqamah,
    sunnah: {
      middleOfTheNight: sunnah.middleOfTheNight,
      lastThirdOfTheNight: sunnah.lastThirdOfTheNight,
    },
    isFriday: tokyoParts(date).weekday === 5,
  };
}

/** Waktu salat untuk "hari ini" menurut Tokyo (atau instant lain). */
export function getPrayerTimesToday(config: PrayerConfig, coords: GeoPoint, now: Date = new Date()): DailyPrayerTimes {
  const p = tokyoParts(now);
  return getPrayerTimesFor(p.year, p.month, p.day, config, coords);
}

/** Jadwal satu bulan Tokyo (1..akhir bulan). */
export function getMonthSchedule(year: number, month: number, config: PrayerConfig, coords: GeoPoint): DailyPrayerTimes[] {
  const total = daysInMonth(year, month);
  const out: DailyPrayerTimes[] = [];
  for (let day = 1; day <= total; day++) {
    out.push(getPrayerTimesFor(year, month, day, config, coords));
  }
  return out;
}

/** Jadwal N hari ke depan mulai hari ini (dipakai cache offline 30 hari & ICS). */
export function getUpcomingSchedule(days: number, config: PrayerConfig, coords: GeoPoint, from: Date = new Date()): DailyPrayerTimes[] {
  const out: DailyPrayerTimes[] = [];
  for (let i = 0; i < days; i++) {
    const p = tokyoParts(addDays(from, i));
    out.push(getPrayerTimesFor(p.year, p.month, p.day, config, coords));
  }
  return out;
}

/** Salat berikutnya dan yang sedang berlangsung, relatif terhadap `now`. */
export function getNextPrayer(config: PrayerConfig, coords: GeoPoint, now: Date = new Date()): NextPrayerInfo {
  const today = getPrayerTimesToday(config, coords, now);
  const order: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  const nowMs = now.getTime();

  let current: PrayerName | null = null;
  for (const name of order) {
    if (today.times[name].getTime() <= nowMs) current = name;
  }

  for (let i = 0; i < order.length; i++) {
    const name = order[i];
    const time = today.times[name];
    if (time.getTime() > nowMs) {
      const prevTime = i === 0 ? null : today.times[order[i - 1]];
      const start = prevTime ? prevTime.getTime() : nowMs;
      const span = Math.max(time.getTime() - start, 1);
      return {
        name,
        time,
        iqamah: name === "sunrise" ? undefined : today.iqamah[name],
        current,
        remainingMs: time.getTime() - nowMs,
        isTomorrow: false,
        progress: Math.min(1, Math.max(0, (nowMs - start) / span)),
      };
    }
  }

  const tomorrow = getPrayerTimesToday(config, coords, addDays(now, 1));
  const start = today.times.isha.getTime();
  const span = Math.max(tomorrow.times.fajr.getTime() - start, 1);
  return {
    name: "fajr",
    time: tomorrow.times.fajr,
    iqamah: tomorrow.iqamah.fajr,
    current: "isha",
    remainingMs: tomorrow.times.fajr.getTime() - nowMs,
    isTomorrow: true,
    progress: Math.min(1, Math.max(0, (nowMs - start) / span)),
  };
}

/** Arah kiblat dalam derajat dari utara sejati. */
export function getQiblaDirection(coords: GeoPoint): number {
  return Qibla(new Coordinates(coords.lat, coords.lng));
}

/** Format sisa waktu "H:MM:SS" atau "MM:SS". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Bentuk ringkas yang aman dikirim ke klien / disimpan di localStorage. */
export type SerializedDay = {
  dateKey: string;
  times: Record<PrayerName, string>;
  iqamah: Record<ObligatoryPrayer, string>;
  isFriday: boolean;
};

export function serializeDay(day: DailyPrayerTimes): SerializedDay {
  const times = {} as Record<PrayerName, string>;
  for (const name of PRAYER_NAMES) times[name] = day.times[name].toISOString();
  const iqamah = {} as Record<ObligatoryPrayer, string>;
  for (const name of OBLIGATORY_PRAYERS) iqamah[name] = day.iqamah[name].toISOString();
  return { dateKey: day.dateKey, times, iqamah, isFriday: day.isFriday };
}

/** Apakah tanggal Tokyo berada dalam rentang Ramadan yang dikonfigurasi. */
export function isRamadan(config: PrayerConfig, now: Date = new Date()): boolean {
  if (!config.ramadan) return false;
  const p = tokyoParts(now);
  const key = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  return key >= config.ramadan.start && key <= config.ramadan.end;
}

/** Nama metode hitung untuk ditampilkan. */
export const METHOD_LABELS: Record<PrayerConfig["method"], string> = {
  MuslimWorldLeague: "Muslim World League",
  Egyptian: "Egyptian General Authority",
  Karachi: "University of Islamic Sciences, Karachi",
  UmmAlQura: "Umm al-Qura, Makkah",
  Dubai: "Dubai",
  MoonsightingCommittee: "Moonsighting Committee",
  NorthAmerica: "ISNA (North America)",
  Kuwait: "Kuwait",
  Qatar: "Qatar",
  Singapore: "Singapore (MUIS)",
  Turkey: "Diyanet (Turkey)",
  Tehran: "Tehran",
};
