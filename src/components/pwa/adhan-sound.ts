"use client";

import * as React from "react";
import { readLocalJson, useLocalJson, writeLocal } from "./local-store";
import { pruneFiredLog, type FiredLog } from "./reminders";

/**
 * Suara pengingat adzan di dalam App (PRD-07b):
 * - pilihan suara (adzan penuh / chime singkat / getar saja / senyap) dan volume di localStorage,
 * - pemutar tunggal (HTMLAudioElement untuk adzan, Web Audio untuk chime) yang "dibuka" pada
 *   ketukan pertama karena browser memblokir autoplay sebelum ada interaksi pengguna,
 * - status banner adzan (external store untuk useSyncExternalStore),
 * - dedupe tag pengingat lintas tab agar satu kejadian hanya berbunyi sekali.
 *
 * Catatan: suara kustom tidak didukung untuk notifikasi push latar belakang; saat App tertutup
 * perangkat memakai suara notifikasi standarnya.
 */

export type SoundMode = "adhan" | "chime" | "vibrate" | "silent";
export const SOUND_MODES: SoundMode[] = ["adhan", "chime", "vibrate", "silent"];
export type SoundSettings = { mode: SoundMode; volume: number };

export const SOUND_PREFS_KEY = "acc-adhan-sound";
export const DEFAULT_SOUND: SoundSettings = { mode: "adhan", volume: 0.8 };

/** Rekaman adzan (lihat public/audio/CREDITS.md). MP3 untuk semua browser termasuk iOS, OGG cadangan. */
const ADHAN_SOURCES = [
  { src: "/audio/adhan-madinah.mp3", type: "audio/mpeg" },
  { src: "/audio/adhan-madinah.ogg", type: "audio/ogg" },
] as const;

export const ADHAN_VIBRATE = [600, 250, 600, 250, 900];
export const REMINDER_VIBRATE = [250, 120, 250];

export function normalizeSound(raw: unknown): SoundSettings {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const mode = SOUND_MODES.includes(r.mode as SoundMode) ? (r.mode as SoundMode) : DEFAULT_SOUND.mode;
  const volume = typeof r.volume === "number" && Number.isFinite(r.volume) ? Math.min(1, Math.max(0, r.volume)) : DEFAULT_SOUND.volume;
  return { mode, volume };
}

export function readSoundSettings(): SoundSettings {
  return normalizeSound(readLocalJson<unknown>(SOUND_PREFS_KEY, null));
}

export function useSoundSettings(): [SoundSettings, (next: SoundSettings) => void] {
  const [raw, set] = useLocalJson<unknown>(SOUND_PREFS_KEY, null);
  const value = React.useMemo(() => normalizeSound(raw), [raw]);
  return [value, set];
}

// ---------------------------------------------------------------
// Status banner / pemutaran
// ---------------------------------------------------------------

export type AlertSound = "adhan" | "chime" | "none";
export type AlertKind = "adhan" | "iqamah" | "jumuah" | "test" | "broadcast";

export type AlertState =
  | { status: "idle" }
  | {
      /** playing: suara berbunyi; blocked: browser menolak autoplay; shown: tanpa suara / selesai. */
      status: "playing" | "blocked" | "shown";
      /** alert: banner pengingat; preview: pratinjau dari Pengaturan (tanpa banner). */
      source: "alert" | "preview";
      sound: AlertSound;
      kind: AlertKind;
      title: string;
      body: string;
      tag: string;
    };

const IDLE: AlertState = { status: "idle" };
let state: AlertState = IDLE;
const listeners = new Set<() => void>();

function setState(next: AlertState) {
  state = next;
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAdhanAlert(): AlertState {
  return React.useSyncExternalStore(
    subscribe,
    () => state,
    () => IDLE,
  );
}

// ---------------------------------------------------------------
// Audio
// ---------------------------------------------------------------

type AudioCtor = typeof AudioContext;
let audioEl: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;
let chimeGain: GainNode | null = null;
let chimeTimer: number | undefined;
let unlocked = false;
/** Penanda pemutaran terbaru agar callback lama (ended/catch) tidak menimpa status baru. */
let playToken = 0;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof Audio === "undefined") return null;
  if (!audioEl) {
    const el = new Audio();
    el.preload = "auto";
    const source = ADHAN_SOURCES.find((s) => el.canPlayType(s.type) !== "") ?? ADHAN_SOURCES[0];
    el.src = source.src;
    audioEl = el;
  }
  return audioEl;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor: AudioCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Ada pemutar media lain di halaman yang sedang berbunyi (murottal, video)? */
