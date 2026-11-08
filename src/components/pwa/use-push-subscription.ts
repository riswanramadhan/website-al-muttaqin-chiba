"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { getSwRegistration, notifyPermissionChange, useNotificationPermission, usePushSupported, type PermissionState } from "./browser-state";
import { useLocalJson } from "./local-store";
import { DEFAULT_PUSH_PREFS, PUSH_PREFS_KEY, normalizePreferences, type PushPreferences } from "./reminders";

/** Isi `acc-push-prefs`: preferensi per salat + sakelar utama `enabled`. */
export type StoredPushSettings = PushPreferences & { enabled: boolean };
export const DEFAULT_STORED_PUSH: StoredPushSettings = { ...DEFAULT_PUSH_PREFS, enabled: false };

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export type EnableResult = "granted" | "denied" | "unsupported" | "error";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function postSubscription(sub: PushSubscription, locale: string, preferences: PushPreferences): Promise<boolean> {
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON(), locale, preferences }),
  });
  return res.ok;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

/** Baca pengaturan push dari nilai mentah localStorage. */
export function toStoredSettings(raw: unknown): StoredPushSettings {
  const enabled = Boolean(raw && typeof raw === "object" && (raw as { enabled?: unknown }).enabled === true);
  return { ...normalizePreferences(raw), enabled };
}

/**
 * Langganan Web Push (PRD-07b): izin diminta setelah klik, `PushManager.subscribe` dengan
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY, lalu POST /api/push/subscribe { subscription, locale, preferences }.
 * Tanpa VAPID key: hanya izin notifikasi (pengingat lokal tetap bekerja saat App terbuka).
 */
export function usePushSubscription() {
  const locale = useLocale();
  const supported = usePushSupported();
  const permission: PermissionState = useNotificationPermission();
  const [rawStored, setStored] = useLocalJson<StoredPushSettings>(PUSH_PREFS_KEY, DEFAULT_STORED_PUSH);
  const settings = React.useMemo(() => toStoredSettings(rawStored), [rawStored]);
  const [endpoint, setEndpoint] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const vapidConfigured = VAPID_PUBLIC_KEY.length > 0;

  React.useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    currentSubscription()
      .then((sub) => {
        if (!cancelled) setEndpoint(sub?.endpoint ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [supported]);

  const enable = React.useCallback(async (): Promise<EnableResult> => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      notifyPermissionChange();
      if (result !== "granted") return "denied";
      const prefs = normalizePreferences(settings);
      setStored({ ...prefs, enabled: true });
      if (vapidConfigured && supported) {
        const reg = await getSwRegistration();
        if (!reg) return "error";
        const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) }));
        setEndpoint(sub.endpoint);
        await postSubscription(sub, locale, prefs);
      }
      return "granted";
    } catch {
      return "error";
    } finally {
      setBusy(false);
    }
  }, [settings, setStored, vapidConfigured, supported, locale]);

  const disable = React.useCallback(async () => {
    setBusy(true);
    try {
      setStored({ ...normalizePreferences(settings), enabled: false });
      const sub = await currentSubscription();
      if (sub) {
        const { endpoint: ep } = sub;
        await sub.unsubscribe().catch(() => false);
        await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: ep }) }).catch(() => undefined);
      }
      setEndpoint(null);
    } finally {
      setBusy(false);
    }
  }, [settings, setStored]);

  const setPreference = React.useCallback(
    (key: keyof PushPreferences, value: boolean) => {
      const prefs = { ...normalizePreferences(settings), [key]: value };
      setStored({ ...prefs, enabled: settings.enabled });
      if (endpoint && vapidConfigured) {
        currentSubscription()
          .then((sub) => (sub ? postSubscription(sub, locale, prefs) : false))
          .catch(() => false);
      }
    },
    [settings, setStored, endpoint, vapidConfigured, locale],
  );

  /** Notifikasi uji lewat registration.showNotification (fallback: Notification biasa). */
  const sendTest = React.useCallback(async (title: string, body: string): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return false;
    const options: NotificationOptions = { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: "acc-test" };
    try {
      const reg = await getSwRegistration(3000);
      if (reg) await reg.showNotification(title, options);
      else new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    supported,
    permission,
    vapidConfigured,
    enabled: settings.enabled && permission === "granted",
    subscribed: Boolean(endpoint),
    preferences: normalizePreferences(settings),
    busy,
    enable,
    disable,
    setPreference,
    sendTest,
  };
}
