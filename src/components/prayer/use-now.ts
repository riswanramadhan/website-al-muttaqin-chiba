"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Jam berjalan sebagai external store bersama (satu interval per kadens).
 * Snapshot server bernilai 0 sehingga render hidrasi identik dengan HTML server; setelah itu
 * nilai diinisialisasi malas saat pertama dibaca di klien dan diperbarui tiap tick.
 * Mengembalikan null sampai jam klien tersedia.
 */
type ClockStore = { value: number; listeners: Set<() => void>; timer: number | null };

const stores = new Map<number, ClockStore>();

function getStore(intervalMs: number): ClockStore {
  let store = stores.get(intervalMs);
  if (!store) {
    store = { value: 0, listeners: new Set(), timer: null };
    stores.set(intervalMs, store);
  }
  return store;
}

function subscribeTo(intervalMs: number, onChange: () => void): () => void {
  const store = getStore(intervalMs);
  store.listeners.add(onChange);
  if (store.timer === null) {
    store.timer = window.setInterval(() => {
      store.value = Date.now();
      for (const listener of store.listeners) listener();
    }, intervalMs);
  }
  return () => {
    store.listeners.delete(onChange);
    if (store.listeners.size === 0 && store.timer !== null) {
      window.clearInterval(store.timer);
      store.timer = null;
      store.value = 0;
    }
  };
}

function readClock(intervalMs: number): number {
  const store = getStore(intervalMs);
  if (store.value === 0) store.value = Date.now();
  return store.value;
}

function serverClock(): number {
  return 0;
}

export function useNow(intervalMs = 1000): Date | null {
  const subscribe = useCallback((onChange: () => void) => subscribeTo(intervalMs, onChange), [intervalMs]);
  const getSnapshot = useCallback(() => readClock(intervalMs), [intervalMs]);
  const ms = useSyncExternalStore(subscribe, getSnapshot, serverClock);
  return ms === 0 ? null : new Date(ms);
}
