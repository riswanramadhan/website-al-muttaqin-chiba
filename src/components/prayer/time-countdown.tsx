"use client";

import type { ReactNode } from "react";
import { formatCountdown } from "@/lib/prayer";
import { cn } from "@/lib/utils/cn";
import { useNow } from "./use-now";

export type TimeCountdownProps = {
  /** Instant target (ISO UTC). */
  targetIso: string;
  label: string;
  /** Ditampilkan saat target sudah lewat (atau setelah jendela `activeMinutes`). */
  doneLabel: string;
  /** Opsional: teks selama `activeMinutes` menit setelah target (mis. "khutbah sedang berlangsung"). */
  activeLabel?: string;
  activeMinutes?: number;
  tone?: "default" | "inverse";
  size?: "md" | "lg";
  className?: string;
};

/** Hitung mundur umum ke satu instant (khutbah Jumat, berbuka), diperbarui tiap detik di klien. */
export function TimeCountdown({ targetIso, label, doneLabel, activeLabel, activeMinutes = 0, tone = "default", size = "md", className }: TimeCountdownProps) {
  const now = useNow(1000);
  const target = new Date(targetIso).getTime();
  const inverse = tone === "inverse";
  const remaining = now ? target - now.getTime() : null;
  const activeUntil = target + activeMinutes * 60_000;

  let body: ReactNode;
  if (remaining === null) {
    body = (
      <p className={cn("tabular font-bold leading-none", size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl")} aria-hidden>
        --:--
      </p>
    );
  } else if (remaining > 0) {
    body = (
      <p className={cn("tabular font-bold leading-none", size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl")}>{formatCountdown(remaining)}</p>
    );
  } else if (activeLabel && now && now.getTime() < activeUntil) {
    body = <p className="text-lg font-semibold">{activeLabel}</p>;
  } else {
    body = <p className="text-base font-semibold">{doneLabel}</p>;
  }

  return (
    <div className={cn("rounded-2xl p-4", inverse ? "border border-hero-foreground/15 bg-hero-foreground/5" : "card-muted", className)}>
      <p className={cn("text-xs font-semibold tracking-wide uppercase", inverse ? "text-hero-muted" : "text-muted-foreground")}>{label}</p>
      <div className="mt-1">{body}</div>
    </div>
  );
}