function otherMediaPlaying(): boolean {
  if (typeof document === "undefined") return false;
  return Array.from(document.querySelectorAll<HTMLMediaElement>("audio, video")).some((m) => m !== audioEl && !m.paused);
}

/**
 * Dipanggil pada interaksi pertama (ketuk/tombol): memutar audio tanpa suara sesaat agar
 * pemutaran berikutnya (saat waktu adzan) diizinkan browser, termasuk Safari iOS.
 * Dilewati bila ketukan mengenai pemutar media lain atau ada media lain yang sedang berbunyi,
 * karena di iOS memutar elemen audio kedua menghentikan murottal. Mengembalikan true bila
 * audio sudah terbuka (pendengar boleh dilepas).
 */
export function unlockAudio(target?: EventTarget | null): boolean {
  if (unlocked) return true;
  if (typeof Element !== "undefined" && target instanceof Element && target.closest("[data-media-player], audio, video, iframe")) return false;
  if (otherMediaPlaying()) return false;
  unlocked = true;
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => undefined);
  const el = getAudio();
  if (!el || state.status === "playing") return true;
  el.muted = true;
  el.play()
    .then(() => {
      if (state.status !== "playing") {
        el.pause();
        el.currentTime = 0;
      }
      el.muted = false;
    })
    .catch(() => {
      el.muted = false;
      unlocked = false;
    });
  return true;
}

function stopChime() {
  window.clearTimeout(chimeTimer);
  if (chimeGain && audioCtx) {
    const now = audioCtx.currentTime;
    try {
      chimeGain.gain.cancelScheduledValues(now);
      chimeGain.gain.setValueAtTime(chimeGain.gain.value, now);
      chimeGain.gain.linearRampToValueAtTime(0, now + 0.08);
    } catch {
      // abaikan
    }
  }
  chimeGain = null;
}

function stopAudio() {
  if (audioEl) {
    audioEl.pause();
    try {
      audioEl.currentTime = 0;
    } catch {
      // abaikan
    }
  }
  stopChime();
}

/** Satu nada lonceng: beberapa parsial sinus dengan peluruhan eksponensial. */
function bell(ctx: AudioContext, dest: AudioNode, freq: number, start: number, duration: number) {
  const partials: [number, number][] = [
    [1, 1],
    [2.01, 0.35],
    [3.02, 0.14],
    [4.17, 0.06],
  ];
  for (const [ratio, amp] of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    const end = start + duration / Math.sqrt(ratio);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(amp, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(g).connect(dest);
    osc.start(start);
    osc.stop(end + 0.05);
  }
}

/** Chime lembut tiga nada (diulang `repeats` kali). Mengembalikan durasi (ms) atau null bila diblokir. */
async function playChime(volume: number, repeats = 2): Promise<number | null> {
  const ctx = getCtx();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  if (ctx.state !== "running") return null;
  stopChime();
  const master = ctx.createGain();
  master.gain.value = Math.max(0.0001, volume) * 0.45;
  master.connect(ctx.destination);
  chimeGain = master;
  const notes = [783.99, 659.25, 523.25];
  const t0 = ctx.currentTime + 0.03;
  const gap = 0.42;
  const cycle = notes.length * gap + 0.9;
  for (let r = 0; r < repeats; r++) {
    notes.forEach((f, i) => bell(ctx, master, f, t0 + r * cycle + i * gap, 2.2));
  }
  return Math.round((repeats * cycle + 1.6) * 1000);
}

function vibrate(pattern: number[]) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(pattern);
  } catch {
    // abaikan
  }
}

type AlertInput = { title: string; body: string; tag: string; kind: AlertKind };

function resolveSound(kind: AlertKind, mode: SoundMode): AlertSound {
  if (mode === "silent" || mode === "vibrate") return "none";
  if (mode === "adhan" && (kind === "adhan" || kind === "test")) return "adhan";
  return "chime";
}

