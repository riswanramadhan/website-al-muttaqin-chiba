import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Ikon 3D gaya aplikasi super (ubin membulat bergradasi, kilap atas, bayangan berwarna,
 * glyph putih timbul). Glyph tetap dari lucide-react; efek 3D dari utilitas `icon-3d`
 * dan token `--i3d-*` di globals.css (tanpa hex di komponen).
 */
export const ICON_3D_TONES = ["maroon", "rose", "coral", "amber", "emerald", "teal", "sky", "indigo", "violet", "slate"] as const;
export type Icon3DTone = (typeof ICON_3D_TONES)[number];

/** Warna semantik untuk ikon yang sering dipakai; ikon lain mendapat warna tetap dari hash namanya. */
const SEMANTIC: Record<string, Icon3DTone> = {
  Clock: "maroon",
  Clock3: "maroon",
  AlarmClock: "maroon",
  CalendarClock: "maroon",
  Compass: "teal",
  BookOpen: "emerald",
  BookOpenText: "emerald",
  HandHeart: "rose",
  Heart: "rose",
  HeartHandshake: "rose",
  HandCoins: "amber",
  Coins: "amber",
  Wallet: "amber",
  Landmark: "amber",
  CalendarDays: "indigo",
  CalendarCheck: "indigo",
  Radio: "coral",
  Megaphone: "coral",
  Languages: "sky",
  Radar: "emerald",
  LifeBuoy: "sky",
  Settings: "slate",
  MapPin: "coral",
  Mail: "sky",
  Phone: "emerald",
  Users: "violet",
  UsersRound: "violet",
  GraduationCap: "indigo",
  Baby: "rose",
  Utensils: "coral",
  UtensilsCrossed: "coral",
  ShieldCheck: "emerald",
  BadgeCheck: "emerald",
  CircleCheck: "emerald",
  TriangleAlert: "amber",
  CircleAlert: "amber",
  Bell: "amber",
  BellRing: "amber",
  Quote: "violet",
  Sparkles: "amber",
  Video: "coral",
  Youtube: "coral",
  Play: "coral",
  Moon: "indigo",
  Sun: "amber",
  Sunrise: "amber",
  Sunset: "coral",
  FingerprintPattern: "violet",
  House: "maroon",
  Building2: "maroon",
  WhatsApp: "emerald",
  WhatsAppIcon: "emerald",
};

function hashTone(name: string): Icon3DTone {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return ICON_3D_TONES[Math.abs(h) % ICON_3D_TONES.length];
}

/** Tentukan warna ikon dari nama komponen lucide (displayName). */
export function toneForIcon(node: React.ReactNode): Icon3DTone {
  if (!React.isValidElement(node)) return "maroon";
  const type = node.type as { displayName?: string; name?: string } | string;
  const name = typeof type === "string" ? "" : (type.displayName ?? type.name ?? "");
  if (!name) return "maroon";
  return SEMANTIC[name] ?? hashTone(name);
}

const SIZES = {
  xs: "size-8 [&_svg]:size-4",
  sm: "size-9 [&_svg]:size-[1.15rem]",
  md: "size-12 [&_svg]:size-6",
  lg: "size-14 [&_svg]:size-7",
  xl: "size-16 [&_svg]:size-8",
} as const;

export type Icon3DSize = keyof typeof SIZES;

/** Ubin 3D untuk satu ikon. Kirim `icon` (komponen) atau `children` (elemen ikon). */
export function Icon3D({
  icon: Icon,
  children,
  tone,
  size = "md",
  shape = "squircle",
  className,
}: {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  tone?: Icon3DTone;
  size?: Icon3DSize;
  shape?: "squircle" | "circle";
  className?: string;
}) {
  const content = Icon ? <Icon aria-hidden /> : children;
  const resolved = tone ?? toneForIcon(Icon ? <Icon /> : children);
  return (
    <span
      data-tone={resolved}
      className={cn("icon-3d", SIZES[size], shape === "circle" ? "rounded-full" : "rounded-[32%]", className)}
      aria-hidden
    >
      {content}
    </span>
  );
}
