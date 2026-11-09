import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { IconTile, toneForIcon, type IconTone } from "@/components/ui/icon-tile";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse-soft rounded-lg bg-muted", className)} {...props} />;
}

export function Separator({ className, orientation = "horizontal", ...props }: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
      {...props}
    />
  );
}

export function Progress({ value, max = 100, className, tone = "brand", label }: { value: number; max?: number; className?: string; tone?: "brand" | "success" | "inverse"; label?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full", tone === "inverse" ? "bg-hero-foreground/15" : "bg-muted", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone === "brand" && "bg-primary", tone === "success" && "bg-success", tone === "inverse" && "bg-hero-foreground")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/**
 * Ikon Lucide dalam ubin sederhana modern (flat, duotone lembut). Warna bawaan merek (maroon);
 * ikon bermakna warna (WhatsApp, peringatan) otomatis, atau tetapkan `color`.
 * `tone`: soft/default = latar tipis, brand = latar maroon penuh, inverse = untuk permukaan gelap.
 */
export function IconCircle({
  children,
  size = "md",
  shape = "circle",
  tone = "default",
  color,
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  tone?: "default" | "brand" | "soft" | "inverse" | "dark";
  color?: IconTone;
  className?: string;
}) {
  const resolved = color ?? (tone === "dark" ? "slate" : toneForIcon(children));
  const variant = tone === "brand" ? "solid" : tone === "inverse" ? "inverse" : "soft";
  return (
    <IconTile tone={resolved} variant={variant} size={size} shape={shape === "circle" ? "circle" : "squircle"} className={className}>
      {children}
    </IconTile>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("card-muted flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      {icon && <IconCircle tone="default">{icon}</IconCircle>}
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Daftar bernomor besar (01, 02, ...) untuk layanan, seperti referensi UI. */
export function NumberedItem({ index, title, description, icon, href, className }: { index: number; title: string; description: string; icon?: React.ReactNode; href?: string; className?: string }) {
  const content = (
    <>
      <span className="text-brand text-sm font-bold tabular">{String(index).padStart(2, "0")}</span>
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {icon && <IconCircle size="sm" tone="soft">{icon}</IconCircle>}
        <div className="min-w-0">
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </>
  );
  const base = "flex gap-5 border-b border-border py-5 last:border-b-0";
  if (href) {
    return (
      <a href={href} className={cn(base, "group rounded-lg transition-colors hover:bg-surface/60", className)}>
        {content}
      </a>
    );
  }
  return <div className={cn(base, className)}>{content}</div>;
}
