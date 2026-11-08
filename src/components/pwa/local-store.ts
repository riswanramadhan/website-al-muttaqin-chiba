"use client";

import * as React from "react";

/**
 * Penyimpanan lokal (localStorage) sebagai external store untuk useSyncExternalStore:
 * render server memakai nilai bawaan, klien memakai nilai tersimpan, tanpa setState di efek.
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

export function emitStorageChange(): void {
  for (const l of listeners) l();
}

export function readLocal(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Penyimpanan penuh atau diblokir (mode privat): abaikan.
  }
  emitStorageChange();
}

export function readLocalJson<T>(key: string, fallback: T): T {
  const raw = readLocal(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Nilai mentah dari localStorage; null di server dan saat belum ada. */
export function useLocalValue(key: string): string | null {
  const get = React.useCallback(() => readLocal(key), [key]);
  return React.useSyncExternalStore(subscribe, get, () => null);
}

/** Nilai JSON dari localStorage. `fallback` sebaiknya konstanta modul agar stabil. */
export function useLocalJson<T>(key: string, fallback: T): [T, (value: T) => void] {
  const raw = useLocalValue(key);
  const value = React.useMemo(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
  const set = React.useCallback((next: T) => writeLocal(key, JSON.stringify(next)), [key]);
  return [value, set];
}

/** Hapus semua kunci localStorage milik situs (awalan `acc-`). */
export function clearSiteStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("acc-")) keys.push(k);
    }
    for (const k of keys) window.localStorage.removeItem(k);
  } catch {
    // abaikan
  }
  emitStorageChange();
}
