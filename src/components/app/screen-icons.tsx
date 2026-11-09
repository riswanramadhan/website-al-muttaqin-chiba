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
import type { IconTone } from "@/components/ui/icon-tile";

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
 * Warna aksen lembut per layar (ubin flat). Disusun agar tetangga di grid 4 kolom
 * (beranda) dan 4 kolom menu tidak berwarna sama, sehingga mudah dipindai.
 */
export const SCREEN_TONES: Record<string, IconTone> = {
  prayer: "brand",
  qibla: "teal",
  quran: "emerald",
  dua: "rose",
  tasbih: "violet",
  hijri: "indigo",
  live: "coral",
  agenda: "sky",
  info: "amber",
  donate: "brand",
  dictionary: "indigo",
  radar: "emerald",
  help: "sky",
  settings: "slate",
};
