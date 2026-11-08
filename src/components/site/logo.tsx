import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Logo resmi Masjid Al Muttaqin Chiba (kubah tiga, maroon). Aset dibuat dari `logo transparan.png`
 * oleh `scripts/generate-brand.mjs`. `tone="inverse"` memakai versi cream untuk latar gelap;
 * pada mode gelap situs, versi cream dipakai otomatis.
 */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  const box = cn("relative inline-block size-9 shrink-0", className);
  if (tone === "inverse") {
    return (
      <span className={box} aria-hidden>
        <Image src="/images/brand/logo-mark-light.png" alt="" fill unoptimized loading="eager" className="object-contain" />
      </span>
    );
  }
  return (
    <span className={box} aria-hidden>
      <Image src="/images/brand/logo-mark.png" alt="" fill unoptimized loading="eager" className="object-contain dark:hidden" />
      <Image src="/images/brand/logo-mark-light.png" alt="" fill unoptimized loading="eager" className="hidden object-contain dark:block" />
    </span>
  );
}

/** Logo lengkap (kubah + tulisan "Masjid Al Muttaqin Chiba / Mualaf & Islamic Cultural Center"). */
export function LogoFull({ className, alt }: { className?: string; alt: string }) {
  return (
    <span className={cn("relative block aspect-[1.12] w-40", className)}>
      <Image src="/images/brand/logo-full.png" alt={alt} fill sizes="240px" className="object-contain" />
    </span>
  );
}

export function Logo({ name, subtitle, tone = "default", href = "/", className }: { name: string; subtitle?: string; tone?: "default" | "inverse"; href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group flex min-w-0 shrink-0 items-center gap-2.5", className)}>
      <LogoMark tone={tone} className="size-10 transition-transform duration-300 group-hover:-translate-y-0.5 lg:size-11" />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn("text-sm font-bold whitespace-nowrap sm:text-base", tone === "inverse" ? "text-hero-foreground" : "text-brand")}>{name}</span>
        {subtitle && (
          <span className={cn("mt-1 text-[0.62rem] font-semibold tracking-[0.14em] uppercase sm:text-[0.66rem]", tone === "inverse" ? "text-hero-muted" : "text-muted-foreground")}>
            {subtitle}
          </span>
        )}
      </span>
    </Link>
  );
}
