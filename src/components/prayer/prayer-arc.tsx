"use client";

import { useTranslations } from "next-intl";
import type { GeoPoint, PrayerConfig } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { arcPath, pointAt, progressOf } from "./arc-geometry";
import { ACCENT_BRAND, ACCENT_GOLD, ArcScene, Celestial } from "./arc-parts";
import { PrayerArcInteractive } from "./prayer-arc-interactive";
import { useArcModel } from "./use-arc-model";
import { useNow } from "./use-now";

export type PrayerArcProps = {
  config: PrayerConfig;
  coordinates: GeoPoint;
  className?: string;
  tone?: "default" | "inverse";
  /**
   * Versi interaktif: langit mengikuti waktu (fajar/siang/senja/malam), matahari/bulan bergerak halus,
   * penanda bisa diketuk/difokus dan menampilkan azan, iqamah, serta hitung mundur di tengah busur.
   */
  interactive?: boolean;
  /**
   * Isi panel tengah saat tidak ada salat yang dipilih (hanya versi interaktif):
   * "next" = hitung mundur salat/iqamah berikutnya, "clock" = jam sekarang (JST) + salat berikutnya.
   */
  idleReadout?: "next" | "clock";
};

/**
 * Busur hari dari Subuh (di bawah ufuk kiri) ke Isya (di bawah ufuk kanan) dengan penanda enam
 * waktu salat, label yang tidak pernah bertumpuk, dan posisi matahari/bulan sekarang.
 */
export function PrayerArc({ interactive = false, idleReadout = "next", ...props }: PrayerArcProps) {
  if (interactive) return <PrayerArcInteractive {...props} idleReadout={idleReadout} />;
  return <PrayerArcStatic {...props} />;
}

function PrayerArcStatic({ config, coordinates, className, tone = "default" }: Omit<PrayerArcProps, "interactive" | "idleReadout">) {
  const t = useTranslations("prayer");
  const now = useNow(60_000);
  const model = useArcModel(config, coordinates, now);
  const inverse = tone === "inverse";
  const accent = inverse ? ACCENT_GOLD : ACCENT_BRAND;
  const { vb, nowF } = model;
  const marker = nowF === null ? null : pointAt(nowF);

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
      role="img"
      aria-label={t("arc.label")}
      className={cn("block h-auto w-full", inverse ? "text-hero-foreground" : "text-foreground", className)}
    >
      <ArcScene
        model={model}
        accent={accent}
        progress={
          nowF !== null && (
            <path
              d={arcPath()}
              fill="none"
              className={accent.stroke}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${progressOf(nowF).toFixed(4)} 1`}
            />
          )
        }
      />
      {marker && (
        <g transform={`translate(${marker.x.toFixed(2)} ${marker.y.toFixed(2)})`}>
          <Celestial daytime={model.daytime} title={t("arc.now")} />
        </g>
      )}
    </svg>
  );
}
