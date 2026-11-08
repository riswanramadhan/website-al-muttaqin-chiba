"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import type { GeoPoint, Locale, PrayerConfig } from "@/lib/types";
import { getSwRegistration, useNotificationPermission } from "./browser-state";
import { useLocalJson } from "./local-store";
import { PUSH_PREFS_KEY, buildReminderMessage, getNextLocalReminder, reminderTag, type ReminderTranslate } from "./reminders";
import { DEFAULT_STORED_PUSH, toStoredSettings, type StoredPushSettings } from "./use-push-subscription";

/** Lewati pengingat yang terlambat lebih dari ini (tab tertidur / perangkat sleep). */
const MAX_LATE_MS = 5 * 60_000;
/** Batas setTimeout browser (~24,8 hari). */
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Pengingat lokal saat App terbuka (tanpa server): setTimeout ke pengingat berikutnya
 * (adzan, iqamah 10 menit sebelumnya, Jumat) lalu `registration.showNotification`
 * bila izin diberikan dan notifikasi diaktifkan di Pengaturan.
 */
export function useLocalAdhanReminder({ config, coordinates }: { config: PrayerConfig; coordinates: GeoPoint }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("settings");
  const tp = useTranslations("prayer");
  const permission = useNotificationPermission();
  const [raw] = useLocalJson<StoredPushSettings>(PUSH_PREFS_KEY, DEFAULT_STORED_PUSH);
  const settings = React.useMemo(() => toStoredSettings(raw), [raw]);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (permission !== "granted" || !settings.enabled) return;
    const next = getNextLocalReminder(config, coordinates, settings, new Date());
    if (!next) return;
    const delay = next.notifyAt.getTime() - Date.now();
    if (delay > MAX_TIMEOUT) return;

    const timer = window.setTimeout(async () => {
      try {
        if (Date.now() - next.notifyAt.getTime() <= MAX_LATE_MS) {
          const translate: ReminderTranslate = (key, values) => t(`notify.${key}`, values);
          const { title, body } = buildReminderMessage(next.event, locale, translate, (p) => tp(`names.${p}`));
          const options: NotificationOptions = {
            body,
            tag: reminderTag(next.event),
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            data: { url: `/${locale}/app/prayer` },
          };
          const reg = await getSwRegistration(3000);
          if (reg) await reg.showNotification(title, options);
          else new Notification(title, options);
        }
      } catch {
        // Notifikasi gagal ditampilkan: abaikan, jadwalkan berikutnya.
      }
      setTick((x) => x + 1);
    }, Math.max(0, delay));

    // Timer bisa tertunda saat tab di latar belakang; jadwalkan ulang saat kembali aktif.
    const onVisible = () => {
      if (document.visibilityState === "visible") setTick((x) => x + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [config, coordinates, settings, permission, tick, locale, t, tp]);
}

/** Komponen tanpa tampilan untuk memasang useLocalAdhanReminder dari Server Component. */
export function LocalAdhanReminder({ config, coordinates }: { config: PrayerConfig; coordinates: GeoPoint }) {
  useLocalAdhanReminder({ config, coordinates });
  return null;
}
