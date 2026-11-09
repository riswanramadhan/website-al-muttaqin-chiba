"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import type { GeoPoint, Locale, PrayerConfig } from "@/lib/types";
import { getSwRegistration, useNotificationPermission } from "./browser-state";
import { useLocalJson } from "./local-store";
import { ADHAN_VIBRATE, REMINDER_VIBRATE, claimReminder, readSoundSettings, triggerAlert, unlockAudio, useSoundSettings, warmAdhanCache } from "./adhan-sound";
import { AdhanAlertBanner } from "./adhan-alert-banner";
import { SW_REMINDER_MESSAGE, type ReminderPushPayload, type SwReminderMessage } from "./reminder-message";
import { PUSH_PREFS_KEY, buildReminderMessage, getDueReminders, getNextLocalReminder, reminderTag, type ReminderEvent, type ReminderTranslate } from "./reminders";
import { DEFAULT_STORED_PUSH, toStoredSettings, type StoredPushSettings } from "./use-push-subscription";

/** Pengecekan berkala terhadap jam (tahan terhadap timer yang ditunda saat tab di latar belakang). */
const CHECK_INTERVAL_MS = 20_000;

/**
 * Pengingat lokal saat App terbuka (tanpa server), dipasang sekali di layout App:
 * - tiap 20 detik (dan saat tab aktif lagi / fokus / online) mencari pengingat yang jatuh tempo
 *   (adzan, iqamah 10 menit sebelumnya, Jumat 30 menit sebelumnya); bila pengingat berikutnya
 *   kurang dari satu interval lagi, timer presisi dipasang tepat pada detiknya,
 * - tiap kejadian diklaim lewat tag di localStorage (lintas tab dan lintas sumber push) sehingga
 *   hanya berbunyi sekali,
 * - menampilkan notifikasi sistem lewat service worker (bila izin diberikan) dan memutar suara
 *   pilihan (adzan / chime / getar) dengan banner berisi tombol Stop,
 * - menerima pesan dari service worker saat push server tiba ketika App terbuka.
 */
export function useLocalAdhanReminder({ config, coordinates }: { config: PrayerConfig; coordinates: GeoPoint }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("settings");
  const tp = useTranslations("prayer");
  const permission = useNotificationPermission();
  const [raw] = useLocalJson<StoredPushSettings>(PUSH_PREFS_KEY, DEFAULT_STORED_PUSH);
  const settings = React.useMemo(() => toStoredSettings(raw), [raw]);
  const [sound] = useSoundSettings();

  const fire = React.useEffectEvent(async (event: ReminderEvent) => {
    const tag = reminderTag(event);
    if (!(await claimReminder(tag))) return;
    const translate: ReminderTranslate = (key, values) => t(`notify.${key}`, values);
    const { title, body } = buildReminderMessage(event, locale, translate, (p) => tp(`names.${p}`));
    const soundSettings = readSoundSettings();
    triggerAlert({ title, body, tag, kind: event.kind }, soundSettings);
    if (permission !== "granted") return;
    try {
      const options: NotificationOptions & { renotify?: boolean; vibrate?: number[]; actions?: { action: string; title: string }[] } = {
        body,
        tag,
        renotify: true,
        requireInteraction: event.kind === "adhan",
        silent: soundSettings.mode === "silent",
        vibrate: soundSettings.mode === "silent" ? undefined : event.kind === "adhan" ? ADHAN_VIBRATE : REMINDER_VIBRATE,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url: `/${locale}/app/prayer`, kind: event.kind, tag },
      };
      const reg = await getSwRegistration(3000);
      if (reg) {
        options.actions = [
          { action: "open", title: t("notify.actionOpen") },
          { action: "dismiss", title: t("notify.actionDismiss") },
        ];
        await reg.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } catch {
      // Notifikasi sistem gagal: banner & suara di halaman tetap tampil.
    }
  });

  const onPush = React.useEffectEvent(async (payload: ReminderPushPayload) => {
    const kind = payload.kind;
    if (kind !== "adhan" && kind !== "iqamah" && kind !== "jumuah") return;
    if (!(await claimReminder(payload.tag))) return;
    triggerAlert({ title: payload.title, body: payload.body, tag: payload.tag, kind });
  });

  // Pengecekan berkala terhadap jam.
  React.useEffect(() => {
    if (!settings.enabled) return;
    let precise: number | undefined;
    const check = () => {
      for (const event of getDueReminders(config, coordinates, settings, new Date())) void fire(event);
    };
    const tick = () => {
      check();
      window.clearTimeout(precise);
      const next = getNextLocalReminder(config, coordinates, settings, new Date());
      if (!next) return;
      const delay = next.notifyAt.getTime() - Date.now();
      if (delay <= CHECK_INTERVAL_MS + 1000) precise = window.setTimeout(check, Math.max(0, delay) + 150);
    };
    tick();
    const interval = window.setInterval(tick, CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", tick);
    window.addEventListener("online", tick);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(precise);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", tick);
      window.removeEventListener("online", tick);
    };
  }, [config, coordinates, settings]);

  // Push server tiba saat App terbuka: SW mengirim pesan, halaman memutar suara.
  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const onMessage = (e: MessageEvent) => {
      const data = e.data as Partial<SwReminderMessage> | null;
      if (data?.type === SW_REMINDER_MESSAGE && data.payload) void onPush(data.payload);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  // Buka kunci audio pada interaksi pertama (kebijakan autoplay browser).
  // Ketukan pada pemutar media lain (murottal, video) dilewati agar tidak menghentikannya di iOS;
  // pendengar dilepas setelah audio benar-benar terbuka.
  React.useEffect(() => {
    const opts = { capture: true, passive: true } as const;
    const events = ["pointerdown", "keydown", "touchend"] as const;
    const cleanup = () => {
      for (const ev of events) window.removeEventListener(ev, unlock, opts);
    };
    function unlock(e: Event) {
      if (unlockAudio(e.target)) cleanup();
    }
    for (const ev of events) window.addEventListener(ev, unlock, opts);
    return cleanup;
  }, []);

  // Simpan rekaman adzan di cache agar tetap berbunyi saat offline.
  React.useEffect(() => {
    if (!settings.enabled || sound.mode !== "adhan") return;
    const id = window.setTimeout(warmAdhanCache, 4000);
    return () => window.clearTimeout(id);
  }, [settings.enabled, sound.mode]);
}

/** Dipasang sekali di layout App: pengingat lokal + banner adzan. */
export function AdhanReminderHost({ config, coordinates }: { config: PrayerConfig; coordinates: GeoPoint }) {
  useLocalAdhanReminder({ config, coordinates });
  return <AdhanAlertBanner />;
}

/** Kompatibilitas lama: hanya memasang hook tanpa banner. */
export function LocalAdhanReminder({ config, coordinates }: { config: PrayerConfig; coordinates: GeoPoint }) {
  useLocalAdhanReminder({ config, coordinates });
  return null;
}
