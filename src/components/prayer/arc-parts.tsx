"use client";

import { useId, type ReactNode } from "react";
import type { PrayerName } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { ARC, arcPath } from "./arc-geometry";
import type { ArcModel } from "./use-arc-model";

export type ArcAccent = { stroke: string; fill: string };

export const ACCENT_BRAND: ArcAccent = { stroke: "stroke-brand", fill: "fill-brand" };
export const ACCENT_GOLD: ArcAccent = { stroke: "stroke-gold", fill: "fill-gold" };

type ArcSceneProps = {
  model: ArcModel;
  accent: ArcAccent;
  selected?: PrayerName | null;
  /** Lapisan progres (statis atau Motion) digambar di atas lintasan, di bawah penanda. */
  progress?: ReactNode;
};

/**
 * Ufuk, lintasan busur, penanda enam waktu, dan label dua baris (nama + jam).
 * Posisi label sudah bebas tabrakan dari `layoutLabels`.
 */
export function ArcScene({ model, accent, selected = null, progress }: ArcSceneProps) {
  const { vb, items, nowF, nextToday } = model;
  const { R, NAME_SIZE, TIME_SIZE } = ARC;
  return (
    <>
      <line
        x1={vb.x + ARC.PAD}
        y1={0}
        x2={vb.x + vb.width - ARC.PAD}
        y2={0}
        className="stroke-current"
        strokeOpacity={0.28}
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
      <path d={arcPath()} fill="none" className="stroke-current" strokeOpacity={0.16} strokeWidth={2.5} strokeLinecap="round" />
      <path d={arcPath(-ARC.TWILIGHT, 1 + ARC.TWILIGHT, R)} fill="none" className="stroke-current" strokeOpacity={0.12} strokeWidth={2.5} strokeLinecap="round" />
      {progress}
      {items.map((item) => {
        const passed = nowF !== null && nowF >= item.f;
        const isNext = nextToday === item.name;
        const isSelected = selected === item.name;
        const baseline = item.top + 12;
        return (
          <g key={item.name}>
            {isNext && (
              <>
                <circle cx={item.marker.x} cy={item.marker.y} r={9} fill="none" className={accent.stroke} strokeOpacity={0.45} strokeWidth={1.5} />
                <circle
                  cx={item.marker.x}
                  cy={item.marker.y}
                  r={6}
                  fill="none"
                  className={cn(accent.stroke, "origin-center [transform-box:fill-box] motion-safe:animate-ping")}
                  strokeWidth={2}
                />
              </>
            )}
            {isSelected && <circle cx={item.marker.x} cy={item.marker.y} r={12} fill="none" className="stroke-current" strokeWidth={1.5} />}
            <circle
              cx={item.marker.x}
              cy={item.marker.y}
              r={isSelected ? 6 : 4.5}
              className={cn(passed || isNext ? accent.fill : "fill-current", "transition-[r] duration-300")}
              fillOpacity={passed || isNext ? 1 : 0.4}
            />
            <text
              x={item.x}
              textAnchor={item.anchor}
              className={cn(isNext ? accent.fill : "fill-current", "transition-opacity duration-300")}
              opacity={isNext || isSelected ? 1 : passed ? 0.7 : 0.92}
            >
              <tspan x={item.x} y={baseline} fontSize={NAME_SIZE} fontWeight={isNext || isSelected ? 700 : 600}>
                {item.title}
              </tspan>
              <tspan x={item.x} y={baseline + 15} fontSize={TIME_SIZE} fontWeight={500} className="tabular" opacity={0.8}>
                {item.timeText}
              </tspan>
            </text>
          </g>
        );
      })}
    </>
  );
}

/** Matahari (emas, bersinar) atau bulan sabit, digambar di titik asal; posisikan dengan transform pemanggil. */
export function Celestial({ daytime, title }: { daytime: boolean; title?: string }) {
  const maskId = `moon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (daytime) {
    return (
      <g>
        {title && <title>{title}</title>}
        <circle r={16} className="fill-gold" fillOpacity={0.16} />
        <circle r={11} className="fill-gold" fillOpacity={0.28} />
        <g className="stroke-gold" strokeWidth={1.6} strokeLinecap="round">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={(9.5 * Math.cos(a)).toFixed(2)}
                y1={(9.5 * Math.sin(a)).toFixed(2)}
                x2={(12.5 * Math.cos(a)).toFixed(2)}
                y2={(12.5 * Math.sin(a)).toFixed(2)}
              />
            );
          })}
        </g>
        <circle r={6.5} className="fill-gold" />
      </g>
    );
  }
  return (
    <g>
      {title && <title>{title}</title>}
      <defs>
        <mask id={maskId}>
          <circle r={8} fill="white" />
          <circle cx={3.6} cy={-2.6} r={6.6} fill="black" />
        </mask>
      </defs>
      <circle r={15} className="fill-current" fillOpacity={0.1} />
      <circle r={8} className="fill-current" mask={`url(#${maskId})`} />
    </g>
  );
}
