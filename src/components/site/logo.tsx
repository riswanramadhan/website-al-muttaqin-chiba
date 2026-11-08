import * as React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/** Logo masjid: ikon SVG inline + nama. Ganti ikon ketika logo resmi tersedia. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cn("size-9", className)} aria-hidden>
      <rect width="512" height="512" rx="112" fill="currentColor" className="text-primary" />
      <g fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
        <path d="M118 372 V236 Q118 118 256 100 Q394 118 394 236 V372" />
        <path d="M96 372 H416" />
        <path d="M256 100 V72" />
        <circle cx="256" cy="62" r="10" fill="#fff" stroke="none" />
        <path d="M196 372 V296 Q196 256 256 240 Q316 256 316 296 V372" />
      </g>
      <path d="M352 150 a44 44 0 1 0 0 88 a34 34 0 1 1 0 -88 z" fill="#fff" opacity="0.95" />
    </svg>
  );
}

export function Logo({ name, subtitle, tone = "default", href = "/", className }: { name: string; subtitle?: string; tone?: "default" | "inverse"; href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex min-w-0 shrink-0 items-center gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-tight">
        <span className={cn("text-sm font-bold whitespace-nowrap sm:text-base", tone === "inverse" && "text-hero-foreground")}>{name}</span>
        {subtitle && <span className={cn("text-xs", tone === "inverse" ? "text-hero-muted" : "text-muted-foreground")}>{subtitle}</span>}
      </span>
    </Link>
  );
}
