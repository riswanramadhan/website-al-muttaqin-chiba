import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Icon3D, toneForIcon, type Icon3DTone } from "@/components/ui/icon-3d";

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
 * Ikon Lucide dalam ubin 3D (gaya aplikasi super). Warna dipilih otomatis dari nama ikon,
 * atau tetapkan `color`. `variant="flat"` mengembalikan lingkaran datar lama bila diperlukan.
 */
export function IconCircle({
  children,
  size = "md",
  shape = "circle",
  tone = "default",
  color,
  variant = "3d",
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  tone?: "default" | "brand" | "soft" | "inverse" | "dark";
  color?: Icon3DTone;
  variant?: "3d" | "flat";
  className?: string;
}) {
  if (variant === "3d") {
    const resolved = color ?? (tone === "brand" ? "maroon" : tone === "dark" ? "slate" : toneForIcon(children));
    return (
      <Icon3D tone={resolved} size={size} shape={shape === "circle" ? "circle" : "squircle"} className={className}>
        {children}
      </Icon3D>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center [&_svg]:stroke-[1.5]",
        size === "sm" && "size-9 [&_svg]:size-4",
        size === "md" && "size-12 [&_svg]:size-5",
        size === "lg" && "size-14 [&_svg]:size-6",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        tone === "default" && "bg-surface text-foreground",
        tone === "brand" && "bg-primary text-primary-foreground",
        tone === "soft" && "bg-accent text-accent-foreground",
        tone === "inverse" && "bg-hero-foreground/10 text-hero-foreground",
        tone === "dark" && "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {children}
    </span>
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
