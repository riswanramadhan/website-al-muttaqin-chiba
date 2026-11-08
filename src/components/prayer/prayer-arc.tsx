"use client";

import { useLocale, useTranslations } from "next-intl";
import { PRAYER_NAMES, getPrayerTimesToday } from "@/lib/prayer";
import type { GeoPoint, Locale, PrayerConfig, PrayerName } from "@/lib/types";
import { formatTime } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { useNow } from "./use-now";

export type PrayerArcProps = {
  config: PrayerConfig;
  coordinates: GeoPoint;
  className?: string;
  tone?: "default" | "inverse";
};

const VIEW_W = 360;
const VIEW_H = 184;
const CX = 180;
const CY = 118;
const R = 104;
/** Seberapa jauh Subuh/Isya digambar di bawah ufuk (dalam pecahan setengah lingkaran). */
const TWILIGHT = 0.14;

/** Posisi 0..1 sepanjang busur siang (0 = syuruk, 1 = Magrib); di luar itu berarti di bawah ufuk. */
function fractionOf(t: number, times: Record<PrayerName, Date>): number {
  const fajr = times.fajr.getTime();
  const sunrise = times.sunrise.getTime();
  const maghrib = times.maghrib.getTime();
  const isha = times.isha.getTime();
  if (t < fajr) return -TWILIGHT * 1.4;
  if (t <= sunrise) return -TWILIGHT * (1 - (t - fajr) / Math.max(1, sunrise - fajr));
  if (t >= isha) return 1 + TWILIGHT * 1.4;
  if (t >= maghrib) return 1 + TWILIGHT * ((t - maghrib) / Math.max(1, isha - maghrib));
  return (t - sunrise) / Math.max(1, maghrib - sunrise);
}

function pointAt(f: number): { x: number; y: number } {
  const theta = Math.PI - f * Math.PI;
  return { x: CX + R * Math.cos(theta), y: CY - R * Math.sin(theta) };
}

function arcPath(from: number, to: number): string {
  const a = pointAt(from);
  const b = pointAt(to);
  const large = to - from > 1 ? 1 : 0;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/**
 * Busur hari dari syuruk ke Magrib (Subuh dan Isya sedikit di bawah ufuk) dengan penanda
 * enam waktu salat dan posisi matahari sekarang; diperbarui tiap menit di klien.
 */
export function PrayerArc({ config, coordinates, className, tone = "default" }: PrayerArcProps) {
  const t = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const now = useNow(60_000);
  const today = getPrayerTimesToday(config, coordinates, now ?? new Date());
  const start = -TWILIGHT;
  const end = 1 + TWILIGHT;
  const nowF = now ? Math.min(end, Math.max(start, fractionOf(now.getTime(), today.times))) : null;
  const sun = nowF === null ? null : pointAt(nowF);
  const inverse = tone === "inverse";

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={t("arc.label")}
      className={cn("h-auto w-full", inverse ? "text-hero-foreground" : "text-foreground", className)}
    >
      {/* Ufuk */}
      <line x1={16} y1={CY} x2={VIEW_W - 16} y2={CY} className="stroke-current" strokeOpacity={0.25} strokeDasharray="3 4" />
      {/* Busur penuh (redup) dan bagian yang sudah dilalui */}
      <path d={arcPath(start, end)} fill="none" className="stroke-current" strokeOpacity={0.2} strokeWidth={2} strokeLinecap="round" />
      {nowF !== null && nowF > start && (
        <path
          d={arcPath(start, nowF)}
          fill="none"
          className={inverse ? "stroke-hero-foreground" : "stroke-brand"}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}
      {/* Penanda waktu salat */}
      {PRAYER_NAMES.map((name) => {
        const f = fractionOf(today.times[name].getTime(), today.times);
        const p = pointAt(f);
        const below = f < 0 || f > 1;
        const lx = CX + (R + 22) * Math.cos(Math.PI - f * Math.PI);
        const ly = CY - (R + 22) * Math.sin(Math.PI - f * Math.PI);
        const passed = nowF !== null && nowF >= f;
        return (
          <g key={name}>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              className={cn(passed ? (inverse ? "fill-hero-foreground" : "fill-brand") : "fill-current")}
              fillOpacity={passed ? 1 : 0.35}
            />
            <text
              x={lx}
              y={ly + (below ? 8 : 0)}
              textAnchor="middle"
              className="fill-current"
              fontSize={10}
              fontWeight={600}
              opacity={passed ? 1 : 0.7}
            >
              <tspan x={lx} dy={below ? 4 : -4}>
                {t(`names.${name}`)}
              </tspan>
              <tspan x={lx} dy={11} fontWeight={500} className="tabular" opacity={0.75}>
                {formatTime(today.times[name], locale)}
              </tspan>
            </text>
          </g>
        );
      })}
      {/* Matahari sekarang */}
      {sun && (
        <g>
          <circle cx={sun.x} cy={sun.y} r={11} className={inverse ? "fill-hero-foreground" : "fill-brand"} fillOpacity={0.15} />
          <circle cx={sun.x} cy={sun.y} r={6} className={inverse ? "fill-hero-foreground" : "fill-brand"}>
            <title>{t("arc.now")}</title>
          </circle>
        </g>
      )}
    </svg>
  );
}
