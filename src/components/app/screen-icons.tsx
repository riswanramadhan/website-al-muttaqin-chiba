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
