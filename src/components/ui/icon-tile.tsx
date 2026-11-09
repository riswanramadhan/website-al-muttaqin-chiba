import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Ikon sederhana modern (flat, tanpa efek 3D): ubin squircle berlatar tipis sewarna, garis ikon
 * 1,75 dengan isian lembut (duotone). Glyph dari lucide-react; tampilan dari utilitas `icon-tile`
 * dan token `--tone-*` di globals.css (tanpa hex di komponen).
 *
 * - `variant="soft"` (bawaan): latar tipis, ikon berwarna; otomatis "kaca" di permukaan gelap.
 * - `variant="solid"`: latar penuh, ikon putih (untuk aksen/tab aktif).
 * - `variant="inverse"`: untuk permukaan gelap secara eksplisit.
 */
export const ICON_TONES = ["brand", "rose", "coral", "amber", "emerald", "teal", "sky", "indigo", "violet", "slate"] as const;
export type IconTone = (typeof ICON_TONES)[number];
export type IconVariant = "soft" | "solid" | "inverse";

/** Hanya ikon yang maknanya terikat warna; selebihnya memakai warna merek (maroon). */
const SEMANTIC: Record<string, IconTone> = {
  WhatsApp: "emerald",
  WhatsAppIcon: "emerald",
  TriangleAlert: "amber",
  CircleAlert: "amber",
  CircleCheck: "emerald",
  BadgeCheck: "emerald",
};

/** Warna ikon dari nama komponen lucide (displayName); bawaan warna merek. */
export function toneForIcon(node: React.ReactNode): IconTone {
  if (!React.isValidElement(node)) return "brand";
  const type = node.type as { displayName?: string; name?: string } | string;
  const name = typeof type === "string" ? "" : (type.displayName ?? type.name ?? "");
  return SEMANTIC[name] ?? "brand";
}

const SIZES = {
  xs: "size-8 [&_svg]:size-4",
  sm: "size-9 [&_svg]:size-[1.1rem]",
  md: "size-12 [&_svg]:size-[1.4rem]",
  lg: "size-14 [&_svg]:size-[1.65rem]",
  xl: "size-16 [&_svg]:size-8",
} as const;

export type IconTileSize = keyof typeof SIZES;

/** Satu ikon dalam ubin. Kirim `icon` (komponen) atau `children` (elemen ikon). */
export function IconTile({
  icon: Icon,
  children,
  tone,
  variant = "soft",
  size = "md",
  shape = "squircle",
  className,
}: {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  tone?: IconTone;
  variant?: IconVariant;
  size?: IconTileSize;
  shape?: "squircle" | "circle";
  className?: string;
}) {
  const content = Icon ? <Icon aria-hidden /> : children;
  const resolved = tone ?? toneForIcon(Icon ? <Icon /> : children);
  return (
    <span
      data-tone={resolved}
      data-variant={variant}
      className={cn("icon-tile", SIZES[size], shape === "circle" ? "rounded-full" : "rounded-[30%]", className)}
      aria-hidden
    >
      {content}
    </span>
  );
}
