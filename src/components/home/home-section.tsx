import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Pembungkus section beranda: padding seragam `py-16 lg:py-24`, kontainer situs, dan latar.
 * tone="surface" untuk latar abu muda, tone="dark" untuk latar hitam berpola (hero-surface).
 */
export function HomeSection({
  id,
  tone = "default",
  label,
  className,
  children,
}: {
  id?: string;
  tone?: "default" | "surface" | "dark";
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn("scroll-mt-20", tone === "surface" && "bg-surface", tone === "dark" && "hero-surface", className)}
    >
      <div className="container-site relative py-16 lg:py-24">{children}</div>
    </section>
  );
}
