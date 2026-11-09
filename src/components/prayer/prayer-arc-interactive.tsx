"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { formatCountdown } from "@/lib/prayer";
import type { GeoPoint, Locale, PrayerConfig, PrayerName } from "@/lib/types";
import { formatTime } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import {
  ARC,
  ARC_START,
  arcPath,
  isDarkSky,
  labelBox,
  pointAt,
  progressOf,
  skyWeights,
  toPercentBox,
  type Box,
  type SkyKey,
  type SkyWeights,
} from "./arc-geometry";
import { ACCENT_BRAND, ACCENT_GOLD, ArcScene, Celestial } from "./arc-parts";
import { useArcModel } from "./use-arc-model";
import { useNow } from "./use-now";

export type PrayerArcInteractiveProps = {
  config: PrayerConfig;
  coordinates: GeoPoint;
  className?: string;
  idleReadout?: "next" | "clock";
};

/** Gradien langit dari token (tanpa hex); bobotnya berubah halus sepanjang hari. */
const SKY: Record<SkyKey, string> = {
  night:
    "radial-gradient(70% 55% at 50% 0%, color-mix(in oklab, var(--i3d-indigo-3) 45%, transparent), transparent 70%), linear-gradient(180deg, var(--hero) 0%, var(--hero-2) 100%)",
  dawn:
    "radial-gradient(55% 40% at 14% 66%, color-mix(in oklab, var(--gold) 70%, transparent), transparent 75%), linear-gradient(180deg, var(--i3d-indigo-3) 0%, var(--hero-2) 55%, var(--i3d-coral-3) 100%)",
  day:
    "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in oklab, var(--i3d-sky-2) 22%, var(--card)) 0%, var(--card) 100%)",
  dusk:
    "radial-gradient(55% 40% at 86% 66%, color-mix(in oklab, var(--gold) 65%, transparent), transparent 75%), linear-gradient(180deg, var(--i3d-violet-3) 0%, var(--hero-2) 50%, color-mix(in oklab, var(--i3d-coral-2) 60%, var(--hero-2)) 100%)",
};
const SKY_KEYS: SkyKey[] = ["day", "dawn", "dusk", "night"];

/** Bintang tetap (koordinat relatif terhadap R) agar render server & klien identik. */
const STARS: Array<[number, number, number]> = [
  [-1.32, -0.92, 1.1],
  [-1.05, -1.18, 0.8],
  [-0.62, -1.3, 1],
  [-0.3, -0.62, 0.7],
  [0.18, -1.36, 0.9],
  [0.44, -0.78, 0.7],
  [0.78, -1.2, 1.1],
  [1.12, -1.02, 0.8],
  [1.4, -0.6, 0.9],
  [-1.45, -0.42, 0.7],
  [-0.12, -1.08, 0.6],
  [1.02, -0.36, 0.6],
];

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

function padBox(a: Box, b: Box, pad: number): Box {
  return {
    left: Math.min(a.left, b.left) - pad,
    top: Math.min(a.top, b.top) - pad,
    right: Math.max(a.right, b.right) + pad,
    bottom: Math.max(a.bottom, b.bottom) + pad,
  };
}

type Readout = {
  label: string;
  big: string;
  bigIsText: boolean;
  adhan: string | null;
  iqamah: string | null;
  badge: string | null;
};

