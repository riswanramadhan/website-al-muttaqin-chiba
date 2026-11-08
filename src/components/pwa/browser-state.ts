"use client";

import * as React from "react";

/** Status browser (online, mode standalone, izin notifikasi, platform) lewat useSyncExternalStore. */

function noopSubscribe(): () => void {
  return () => {};
}

function subscribeOnline(cb: () => void): () => void {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** true bila perangkat online. Server dan render awal menganggap online. */
export function useOnline(): boolean {
  return React.useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

const STANDALONE_QUERY = "(display-mode: standalone)";

function subscribeStandalone(cb: () => void): () => void {
  const mq = window.matchMedia(STANDALONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function readStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia(STANDALONE_QUERY).matches || nav.standalone === true;
}

/** true bila App berjalan sebagai PWA terpasang. */
export function useStandalone(): boolean {
  return React.useSyncExternalStore(subscribeStandalone, readStandalone, () => false);
}

export type PermissionState = NotificationPermission | "unsupported";

const permissionListeners = new Set<() => void>();

/** Panggil setelah requestPermission agar komponen membaca ulang izin. */
export function notifyPermissionChange(): void {
  for (const l of permissionListeners) l();
}

function subscribePermission(cb: () => void): () => void {
  permissionListeners.add(cb);
  // Izin bisa berubah dari pengaturan browser saat tab kembali aktif.
  document.addEventListener("visibilitychange", cb);
  return () => {
    permissionListeners.delete(cb);
    document.removeEventListener("visibilitychange", cb);
  };
}

function readPermission(): PermissionState {
  return "Notification" in window ? Notification.permission : "unsupported";
}

export function useNotificationPermission(): PermissionState {
  return React.useSyncExternalStore(subscribePermission, readPermission, () => "default");
}

/** Dukungan push: service worker + PushManager + Notification. */
export function usePushSupported(): boolean {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window,
    () => false,
  );
}

export type Platform = "ios" | "android" | "other";

function readPlatform(): Platform {
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/i.test(ua) || iPadOs) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

export function usePlatform(): Platform {
  return React.useSyncExternalStore(noopSubscribe, readPlatform, () => "other");
}

/** true hanya setelah hidrasi di klien. */
export function useIsClient(): boolean {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Registrasi service worker dengan batas waktu (di mode dev SW bisa tidak terdaftar). */
export async function getSwRegistration(timeoutMs = 6000): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing?.active) return existing;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), timeoutMs)),
  ]);
}
