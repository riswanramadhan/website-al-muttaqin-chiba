import type { GeoPoint, Locale, ObligatoryPrayer, PrayerConfig } from "@/lib/types";
import { OBLIGATORY_PRAYERS, getPrayerTimesToday } from "@/lib/prayer";
import { addDays, formatTime, parseTokyoDate } from "@/lib/utils/i18n";

/**
 * Preferensi notifikasi adzan (sama dengan kolom `push_subscriptions.preferences`)
 * dan perhitungan kejadian pengingat yang dipakai bersama oleh server (cron push)
 * dan klien (pengingat lokal saat App terbuka).
 */
export type PushPreferences = Record<ObligatoryPrayer, boolean> & {
  iqamahReminder: boolean;
  jumuah: boolean;
};

export const DEFAULT_PUSH_PREFS: PushPreferences = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  iqamahReminder: true,
  jumuah: true,
};

/** Kunci localStorage preferensi (PRD-07b). */
export const PUSH_PREFS_KEY = "acc-push-prefs";

/** Normalisasi nilai mentah (DB / localStorage) menjadi preferensi lengkap. */
export function normalizePreferences(raw: unknown): PushPreferences {
  const out: PushPreferences = { ...DEFAULT_PUSH_PREFS };
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    for (const key of Object.keys(DEFAULT_PUSH_PREFS) as (keyof PushPreferences)[]) {
      if (typeof r[key] === "boolean") out[key] = r[key] as boolean;
    }
  }
  return out;
}

export type ReminderKind = "adhan" | "iqamah" | "jumuah";

export type ReminderEvent = {
  kind: ReminderKind;
  prayer: ObligatoryPrayer;
  /** Kunci tanggal Tokyo YYYY-MM-DD. */
  dateKey: string;
  /** Waktu kejadian sebenarnya (adzan, iqamah, atau mulai Jumatan). */
  time: Date;
};

/** Menit sebelum iqamah untuk pengingat iqamah, dan sebelum Jumatan untuk pengingat Jumat. */
export const IQAMAH_LEAD_MIN = 10;
export const JUMUAH_LEAD_MIN = 30;

/** Tag notifikasi yang sama di server & klien agar notifikasi ganda saling menggantikan. */
export function reminderTag(e: Pick<ReminderEvent, "kind" | "prayer" | "dateKey">): string {
  return `${e.kind}-${e.prayer}-${e.dateKey}`;
}

/** Waktu ideal menampilkan pengingat di perangkat. */
export function reminderNotifyAt(e: ReminderEvent): Date {
  const lead = e.kind === "iqamah" ? IQAMAH_LEAD_MIN : e.kind === "jumuah" ? JUMUAH_LEAD_MIN : 0;
  return new Date(e.time.getTime() - lead * 60_000);
}

/**
 * Semua kejadian pengingat (sesuai preferensi) pada hari Tokyo `from` sampai `days` hari ke depan.
 * Pada hari Jumat, Zuhur digantikan Jumatan bila `config.jumuah.time` diisi.
 */
export function getReminderEvents(config: PrayerConfig, coords: GeoPoint, prefs: PushPreferences, from: Date = new Date(), days = 2): ReminderEvent[] {
  const out: ReminderEvent[] = [];
  for (let i = 0; i < days; i++) {
    const day = getPrayerTimesToday(config, coords, addDays(from, i));
    for (const prayer of OBLIGATORY_PRAYERS) {
      const isJumuah = day.isFriday && prayer === "dhuhr" && Boolean(config.jumuah.time);
      if (isJumuah) {
        if (prefs.jumuah) out.push({ kind: "jumuah", prayer, dateKey: day.dateKey, time: parseTokyoDate(day.dateKey, config.jumuah.time) });
        continue;
      }
      if (!prefs[prayer]) continue;
      out.push({ kind: "adhan", prayer, dateKey: day.dateKey, time: day.times[prayer] });
      if (prefs.iqamahReminder) out.push({ kind: "iqamah", prayer, dateKey: day.dateKey, time: day.iqamah[prayer] });
    }
  }
  return out.sort((a, b) => a.time.getTime() - b.time.getTime());
}

/** Pengingat berikutnya untuk perangkat (setelah `now`), berdasarkan waktu tampil idealnya. */
export function getNextLocalReminder(config: PrayerConfig, coords: GeoPoint, prefs: PushPreferences, now: Date = new Date()): { event: ReminderEvent; notifyAt: Date } | null {
  const events = getReminderEvents(config, coords, prefs, now, 2)
    .map((event) => ({ event, notifyAt: reminderNotifyAt(event) }))
    .filter((e) => e.notifyAt.getTime() > now.getTime())
    .sort((a, b) => a.notifyAt.getTime() - b.notifyAt.getTime());
  return events[0] ?? null;
}

/** Jendela cron server: kirim kejadian yang jatuh 5-10 menit ke depan (cron tiap 5 menit, tiap kejadian sekali). */
export const CRON_LOOKAHEAD_MIN = 10;
export const CRON_INTERVAL_MIN = 5;

/**
 * Kejadian untuk dikirim cron pada `now`: waktu kejadian (dikurangi jeda Jumat) di dalam
 * [now + lookahead - interval, now + lookahead). Adzan & iqamah diberitahukan sekitar 10 menit sebelumnya.
 */
export function getCronEvents(config: PrayerConfig, coords: GeoPoint, now: Date = new Date(), lookaheadMin = CRON_LOOKAHEAD_MIN, intervalMin = CRON_INTERVAL_MIN): ReminderEvent[] {
  const start = now.getTime() + (lookaheadMin - intervalMin) * 60_000;
  const end = now.getTime() + lookaheadMin * 60_000;
  // Semua jenis kejadian; filter preferensi dilakukan per langganan.
  const all = getReminderEvents(config, coords, { ...DEFAULT_PUSH_PREFS }, addDays(now, -1), 3);
  return all.filter((e) => {
    const lead = e.kind === "jumuah" ? (JUMUAH_LEAD_MIN - CRON_LOOKAHEAD_MIN) * 60_000 : 0;
    const t = e.time.getTime() - lead;
    return t >= start && t < end;
  });
}

/** Apakah langganan dengan preferensi ini ingin menerima kejadian tersebut. */
export function wantsEvent(prefs: PushPreferences, e: ReminderEvent): boolean {
  if (e.kind === "jumuah") return prefs.jumuah;
  if (e.kind === "iqamah") return prefs[e.prayer] && prefs.iqamahReminder;
  return prefs[e.prayer];
}

export type ReminderTranslate = (key: "adhanTitle" | "adhanBody" | "iqamahTitle" | "iqamahBody" | "jumuahTitle" | "jumuahBody", values: Record<string, string | number>) => string;

/** Judul & isi notifikasi pengingat (teks dari namespace `settings.notify`). */
export function buildReminderMessage(e: ReminderEvent, locale: Locale, t: ReminderTranslate, prayerName: (p: ObligatoryPrayer) => string): { title: string; body: string } {
  const values = { prayer: prayerName(e.prayer), time: formatTime(e.time, locale), minutes: e.kind === "jumuah" ? JUMUAH_LEAD_MIN : IQAMAH_LEAD_MIN };
  if (e.kind === "iqamah") return { title: t("iqamahTitle", values), body: t("iqamahBody", values) };
  if (e.kind === "jumuah") return { title: t("jumuahTitle", values), body: t("jumuahBody", values) };
  return { title: t("adhanTitle", values), body: t("adhanBody", values) };
}
