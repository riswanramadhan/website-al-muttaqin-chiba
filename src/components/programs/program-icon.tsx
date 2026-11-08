import { BookOpen, DoorOpen, HeartHandshake, Languages, Mic, School, Users, type LucideIcon } from "lucide-react";
import type { Program } from "@/lib/types";

/** Peta nama ikon di data program ke komponen lucide (semua nama diverifikasi di lucide-react 1.x). */
export const PROGRAM_ICONS: Record<Program["icon"], LucideIcon> = {
  "book-open": BookOpen,
  "heart-handshake": HeartHandshake,
  languages: Languages,
  "door-open": DoorOpen,
  school: School,
  mic: Mic,
  users: Users,
};

export function ProgramIcon({ icon, className }: { icon: Program["icon"]; className?: string }) {
  const Icon = PROGRAM_ICONS[icon] ?? BookOpen;
  return <Icon className={className} aria-hidden />;
}
