"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/types";
import { formatDateTime, formatNumber, formatTime, formatWeekday, parseTokyoDate, tokyoDateKey } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SwitchRow } from "@/components/ui/switch";
import { readJson, useStoredJson, writeJson } from "./storage";
import { lastDateKeys } from "./utils";

// ---------------------------------------------------------------
// Data
// ---------------------------------------------------------------

type PresetKey = "subhanallah" | "alhamdulillah" | "allahuakbar" | "tahlil" | "astaghfirullah" | "salawat";

/** Urutan dzikir; "lanjut otomatis" berpindah ke dzikir berikutnya (tasbih, tahmid, takbir, ...). */
const PRESETS: { key: PresetKey; arabic: string; latin: string }[] = [
  { key: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", latin: "Subhanallah" },
  { key: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", latin: "Alhamdulillah" },
  { key: "allahuakbar", arabic: "اللَّهُ أَكْبَرُ", latin: "Allahu Akbar" },
  { key: "tahlil", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", latin: "La ilaha illallah" },
  { key: "astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", latin: "Astaghfirullah" },
  { key: "salawat", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", latin: "Allahumma shalli 'ala Muhammad" },
];

const TARGETS = [33, 99, 100] as const;

/** Data lama tetap kompatibel: `acc-tasbih` (total per hari) dan `acc-tasbih-prefs` (tanpa autoAdvance). */
type Prefs = { target: number; preset: PresetKey; vibrate: boolean; sound: boolean; autoAdvance?: boolean };
type Totals = Record<string, number>;
type Session = { count: number; laps: number; taps: number };
type HistoryItem = { at: string; preset: PresetKey; target: number };

const TOTALS_KEY = "acc-tasbih";
const PREFS_KEY = "acc-tasbih-prefs";
const SESSION_KEY = "acc-tasbih-session";
const HISTORY_KEY = "acc-tasbih-history";
const HISTORY_MAX = 50;

const DEFAULT_PREFS: Prefs = { target: 33, preset: "subhanallah", vibrate: true, sound: false, autoAdvance: true };
const EMPTY_TOTALS: Totals = {};
const EMPTY_SESSION: Session = { count: 0, laps: 0, taps: 0 };
const EMPTY_HISTORY: HistoryItem[] = [];

function normalizeSession(raw: Partial<Session> | null | undefined): Session {
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
  return { count: num(raw?.count), laps: num(raw?.laps), taps: num(raw?.taps) };
}

// ---------------------------------------------------------------
// Umpan balik (getar & suara Web Audio, tanpa file)
// ---------------------------------------------------------------

type AudioCtor = typeof AudioContext;
let ctxSingleton: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctxSingleton) {
    const Ctor: AudioCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctxSingleton = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctxSingleton.state === "suspended") void ctxSingleton.resume().catch(() => undefined);
  return ctxSingleton;
}

function tone(ctx: AudioContext, { freq, to, start, dur, peak, type }: { freq: number; to?: number; start: number; dur: number; peak: number; type: OscillatorType }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur * 0.6);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Bunyi "tok" lembut seperti butir tasbih kayu. */
function playBead() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    tone(ctx, { freq: 1900, to: 820, start: t, dur: 0.05, peak: 0.16, type: "triangle" });
    tone(ctx, { freq: 3800, start: t, dur: 0.018, peak: 0.03, type: "sine" });
  } catch {
    // Web Audio tidak tersedia: abaikan.
  }
}

/** Chime dua nada saat target tercapai. */
function playComplete() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    tone(ctx, { freq: 880, start: t, dur: 0.7, peak: 0.16, type: "sine" });
    tone(ctx, { freq: 1318.5, start: t + 0.16, dur: 0.9, peak: 0.14, type: "sine" });
  } catch {
    // abaikan
  }
}

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(pattern);
  } catch {
    // abaikan
  }
}

// ---------------------------------------------------------------
// Cincin butir tasbih (SVG)
// ---------------------------------------------------------------

const BEADS = 33;
const STEP = 360 / BEADS;
const VIEW = 320;
const C = VIEW / 2;
const BEAD_R = 138;
const PROGRESS_R = 116;
const PROGRESS_LEN = 2 * Math.PI * PROGRESS_R;

