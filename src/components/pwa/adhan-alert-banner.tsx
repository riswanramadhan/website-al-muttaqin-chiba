"use client";

import * as React from "react";
import { BellRing, Play, Square, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { dismissAlert, retryAlertSound, stopAlertSound, useAdhanAlert } from "./adhan-sound";

/** Batang ekualiser kecil sebagai tanda suara sedang berbunyi (diam saat reduced motion). */
function SoundBars() {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="w-1 rounded-full bg-hero-foreground/80 motion-safe:animate-pulse-soft" style={{ height: `${40 + ((i * 23) % 60)}%`, animationDelay: `${i * 0.18}s`, animationDuration: "0.9s" }} />
      ))}
    </span>
  );
}

/**
 * Banner selebar layar saat pengingat adzan berbunyi di App: judul, isi, tombol Stop / Putar
 * (bila browser memblokir autoplay) dan Tutup. Berada di bawah status bar iPhone (safe area).
 */
export function AdhanAlertBanner() {
  const t = useTranslations("settings");
  const alert = useAdhanAlert();

  React.useEffect(() => {
    if (alert.status === "idle" || alert.source !== "alert") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissAlert();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alert]);

  if (alert.status === "idle" || alert.source !== "alert") return null;
  const playing = alert.status === "playing";
  const blocked = alert.status === "blocked";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] safe-top pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
      <div className="mx-auto max-w-md px-3 pt-2">
        <section role="alertdialog" aria-labelledby="adhan-alert-title" aria-describedby="adhan-alert-body" className="hero-surface pointer-events-auto animate-fade-up rounded-3xl p-4 shadow-soft ring-1 ring-hero-foreground/10">
          <div className="flex items-start gap-3">
            <IconTile icon={BellRing} tone="amber" variant="solid" size="md" className={cn(playing && "motion-safe:animate-pulse-soft")} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-hero-foreground/70 uppercase">
                {t("alert.label")}
                {playing && <SoundBars />}
              </p>
              <h2 id="adhan-alert-title" className="mt-0.5 text-lg leading-tight font-bold">
                {alert.title}
              </h2>
              <p id="adhan-alert-body" className="mt-0.5 text-sm text-hero-foreground/80">
                {alert.body}
              </p>
            </div>
            <button type="button" onClick={dismissAlert} aria-label={t("alert.close")} className="-mt-1 -mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-hero-foreground/80 transition-colors hover:bg-hero-foreground/10">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {blocked && <p className="mt-3 rounded-xl bg-hero-foreground/10 px-3 py-2 text-sm text-hero-foreground/90">{t("alert.blocked")}</p>}
          <div className="mt-4 flex gap-2">
            {blocked ? (
              <Button variant="inverse" className="flex-1" onClick={retryAlertSound}>
                <Play aria-hidden />
                {t("alert.play")}
              </Button>
            ) : playing ? (
              <Button variant="inverse" className="flex-1" onClick={stopAlertSound}>
                <Square aria-hidden />
                {t("alert.stop")}
              </Button>
            ) : null}
            <Button variant="outlineInverse" className="flex-1" onClick={dismissAlert}>
              {t("alert.close")}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
