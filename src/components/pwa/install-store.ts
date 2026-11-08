"use client";

import * as React from "react";

/**
 * Menangkap `beforeinstallprompt` sedini mungkin (modul dimuat lewat PwaRuntime di layout)
 * dan menyimpannya sebagai external store agar InstallPrompt bisa memanggil prompt() kapan saja.
 */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

type InstallSnapshot = { canPrompt: boolean; installed: boolean };

let deferred: BeforeInstallPromptEvent | null = null;
let snapshot: InstallSnapshot = { canPrompt: false, installed: false };
const SERVER_SNAPSHOT: InstallSnapshot = { canPrompt: false, installed: false };
const listeners = new Set<() => void>();
let listening = false;

function update(next: Partial<InstallSnapshot>) {
  snapshot = { ...snapshot, ...next };
  for (const l of listeners) l();
}

export function startInstallListener(): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    update({ canPrompt: true });
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    update({ canPrompt: false, installed: true });
  });
}

// Pasang segera saat modul dimuat di browser.
startInstallListener();

function subscribe(cb: () => void): () => void {
  startInstallListener();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useInstallState(): InstallSnapshot {
  return React.useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  );
}

/** Tampilkan dialog instal bawaan browser; mengembalikan hasil pilihan pengguna. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const event = deferred;
  if (!event) return "unavailable";
  await event.prompt();
  const choice = await event.userChoice;
  deferred = null;
  update({ canPrompt: false, installed: choice.outcome === "accepted" ? true : snapshot.installed });
  return choice.outcome;
}