const BEAD_POINTS = Array.from({ length: BEADS }, (_, i) => {
  const a = ((i * STEP - 90) * Math.PI) / 180;
  return { x: C + BEAD_R * Math.cos(a), y: C + BEAD_R * Math.sin(a) };
});

/**
 * 33 butir pada untaian. Tiap ketukan memutar untaian satu butir (pegas) sehingga butir
 * berikutnya tiba di penanda emas di atas; butir yang sudah "ditarik" berwarna maroon.
 */
function BeadRing({ taps, count, target, reduced, celebrate }: { taps: number; count: number; target: number; reduced: boolean; celebrate: number }) {
  const inCycle = count === 0 ? 0 : ((count - 1) % BEADS) + 1;
  const current = taps % BEADS;
  const progress = Math.min(1, count / target);
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 20, mass: 0.7 };

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
      {/* Lintasan progres menuju target */}
      <circle cx={C} cy={C} r={PROGRESS_R} className="fill-none stroke-muted" strokeWidth={7} />
      <motion.circle
        cx={C}
        cy={C}
        r={PROGRESS_R}
        className="fill-none stroke-gold"
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={PROGRESS_LEN}
        transform={`rotate(-90 ${C} ${C})`}
        initial={false}
        animate={{ strokeDashoffset: PROGRESS_LEN * (1 - progress) }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
      />
      {/* Kilau saat target tercapai */}
      {celebrate > 0 && !reduced && (
        <motion.circle
          key={celebrate}
          cx={C}
          cy={C}
          r={PROGRESS_R}
          className="fill-none stroke-gold"
          strokeWidth={10}
          initial={{ opacity: 0.9, scale: 1 }}
          animate={{ opacity: 0, scale: 1.22 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ originX: "50%", originY: "50%" }}
        />
      )}

      {/* Untaian & butir */}
      <circle cx={C} cy={C} r={BEAD_R} className="fill-none stroke-border" strokeWidth={1.5} />
      <motion.g initial={false} animate={{ rotate: -taps * STEP }} transition={spring} style={{ originX: "50%", originY: "50%" }}>
        <circle cx={C} cy={C} r={BEAD_R + 12} fill="none" />
        {BEAD_POINTS.map((p, i) => {
          const passed = (current - i + BEADS) % BEADS;
          const done = passed >= 1 && passed <= inCycle;
          const isCurrent = i === current;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={isCurrent ? 11.5 : 9} className={cn("transition-colors duration-200", isCurrent ? "fill-gold" : done ? "fill-primary" : "fill-muted-foreground/25")} />
              <circle cx={p.x - 2.6} cy={p.y - 2.8} r={isCurrent ? 3.6 : 2.8} className="fill-background/45" />
            </g>
          );
        })}
      </motion.g>

      {/* Penanda tetap di atas */}
      <path d={`M ${C - 7} 4 L ${C + 7} 4 L ${C} 13 Z`} className="fill-gold" />
    </svg>
  );
}

// ---------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------