export function PrayerArcInteractive({ config, coordinates, className, idleReadout = "next" }: PrayerArcInteractiveProps) {
  const t = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const now = useNow(1000);
  const reduceMotion = useReducedMotion();
  const model = useArcModel(config, coordinates, now);
  const { today, items, vb, nowF, next } = model;
  const [selected, setSelected] = useState<PrayerName | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  // Posisi matahari/bulan sebagai motion value: masuk dengan animasi menyusuri busur, lalu bergeser halus.
  const f = useMotionValue(ARC_START);
  const introStarted = useRef(false);
  useEffect(() => {
    if (nowF === null) return;
    if (reduceMotion) {
      f.jump(nowF);
      return;
    }
    if (!introStarted.current) {
      introStarted.current = true;
      animate(f, nowF, { duration: 1.8, ease: EASE_OUT });
      return;
    }
    if (f.isAnimating()) return;
    f.set(nowF);
  }, [nowF, reduceMotion, f]);
  useEffect(() => () => f.stop(), [f]);
  const markerX = useTransform(f, (v) => pointAt(v).x);
  const markerY = useTransform(f, (v) => pointAt(v).y);
  const pathLength = useTransform(f, progressOf);

  const weights: SkyWeights = now ? skyWeights(now.getTime(), today.times) : { night: 0, dawn: 0, day: 0, dusk: 0 };
  const dark = now !== null && isDarkSky(weights);
  const accent = dark ? ACCENT_GOLD : ACCENT_BRAND;
  const starOpacity = Math.min(1, weights.night + weights.dawn * 0.25 + weights.dusk * 0.35);

  const fmtAgo = (ms: number) => {
    const minutes = Math.max(0, Math.floor(ms / 60_000));
    if (minutes < 60) return t("arc.agoMinutes", { count: minutes });
    return t("arc.agoHours", { hours: Math.floor(minutes / 60), minutes: minutes % 60 });
  };

  const readout = buildReadout();
  function buildReadout(): Readout {
    const placeholder = t("countdown.placeholder");
    if (!now) return { label: t("today.next"), big: placeholder, bigIsText: false, adhan: null, iqamah: null, badge: null };
    const nowMs = now.getTime();
    const iqamahOf = (name: PrayerName) => (name === "sunrise" ? null : today.iqamah[name]);

    if (selected) {
      const adhan = today.times[selected];
      const iqamah = iqamahOf(selected);
      const base = { adhan: formatTime(adhan, locale), iqamah: iqamah ? formatTime(iqamah, locale) : null };
      const prayer = t(`names.${selected}`);
      if (adhan.getTime() > nowMs) {
        return { ...base, label: t("countdown.toward", { prayer }), big: formatCountdown(adhan.getTime() - nowMs), bigIsText: false, badge: null };
      }
      if (iqamah && iqamah.getTime() > nowMs) {
        return { ...base, label: t("arc.untilIqamah", { prayer }), big: formatCountdown(iqamah.getTime() - nowMs), bigIsText: false, badge: null };
      }
      const ongoing = next !== null && !next.isTomorrow && next.current === selected;
      return {
        ...base,
        label: ongoing ? `${prayer} · ${t("today.ongoing")}` : t("arc.passed", { prayer }),
        big: fmtAgo(nowMs - adhan.getTime()),
        bigIsText: true,
        badge: null,
      };
    }

    if (!next) return { label: t("today.next"), big: placeholder, bigIsText: false, adhan: null, iqamah: null, badge: null };
    const current = next.current;
    const currentIqamah = current && !next.isTomorrow ? iqamahOf(current) : null;
    const iqamahPending = current !== null && currentIqamah !== null && currentIqamah.getTime() > nowMs;

    if (idleReadout === "clock") {
      return {
        label: t("arc.nowJst"),
        big: formatTime(now, locale),
        bigIsText: false,
        adhan: null,
        iqamah: null,
        badge:
          iqamahPending && current && currentIqamah
            ? t("arc.iqamahIn", { prayer: t(`names.${current}`), time: formatCountdown(currentIqamah.getTime() - nowMs) })
            : t("arc.nextAt", { prayer: t(`names.${next.name}`), time: formatTime(next.time, locale) }),
      };
    }

    if (iqamahPending && current && currentIqamah) {
      return {
        label: t("arc.untilIqamah", { prayer: t(`names.${current}`) }),
        big: formatCountdown(currentIqamah.getTime() - nowMs),
        bigIsText: false,
        adhan: formatTime(today.times[current], locale),
        iqamah: formatTime(currentIqamah, locale),
        badge: null,
      };
    }
    return {
      label: next.isTomorrow
        ? `${t("countdown.toward", { prayer: t(`names.${next.name}`) })} · ${t("today.tomorrow")}`
        : t("countdown.toward", { prayer: t(`names.${next.name}`) }),
      big: formatCountdown(next.remainingMs),
      bigIsText: false,
      adhan: formatTime(next.time, locale),
      iqamah: next.iqamah ? formatTime(next.iqamah, locale) : null,
      badge: null,
    };
  }

  const announcement = selected
    ? selected === "sunrise"
      ? t("arc.announceSunrise", { prayer: t("names.sunrise"), time: formatTime(today.times.sunrise, locale) })
      : t("arc.announce", {
          prayer: t(`names.${selected}`),
          adhan: formatTime(today.times[selected], locale),
          iqamah: formatTime(today.iqamah[selected], locale),
        })
    : "";

  const focusAt = (index: number) => {
    const count = items.length;
    const i = (index + count) % count;
    setSelected(items[i].name);
    buttons.current[i]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") focusAt(index + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") focusAt(index - 1);
    else if (event.key === "Home") focusAt(0);
    else if (event.key === "End") focusAt(items.length - 1);
    else if (event.key === "Escape") setSelected(null);
    else return;
    event.preventDefault();
  };

  // Panel tengah: di dalam busur, sedikit melewati ufuk (area tengah bawah selalu kosong).
  const R = ARC.R;
  const readoutBox = toPercentBox({ left: -0.74 * R, right: 0.74 * R, top: -0.64 * R, bottom: 0.5 * R }, vb);
  const textTone = dark ? "text-hero-foreground" : "text-foreground";

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-3xl border transition-colors duration-700",
        dark ? "border-hero-foreground/10" : "border-border",
        "bg-surface",
        className,
      )}
    >
      {SKY_KEYS.map((key) => (
        <div
          key={key}
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-[1500ms] ease-out"
          style={{ background: SKY[key], opacity: weights[key] } satisfies CSSProperties}
        />
      ))}

      <div className={cn("relative flex h-full flex-col justify-center px-2 pt-3 pb-2 transition-colors duration-700 sm:px-4 sm:pt-4", textTone)}>
        <div className="@container relative mx-auto w-full max-w-[40rem]">
          <svg viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`} role="img" aria-label={t("arc.interactiveLabel")} className="block h-auto w-full">
            {/* Tanah di bawah ufuk */}
            <rect x={vb.x} y={0} width={vb.width} height={vb.y + vb.height} className="fill-hero" fillOpacity={dark ? 0.32 : 0.06} />
            {/* Bintang malam */}
            <g className="fill-current" opacity={starOpacity} style={{ transition: "opacity 1.5s ease-out" }} aria-hidden>
              {STARS.map(([sx, sy, r], i) => (
                <circle
                  key={i}
                  cx={sx * R}
                  cy={sy * R}
                  r={r}
                  className="motion-safe:animate-pulse-soft"
                  style={{ animationDelay: `${(i * 370) % 2400}ms` }}
                />
              ))}
            </g>
            <ArcScene
              model={model}
              accent={accent}
              selected={selected}
              progress={
                <g opacity={nowF === null ? 0 : 1}>
                  <motion.path d={arcPath()} fill="none" className={accent.stroke} strokeOpacity={0.22} strokeWidth={9} strokeLinecap="round" style={{ pathLength }} />
                  <motion.path d={arcPath()} fill="none" className={accent.stroke} strokeWidth={3.5} strokeLinecap="round" style={{ pathLength }} />
                </g>
              }
            />
            <motion.g style={{ x: markerX, y: markerY }} opacity={nowF === null ? 0 : 1}>
              <Celestial daytime={model.daytime} title={t("arc.now")} />
            </motion.g>
          </svg>

          {/* Tombol penanda: menutupi titik + label, tidak saling bertumpuk karena label bebas tabrakan. */}
          <div className="absolute inset-0" role="group" aria-label={t("arc.hint")}>
            {items.map((item, index) => {
              const marker: Box = { left: item.marker.x - 15, right: item.marker.x + 15, top: item.marker.y - 15, bottom: item.marker.y + 15 };
              const box = toPercentBox(padBox(labelBox(item), marker, 2), vb);
              const pressed = selected === item.name;
              return (
                <button
                  key={item.name}
                  ref={(el) => {
                    buttons.current[index] = el;
                  }}
                  type="button"
                  aria-pressed={pressed}
                  aria-label={t("arc.select", { prayer: item.title, time: item.timeText })}
                  onClick={() => setSelected(pressed ? null : item.name)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={cn(
                    "absolute cursor-pointer rounded-xl transition-colors duration-200",
                    pressed ? "bg-current/10" : "hover:bg-current/5",
                  )}
                  style={box}
                />
              );
            })}
          </div>

          {/* Panel tengah */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute flex flex-col items-center justify-center gap-[0.2em] rounded-[1.25rem] border px-2 text-center backdrop-blur-sm transition-colors duration-700",
              dark ? "border-hero-foreground/15 bg-hero/40" : "border-border/80 bg-card/75",
            )}
            style={readoutBox}
          >
            <p className="line-clamp-2 text-[clamp(0.625rem,2.9cqw,0.875rem)] leading-tight font-semibold opacity-80">{readout.label}</p>
            <p
              key={`${selected ?? "idle"}-${readout.bigIsText ? "t" : "c"}`}
              className={cn(
                "tabular font-bold leading-none motion-safe:animate-fade-up",
                readout.bigIsText ? "text-[clamp(0.875rem,4.4cqw,1.5rem)]" : "text-[clamp(1.125rem,6.8cqw,2.5rem)]",
              )}
            >
              {readout.big}
            </p>
            {(readout.adhan || readout.iqamah) && (
              <p className="tabular flex flex-wrap justify-center gap-x-2 text-[clamp(0.625rem,2.7cqw,0.8125rem)] leading-tight opacity-80">
                {readout.adhan && <span>{readout.iqamah ? t("countdown.adhanAt", { time: readout.adhan }) : readout.adhan}</span>}
                {readout.iqamah && <span>{t("countdown.iqamahAt", { time: readout.iqamah })}</span>}
              </p>
            )}
            {readout.badge && (
              <span
                className={cn(
                  "tabular mt-[0.15em] max-w-full truncate rounded-full px-2 py-0.5 text-[clamp(0.5625rem,2.5cqw,0.75rem)] font-semibold",
                  dark ? "bg-gold/25" : "bg-accent text-accent-foreground",
                )}
              >
                {readout.badge}
              </span>
            )}
          </div>
        </div>

        <div className="mt-1 flex min-h-8 items-center justify-center">
          {selected ? (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className={cn("cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors", dark ? "hover:bg-hero-foreground/10" : "hover:bg-accent")}
            >
              {t("arc.reset")}
            </button>
          ) : (
            <p className="text-xs opacity-70">{t("arc.hint")}</p>
          )}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
