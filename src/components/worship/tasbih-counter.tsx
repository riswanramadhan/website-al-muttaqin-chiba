"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, Vibrate, Volume2, VolumeX } from "lucide-react";
import type { Locale } from "@/lib/types";
import { formatNumber, formatWeekday, parseTokyoDate, tokyoDateKey } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/primitives";
import { SwitchRow } from "@/components/ui/switch";
import { readJson, useStoredJson, writeJson } from "./storage";
import { lastDateKeys } from "./utils";

type PresetKey = "subhanallah" | "alhamdulillah" | "allahuakbar" | "astaghfirullah" | "salawat" | "tahlil";

const PRESETS: { key: PresetKey; arabic: string; latin: string }[] = [
  { key: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", latin: "Subhanallah" },
  { key: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", latin: "Alhamdulillah" },
  { key: "allahuakbar", arabic: "اللَّهُ أَكْبَرُ", latin: "Allahu Akbar" },
  { key: "astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", latin: "Astaghfirullah" },
  { key: "salawat", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", latin: "Allahumma shalli 'ala Muhammad" },
  { key: "tahlil", arabic: "لَا إِلَهَ إِلَّا اللَّهُ", latin: "La ilaha illallah" },
];

const TARGETS = [33, 99, 100] as const;

type Prefs = { target: number; preset: PresetKey; vibrate: boolean; sound: boolean };
type Totals = Record<string, number>;

const TOTALS_KEY = "acc-tasbih";
const PREFS_KEY = "acc-tasbih-prefs";
const DEFAULT_PREFS: Prefs = { target: 33, preset: "subhanallah", vibrate: true, sound: false };
const EMPTY_TOTALS: Totals = {};

type AudioCtor = typeof AudioContext;

export function TasbihCounter({ locale }: { locale: Locale }) {
  const t = useTranslations("tasbih");
  const [prefs, setPrefs] = useStoredJson<Prefs>(PREFS_KEY, DEFAULT_PREFS);
  const [totals] = useStoredJson<Totals>(TOTALS_KEY, EMPTY_TOTALS);
  const [count, setCount] = React.useState(0);
  const [laps, setLaps] = React.useState(0);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");
  const [resetOpen, setResetOpen] = React.useState(false);
  const [justReached, setJustReached] = React.useState(false);
  const audioRef = React.useRef<AudioContext | null>(null);

  const target = Math.max(1, prefs.target);
  const preset = PRESETS.find((p) => p.key === prefs.preset) ?? PRESETS[0];
  const isCustomTarget = !TARGETS.includes(target as (typeof TARGETS)[number]);

  function update(patch: Partial<Prefs>) {
    setPrefs({ ...prefs, ...patch });
  }

  function playClick() {
    try {
      const Ctor: AudioCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (!Ctor) return;
      audioRef.current ??= new Ctor();
      const ctx = audioRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Web Audio tidak tersedia: abaikan.
    }
  }

  function vibrate(pattern: number | number[]) {
    if (prefs.vibrate && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        // abaikan
      }
    }
  }

  function tap() {
    const next = count + 1;
    const key = tokyoDateKey(new Date());
    const current = readJson<Totals>(TOTALS_KEY, {});
    writeJson(TOTALS_KEY, { ...current, [key]: (current[key] ?? 0) + 1 });
    if (prefs.sound) playClick();
    if (next >= target) {
      setCount(0);
      setLaps((l) => l + 1);
      setJustReached(true);
      vibrate([40, 60, 80]);
      window.setTimeout(() => setJustReached(false), 1200);
    } else {
      setCount(next);
      vibrate(15);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      tap();
    }
  }

  function onKeyUp(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Spacebar") e.preventDefault();
  }

  function resetSession() {
    setCount(0);
    setLaps(0);
    setResetOpen(false);
  }

  function applyCustom() {
    const n = Number.parseInt(customValue, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 10_000) {
      update({ target: n });
      setCustomOpen(false);
      setCount(0);
    }
  }

  const weekKeys = lastDateKeys(7);
  const todayKey = weekKeys[weekKeys.length - 1];
  const todayTotal = totals[todayKey] ?? 0;
  const weekTotal = weekKeys.reduce((sum, k) => sum + (totals[k] ?? 0), 0);
  const weekMax = Math.max(1, ...weekKeys.map((k) => totals[k] ?? 0));

  return (
    <div className="flex flex-col gap-4">
      <section className="card-surface flex flex-col items-center gap-4 p-5">
        <div className="flex w-full flex-col items-center gap-1 text-center">
          <p lang="ar" dir="rtl" className="font-arabic text-3xl leading-relaxed">
            {preset.arabic}
          </p>
          <p className="text-sm font-semibold">{preset.latin}</p>
          <p className="text-xs text-muted-foreground">{t(`presets.${preset.key}`)}</p>
        </div>

        <button
          type="button"
          onClick={tap}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          aria-label={t("tapButton")}
          className={cn(
            "relative flex size-52 touch-manipulation flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform select-none hover:bg-primary-hover active:scale-[0.96]",
            justReached && "ring-4 ring-success/60",
          )}
        >
          <span className="text-6xl font-bold tabular" aria-live="polite" aria-atomic="true">
            {formatNumber(count, locale)}
          </span>
          <span className="mt-1 text-sm opacity-80">/ {formatNumber(target, locale)}</span>
        </button>
        <p className="text-xs text-muted-foreground">{t("tapHint")}</p>

        <Progress value={count} max={target} label={t("countLabel")} />

        <div className="flex w-full items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("roundsLabel")}</span>
          <span className="flex items-center gap-2 font-semibold">
            {t("rounds", { count: laps })}
            {justReached && <Badge variant="success">{t("targetReached")}</Badge>}
          </span>
        </div>
      </section>

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
                setCount(0);
              }}
            >
              {n}
            </Button>
          ))}
          <Button variant={isCustomTarget ? "primary" : "outline"} size="sm" aria-pressed={isCustomTarget} onClick={() => setCustomOpen((v) => !v)}>
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
      </section>

      <section className="card-muted flex flex-col gap-3 p-4">
        <p className="text-xs font-semibold text-muted-foreground">{t("presets.label")}</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={t("presets.label")}>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={prefs.preset === p.key}
              onClick={() => update({ preset: p.key })}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors",
                prefs.preset === p.key ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-surface",
              )}
            >
              <span lang="ar" dir="rtl" className="font-arabic w-full text-right text-lg leading-snug">
                {p.arabic}
              </span>
              <span className="text-xs font-semibold">{p.latin}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card-muted flex flex-col gap-1 p-4">
        <div className="flex items-center gap-3">
          <Vibrate className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <SwitchRow id="tasbih-vibrate" className="flex-1 py-2" label={t("settings.vibrate")} checked={prefs.vibrate} onCheckedChange={(v) => update({ vibrate: v })} />
        </div>
        <div className="flex items-center gap-3">
          {prefs.sound ? <Volume2 className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : <VolumeX className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
          <SwitchRow id="tasbih-sound" className="flex-1 py-2" label={t("settings.sound")} checked={prefs.sound} onCheckedChange={(v) => update({ sound: v })} />
        </div>
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 self-start">
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

      <section className="card-surface flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-bold">{t("stats.week")}</h2>
          <span className="text-xs text-muted-foreground">{t("stats.weekTotal", { count: formatNumber(weekTotal, locale) })}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">{t("stats.today")}</span>
          <span className="text-2xl font-bold tabular">{formatNumber(todayTotal, locale)}</span>
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
                  <span className="text-[10px] font-semibold tabular text-muted-foreground">{v > 0 ? formatNumber(v, locale) : ""}</span>
                  <span className={cn("w-full rounded-md", k === todayKey ? "bg-primary" : "bg-primary/40")} style={{ height: `${Math.max(4, (v / weekMax) * 72)}px` }} />
                  <span className="text-[10px] text-muted-foreground">{formatWeekday(date, locale, "short")}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
