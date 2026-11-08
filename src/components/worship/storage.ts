"use client";

import * as React from "react";

/**
 * Akses localStorage yang aman untuk SSR: nilai dibaca lewat useSyncExternalStore
 * sehingga render server memakai nilai bawaan dan klien memakai nilai tersimpan
 * tanpa setState di dalam efek.
 */

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function emit(): void {
  for (const l of listeners) l();
}

export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Penyimpanan penuh atau diblokir: abaikan.
  }
  emit();
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  writeStorage(key, JSON.stringify(value));
}

/** Nilai mentah (string) dari localStorage; null di server dan saat belum ada. */
export function useStorageRaw(key: string): string | null {
  const get = React.useCallback(() => readStorage(key), [key]);
  return React.useSyncExternalStore(subscribe, get, () => null);
}

/** Nilai JSON dari localStorage dengan setter. `fallback` sebaiknya konstanta modul. */
export function useStoredJson<T>(key: string, fallback: T): [T, (value: T) => void] {
  const raw = useStorageRaw(key);
  const value = React.useMemo(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
  const set = React.useCallback((next: T) => writeJson(key, next), [key]);
  return [value, set];
}

function noopSubscribe(): () => void {
  return () => {};
}

/** true hanya setelah hidrasi di klien. */
export function useIsClient(): boolean {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export type ArabicSize = "sm" | "md" | "lg";
export const ARABIC_SIZE_KEY = "acc-arabic-size";

export const ARABIC_SIZE_CLASS: Record<ArabicSize, string> = {
  sm: "text-2xl leading-[2]",
  md: "text-3xl leading-[2.05]",
  lg: "text-4xl leading-[2.1]",
};

export function useArabicSize(): [ArabicSize, (size: ArabicSize) => void] {
  const raw = useStorageRaw(ARABIC_SIZE_KEY);
  const size: ArabicSize = raw === "sm" || raw === "lg" ? raw : "md";
  const set = React.useCallback((next: ArabicSize) => writeStorage(ARABIC_SIZE_KEY, next), []);
  return [size, set];
}

/** Hormati prefers-reduced-motion tanpa setState di efek. */
export function useReducedMotionPreference(): boolean {
  const subscribeMedia = React.useCallback((cb: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);
  return React.useSyncExternalStore(
    subscribeMedia,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