export function TasbihCounter({ locale }: { locale: Locale }) {
  const t = useTranslations("tasbih");
  const reduced = useReducedMotion() ?? false;
  const [prefs, setPrefs] = useStoredJson<Prefs>(PREFS_KEY, DEFAULT_PREFS);
  const [totals] = useStoredJson<Totals>(TOTALS_KEY, EMPTY_TOTALS);
  const [rawSession] = useStoredJson<Session>(SESSION_KEY, EMPTY_SESSION);
  const [history] = useStoredJson<HistoryItem[]>(HISTORY_KEY, EMPTY_HISTORY);
  const session = normalizeSession(rawSession);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");
  const [resetOpen, setResetOpen] = React.useState(false);
  const [celebrate, setCelebrate] = React.useState(0);
  const [reached, setReached] = React.useState<{ id: number; next: PresetKey | null } | null>(null);
  const hideTimer = React.useRef<number | undefined>(undefined);

  const target = Math.max(1, Math.floor(prefs.target) || 33);
  const presetIndex = Math.max(
    0,
    PRESETS.findIndex((p) => p.key === prefs.preset),
  );
  const preset = PRESETS[presetIndex];
  const autoAdvance = prefs.autoAdvance ?? true;
  const isCustomTarget = !TARGETS.includes(target as (typeof TARGETS)[number]);

  function update(patch: Partial<Prefs>) {
    setPrefs({ ...DEFAULT_PREFS, ...prefs, ...patch });
  }

  function resetCount() {
    const s = normalizeSession(readJson<Partial<Session>>(SESSION_KEY, EMPTY_SESSION));
    writeJson(SESSION_KEY, { ...s, count: 0 });
  }

  function selectPreset(key: PresetKey) {
    if (key === preset.key) return;
    update({ preset: key });
    resetCount();
  }

  function shiftPreset(delta: number) {
    selectPreset(PRESETS[(presetIndex + delta + PRESETS.length) % PRESETS.length].key);
  }

  function tap() {
    // Baca nilai terbaru dari penyimpanan agar ketukan cepat beruntun tidak hilang.
    const s = normalizeSession(readJson<Partial<Session>>(SESSION_KEY, EMPTY_SESSION));
    const next = s.count + 1;
    const day = tokyoDateKey(new Date());
    const current = readJson<Totals>(TOTALS_KEY, {});
    writeJson(TOTALS_KEY, { ...current, [day]: (current[day] ?? 0) + 1 });

    if (next >= target) {
      const log = readJson<HistoryItem[]>(HISTORY_KEY, []);
      writeJson(HISTORY_KEY, [{ at: new Date().toISOString(), preset: preset.key, target }, ...(Array.isArray(log) ? log : [])].slice(0, HISTORY_MAX));
      writeJson(SESSION_KEY, { count: 0, laps: s.laps + 1, taps: s.taps + 1 });
      const nextPreset = autoAdvance ? PRESETS[(presetIndex + 1) % PRESETS.length].key : null;
      if (nextPreset) update({ preset: nextPreset });
      if (prefs.vibrate) vibrate([40, 60, 40, 60, 140]);
      if (prefs.sound) playComplete();
      const id = Date.now();
      setCelebrate((c) => c + 1);
      setReached({ id, next: nextPreset });
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setReached((r) => (r?.id === id ? null : r)), 2600);
    } else {
      writeJson(SESSION_KEY, { ...s, count: next, taps: s.taps + 1 });
      if (prefs.vibrate) vibrate(12);
      if (prefs.sound) playBead();
    }
  }

  // Spasi / Enter di mana saja di halaman (selama fokus tidak di kolom isian atau tombol lain).
  const onGlobalKey = React.useEffectEvent((e: KeyboardEvent) => {
    if (e.key !== " " && e.key !== "Enter" && e.key !== "Spacebar") return;
    if (resetOpen || customOpen) return;
    const el = e.target as HTMLElement | null;
    if (el && el !== document.body && el.closest("input, textarea, select, button, a, [role='dialog'], [contenteditable='true']")) return;
    e.preventDefault();
    if (!e.repeat) tap();
  });

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => onGlobalKey(e);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) tap();
    }
  }

  function onKeyUp(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Spacebar") e.preventDefault();
  }

  function resetSession() {
    const s = normalizeSession(readJson<Partial<Session>>(SESSION_KEY, EMPTY_SESSION));
    writeJson(SESSION_KEY, { count: 0, laps: 0, taps: s.taps });
    setReached(null);
    setResetOpen(false);
  }

  function applyCustom() {
    const n = Number.parseInt(customValue, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 10_000) {
      update({ target: n });
      setCustomOpen(false);
      resetCount();
    }
  }

  const weekKeys = lastDateKeys(7);
  const todayKey = weekKeys[weekKeys.length - 1];
  const todayTotal = totals[todayKey] ?? 0;
  const weekTotal = weekKeys.reduce((sum, k) => sum + (totals[k] ?? 0), 0);
  const weekMax = Math.max(1, ...weekKeys.map((k) => totals[k] ?? 0));
  const recent = (Array.isArray(history) ? history : []).slice(0, 5);
  const presetByKey = (key: PresetKey) => PRESETS.find((p) => p.key === key) ?? PRESETS[0];
  const count = session.count;

  return (
    <div className="flex flex-col gap-4">
      <section className="card-surface relative flex flex-col items-center gap-4 overflow-hidden px-4 pt-5 pb-6">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent/70 to-transparent" />

        {/* Dzikir aktif */}
        <div className="relative flex w-full items-center gap-2">
          <Button variant="ghost" size="iconSm" onClick={() => shiftPreset(-1)} aria-label={t("prevDhikr")}>
            <ChevronLeft />
          </Button>
          <motion.div
            key={preset.key}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center"
          >
            <p lang="ar" dir="rtl" className="font-arabic text-3xl leading-[1.9]">
              {preset.arabic}
            </p>
            <p className="text-sm font-bold text-heading">{preset.latin}</p>
            <p className="text-xs text-muted-foreground">{t(`presets.${preset.key}`)}</p>
          </motion.div>
          <Button variant="ghost" size="iconSm" onClick={() => shiftPreset(1)} aria-label={t("nextDhikr")}>
            <ChevronRight />
          </Button>
        </div>

        {/* Cincin butir + tombol ketuk */}
        <div className="relative aspect-square w-full max-w-[19rem] select-none">
          <BeadRing taps={session.taps} count={count} target={target} reduced={reduced} celebrate={celebrate} />
          <motion.button
            type="button"
            onClick={tap}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            whileTap={reduced ? undefined : { scale: 0.93 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
            aria-label={t("tapButton")}
            aria-describedby="tasbih-progress"
            data-tone="maroon"
            className="icon-3d absolute inset-[19%] touch-manipulation flex-col rounded-full outline-offset-4 [-webkit-tap-highlight-color:transparent]"
          >
            {!reduced && session.taps > 0 && (
              <motion.span
                key={session.taps}
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-hero-foreground/50"
                initial={{ scale: 0.92, opacity: 0.7 }}
                animate={{ scale: 1.18, opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            )}
            <motion.span
              key={`${count}-${session.laps}`}
              initial={reduced ? false : { y: 10, opacity: 0.3, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              className="text-6xl leading-none font-bold tabular"
            >
              {formatNumber(count, locale)}
            </motion.span>
            <span className="mt-2 text-sm font-semibold opacity-80 tabular">/ {formatNumber(target, locale)}</span>
          </motion.button>
        </div>

        <p id="tasbih-progress" className="sr-only" aria-live="polite" aria-atomic="true">
          {t("progressLabel", { count, target })}
        </p>

        {/* Status putaran */}
        <div className="flex min-h-9 w-full items-center justify-center">
          {reached ? (
            <motion.p
              key={reached.id}
              role="status"
              initial={reduced ? false : { opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold text-heading"
            >
              <Sparkles className="size-4 text-gold" aria-hidden />
              {t("targetReached")}
              {reached.next && <span className="font-normal text-muted-foreground">{t("next", { name: presetByKey(reached.next).latin })}</span>}
            </motion.p>
          ) : (
            <p className="text-xs text-muted-foreground">{t("tapHint")}</p>
          )}
        </div>

        <dl className="grid w-full grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-surface px-2 py-2.5">
            <dt className="text-[0.68rem] font-semibold text-muted-foreground">{t("roundsLabel")}</dt>
            <dd className="text-lg font-bold tabular">{formatNumber(session.laps, locale)}</dd>
          </div>
          <div className="rounded-xl bg-surface px-2 py-2.5">
            <dt className="text-[0.68rem] font-semibold text-muted-foreground">{t("stats.today")}</dt>
            <dd className="text-lg font-bold tabular">{formatNumber(todayTotal, locale)}</dd>
          </div>
          <div className="rounded-xl bg-surface px-2 py-2.5">
            <dt className="text-[0.68rem] font-semibold text-muted-foreground">{t("targetLabel")}</dt>
            <dd className="text-lg font-bold tabular">{formatNumber(target, locale)}</dd>
          </div>
        </dl>

        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={count === 0 && session.laps === 0}>
              <RotateCcw />
              {t("reset.button")}
            </Button>
          </DialogTrigger>
          <DialogContent closeLabel={t("reset.cancel")}>
            <DialogHeader>
              <DialogTitle>{t("reset.title")}</DialogTitle>
              <DialogDescription>{t("reset.description")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetOpen(false)}>
                {t("reset.cancel")}
              </Button>
              <Button variant="destructive" onClick={resetSession}>
                {t("reset.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* Pilihan dzikir */}
      <section className="card-muted flex flex-col gap-3 p-4">
        <p className="text-xs font-semibold text-muted-foreground">{t("presets.label")}</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={t("presets.label")}>
          {PRESETS.map((p) => {
            const active = preset.key === p.key;
            return (
              <button
                key={p.key}
                type="button"
                aria-pressed={active}
                onClick={() => selectPreset(p.key)}
                className={cn(
                  "flex min-w-0 flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors",
                  active ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background hover:bg-surface",
                )}
              >
                <span lang="ar" dir="rtl" className="w-full truncate text-right font-arabic text-lg leading-snug">
                  {p.arabic}
                </span>
                <span className="w-full truncate text-xs font-semibold">{p.latin}</span>
                <span className="w-full truncate text-[0.68rem] text-muted-foreground">{t(`presets.${p.key}`)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Target & pengaturan */}
      <section className="card-muted flex flex-col gap-3 p-4">
        <p className="text-xs font-semibold text-muted-foreground">{t("targetLabel")}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("targetLabel")}>
          {TARGETS.map((n) => (
            <Button
              key={n}
              variant={target === n ? "primary" : "outline"}
              size="sm"
              aria-pressed={target === n}
              onClick={() => {
                update({ target: n });
                resetCount();
              }}
            >
              {n}
            </Button>
          ))}
          <Button variant={isCustomTarget ? "primary" : "outline"} size="sm" aria-pressed={isCustomTarget} aria-expanded={customOpen} onClick={() => setCustomOpen((v) => !v)}>
            {isCustomTarget ? `${t("custom")} (${target})` : t("custom")}
          </Button>
        </div>
        {customOpen && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applyCustom();
            }}
          >
            <Input type="number" inputMode="numeric" min={1} max={10000} value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder={t("customPlaceholder")} aria-label={t("customLabel")} />
            <Button type="submit" size="md">
              {t("custom")}
            </Button>
          </form>
        )}
        <div className="mt-1 divide-y divide-border border-t border-border">
          <SwitchRow id="tasbih-auto" label={t("settings.autoAdvance")} description={t("settings.autoAdvanceHint")} checked={autoAdvance} onCheckedChange={(v) => update({ autoAdvance: v })} />
          <SwitchRow id="tasbih-vibrate" label={t("settings.vibrate")} checked={prefs.vibrate} onCheckedChange={(v) => update({ vibrate: v })} />
          <SwitchRow
            id="tasbih-sound"
            label={t("settings.sound")}
            description={t("settings.soundHint")}
            checked={prefs.sound}
            onCheckedChange={(v) => {
              update({ sound: v });
              if (v) playBead();
            }}
          />
        </div>
      </section>

      {/* Statistik & riwayat */}
      <section className="card-surface flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold">{t("stats.week")}</h2>
          <span className="text-xs text-muted-foreground">{t("stats.weekTotal", { count: formatNumber(weekTotal, locale) })}</span>
        </div>
        {weekTotal === 0 ? (
          <p className="text-xs text-muted-foreground">{t("stats.empty")}</p>
        ) : (
          <ol className="flex h-28 items-end gap-1.5" aria-label={t("stats.week")}>
            {weekKeys.map((k) => {
              const v = totals[k] ?? 0;
              const date = parseTokyoDate(k, "12:00");
              return (
                <li key={k} className="flex h-full flex-1 flex-col items-center justify-end gap-1" aria-label={`${formatWeekday(date, locale, "short")}: ${t("stats.dayTotal", { count: v })}`}>
                  <span className="text-[10px] font-semibold text-muted-foreground tabular">{v > 0 ? formatNumber(v, locale) : ""}</span>
                  <span className={cn("w-full rounded-md transition-[height] duration-500", k === todayKey ? "bg-primary" : "bg-primary/40")} style={{ height: `${Math.max(4, (v / weekMax) * 72)}px` }} />
                  <span className="text-[10px] text-muted-foreground">{formatWeekday(date, locale, "short")}</span>
                </li>
              );
            })}
          </ol>
        )}

        {recent.length > 0 && (
          <div className="border-t border-border pt-3">
            <h3 className="text-xs font-semibold text-muted-foreground">{t("stats.recent")}</h3>
            <ul className="mt-2 divide-y divide-border">
              {recent.map((h) => (
                <li key={`${h.at}-${h.preset}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate font-semibold">{presetByKey(h.preset).latin}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular">
                    {t("stats.roundItem", { count: h.target })} · {tokyoDateKey(new Date(h.at)) === todayKey ? formatTime(h.at, locale) : formatDateTime(h.at, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