async function startSound(sound: AlertSound, volume: number, token: number): Promise<void> {
  if (sound === "none") {
    if (token === playToken && state.status !== "idle") setState({ ...state, status: "shown" });
    return;
  }
  if (sound === "adhan") {
    const el = getAudio();
    if (el) {
      stopChime();
      el.volume = volume;
      el.muted = false;
      el.currentTime = 0;
      el.onended = () => {
        if (token === playToken && state.status === "playing") setState({ ...state, status: "shown" });
      };
      try {
        await el.play();
        unlocked = true;
        return;
      } catch (err) {
        if (token !== playToken || state.status === "idle") return;
        // NotAllowedError: autoplay diblokir. Lainnya (file gagal dimuat/offline): coba chime.
        if ((err as { name?: string } | null)?.name === "NotAllowedError") {
          setState({ ...state, status: "blocked" });
          return;
        }
      }
    }
  }
  const ms = await playChime(volume);
  if (token !== playToken || state.status === "idle") return;
  if (ms === null) {
    setState({ ...state, status: "blocked" });
    return;
  }
  chimeTimer = window.setTimeout(() => {
    if (token === playToken && state.status === "playing") setState({ ...state, status: "shown" });
  }, ms);
}

/** Tampilkan banner pengingat dan bunyikan suara sesuai pengaturan. */
export function triggerAlert(input: AlertInput, settings: SoundSettings = readSoundSettings()): void {
  stopAudio();
  const token = ++playToken;
  const sound = resolveSound(input.kind, settings.mode);
  if (settings.mode !== "silent") vibrate(input.kind === "adhan" ? ADHAN_VIBRATE : REMINDER_VIBRATE);
  setState({ status: sound === "none" ? "shown" : "playing", source: "alert", sound, ...input });
  void startSound(sound, settings.volume, token);
}

/** Pratinjau suara dari Pengaturan (tanpa banner). */
export function previewSound(settings: SoundSettings, labels: { title: string; body: string }): void {
  stopAudio();
  const token = ++playToken;
  unlocked = true;
  const sound = resolveSound("adhan", settings.mode);
  if (settings.mode === "vibrate") vibrate(ADHAN_VIBRATE);
  if (sound === "none") {
    setState(IDLE);
    return;
  }
  setState({ status: "playing", source: "preview", sound, kind: "test", tag: "acc-preview", ...labels });
  void startSound(sound, settings.volume, token);
}

/** Ubah volume pemutaran yang sedang berjalan. */
export function setPlayingVolume(volume: number): void {
  if (audioEl) audioEl.volume = Math.min(1, Math.max(0, volume));
  if (chimeGain) chimeGain.gain.value = Math.max(0.0001, volume) * 0.45;
}

/** Hentikan suara; banner tetap tampil (status "shown") sampai ditutup. */
export function stopAlertSound(): void {
  playToken++;
  stopAudio();
  if (state.status === "idle") return;
  if (state.source === "preview") setState(IDLE);
  else setState({ ...state, status: "shown" });
}

/** Coba putar lagi setelah diblokir (dipanggil dari ketukan pengguna). */
export function retryAlertSound(): void {
  if (state.status === "idle") return;
  const token = ++playToken;
  const settings = readSoundSettings();
  const sound: AlertSound = state.sound === "none" ? "chime" : state.sound;
  setState({ ...state, sound, status: "playing" });
  void startSound(sound, settings.volume, token);
}

export function dismissAlert(): void {
  playToken++;
  stopAudio();
  setState(IDLE);
}

let warmed = false;

/** Unduh rekaman adzan sekali (respons 200 penuh) agar disimpan cache SW dan tetap berbunyi saat offline. */
export function warmAdhanCache(): void {
  if (warmed || typeof window === "undefined" || typeof fetch === "undefined") return;
  warmed = true;
  const el = getAudio();
  const src = el?.src ? new URL(el.src).pathname : ADHAN_SOURCES[0].src;
  void fetch(src, { cache: "force-cache" }).catch(() => {
    warmed = false;
  });
}

// ---------------------------------------------------------------
// Dedupe lintas tab
// ---------------------------------------------------------------

export const FIRED_KEY = "acc-reminder-fired";

function claimSync(tag: string): boolean {
  const now = Date.now();
  const log = pruneFiredLog(readLocalJson<FiredLog>(FIRED_KEY, {}), now);
  if (log[tag]) return false;
  log[tag] = now;
  writeLocal(FIRED_KEY, JSON.stringify(log));
  return true;
}

/**
 * Klaim tag pengingat: true hanya untuk pemanggil pertama (tab mana pun, sumber lokal atau push).
 * Memakai Web Locks bila tersedia agar dua tab tidak berbunyi bersamaan.
 */
export async function claimReminder(tag: string): Promise<boolean> {
  const locks = typeof navigator !== "undefined" ? (navigator as Navigator & { locks?: LockManager }).locks : undefined;
  if (locks?.request) {
    try {
      return await locks.request("acc-reminder-claim", () => claimSync(tag));
    } catch {
      return claimSync(tag);
    }
  }
  return claimSync(tag);
}
