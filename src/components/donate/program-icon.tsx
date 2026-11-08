import { BookOpen, Building, GraduationCap, Heart, Moon, Utensils, type LucideIcon } from "lucide-react";
import type { DonationProgram } from "@/lib/types";

/** Peta ikon program donasi (nama kanonik lucide 1.x). */
export const PROGRAM_ICONS: Record<DonationProgram["icon"], LucideIcon> = {
  building: Building,
  heart: Heart,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  utensils: Utensils,
  moon: Moon,
};
