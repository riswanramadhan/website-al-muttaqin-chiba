import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Pill kecil berbingkai di atas judul section (PRD §8). Opsional label tiga aksara:
 * <SectionTag tri={{ ja: "礼拝", ar: "صلاة" }}>Jadwal salat</SectionTag>
 */
export function SectionTag({
  children,
  tri,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tri?: { ja?: string; ar?: string };
  tone?: "default" | "inverse" | "brand";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        tone === "default" && "border-border bg-background text-foreground",
        tone === "inverse" && "border-hero-foreground/25 bg-hero-foreground/5 text-hero-foreground",
        tone === "brand" && "border-transparent bg-accent text-accent-foreground",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-brand" aria-hidden />
      <span>{children}</span>
      {tri && (
        <span className="hidden items-center gap-1.5 text-[0.7rem] font-medium normal-case tracking-normal opacity-70 sm:inline-flex" aria-hidden>
          {tri.ja && <span lang="ja">{tri.ja}</span>}
          {tri.ja && tri.ar && <span>·</span>}
          {tri.ar && (
            <span lang="ar" dir="rtl" className="font-arabic text-sm leading-none">
              {tri.ar}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
