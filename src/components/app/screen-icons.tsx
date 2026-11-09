import * as React from "react";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Clock,
  Compass,
  FingerprintPattern,
  HandHeart,
  Heart,
  Languages,
  LifeBuoy,
  Megaphone,
  Radar,
  Radio,
  Settings,
} from "lucide-react";
import type { Icon3DTone } from "@/components/ui/icon-3d";

/** Ikon untuk setiap layar App Jamaah (kunci sama dengan APP_SCREENS di nav-config). */
export const SCREEN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prayer: Clock,
  qibla: Compass,
  quran: BookOpen,
  dua: HandHeart,
  tasbih: FingerprintPattern,
  hijri: CalendarDays,
  live: Radio,
  agenda: CalendarCheck,
  info: Megaphone,
  donate: Heart,
  dictionary: Languages,
  radar: Radar,
  help: LifeBuoy,
  settings: Settings,
};

/**
 * Warna ubin 3D per layar (gaya aplikasi super). Disusun agar tetangga di grid 4 kolom
 * (beranda) dan 4 kolom menu tidak berwarna sama.
 */
export const SCREEN_TONES: Record<string, Icon3DTone> = {
  prayer: "maroon",
  qibla: "teal",
  quran: "emerald",
  dua: "rose",
  tasbih: "violet",
  hijri: "indigo",
  live: "coral",
  agenda: "sky",
  info: "amber",
  donate: "maroon",
  dictionary: "indigo",
  radar: "emerald",
  help: "sky",
  settings: "slate",
};

/** Ikon & warna tab navigasi bawah. */
export const TAB_TONES: Record<string, Icon3DTone> = {
  home: "maroon",
  prayer: "amber",
  quran: "emerald",
  donate: "rose",
  more: "indigo",
};
