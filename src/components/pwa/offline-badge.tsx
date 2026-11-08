"use client";

import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { useOnline } from "./browser-state";

/**
 * Indikator offline (navigator.onLine + event online/offline).
 * `inline`: kartu kecil di dalam konten; `floating`: pil melayang di atas layar.
 */
export function OfflineBadge({ variant = "inline", className }: { variant?: "inline" | "floating"; className?: string }) {
  const t = useTranslations("pwa");
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 text-sm font-semibold",
        variant === "inline" && "rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-foreground",
        variant === "floating" &&
          "pointer-events-none fixed top-[calc(env(safe-area-inset-top)+0.5rem)] left-1/2 z-[60] -translate-x-1/2 rounded-full bg-secondary px-4 py-2 text-xs text-secondary-foreground shadow-soft animate-fade-up",
        className,
      )}
    >
      <WifiOff className={cn("shrink-0 stroke-[1.5]", variant === "inline" ? "size-5 text-warning" : "size-4")} aria-hidden />
      <span>{t("offlineNow")}</span>
    </div>
  );
}
