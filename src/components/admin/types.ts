/**
 * Tipe baris panel admin (PRD-09). Berbeda dari tipe publik di src/lib/types karena
 * admin juga melihat draf/arsip dan kolom audit. Semua waktu ISO UTC.
 */
import type {
  AnnouncementCategory,
  EventCategory,
  JumuahSchedule,
  Lecture,
  LocalizedBlocks,
  LocalizedText,
  MosqueEvent,
  NewsCategory,
  PrayerConfig,
  Locale,
} from "@/lib/types";
import type { AdminRole } from "@/lib/supabase/admin";

export type ContentStatus = "draft" | "published" | "archived";
export type ContentEntity = "announcements" | "events" | "jumuah" | "lectures" | "news";

export type AnnouncementRecord = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedBlocks;
  category: AnnouncementCategory;
  pinned: boolean;
  status: ContentStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  updatedAt: string | null;
};

export type EventRecord = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  description: LocalizedBlocks;
  category: EventCategory;
  startsAt: string;
  endsAt: string;
  location: LocalizedText;
  speaker: string;
  languages: Locale[];
  coverImage: string;
  registration: MosqueEvent["registration"];
  recurring: LocalizedText | null;
  featured: boolean;
  status: ContentStatus;
  updatedAt: string | null;
};

export type JumuahRecord = {
  id: string;
  date: string;
  khatib: string;
  imam: string;
  time: string;
  language: JumuahSchedule["language"];
  topic: LocalizedText | null;
  note: LocalizedText | null;
  published: boolean;
  updatedAt: string | null;
};

export type LectureRecord = {
  id: string;
  slug: string;
  title: LocalizedText;
  speaker: string;
  youtubeId: string;
  publishedAt: string | null;
  durationMinutes: number;
  series: LocalizedText | null;
  description: LocalizedText;
  language: Lecture["language"];
  tags: string[];
  status: ContentStatus;
  updatedAt: string | null;
};

export type NewsRecord = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedBlocks;
  category: NewsCategory;
  author: string;
  coverImage: string;
  tags: string[];
  status: ContentStatus;
  publishedAt: string | null;
  updatedAt: string | null;
};

export type DonationConfirmationRecord = {
  id: string;
  programSlug: string;
  accountId: string;
  currency: "JPY" | "IDR";
  amount: number;
  uniqueCode: number | null;
  transferredAt: string;
  donorName: string;
  donorContact: string;
  onBehalfOf: string;
  message: string;
  status: "pending" | "matched" | "rejected";
  adminNote: string;
  matchedBy: string | null;
  matchedAt: string | null;
  locale: string;
  createdAt: string;
};

export type RecurringDonorRecord = {
  id: string;
  fullName: string;
  contact: string;
  monthlyAmount: number;
  currency: string;
  paymentDay: number;
  method: string;
  publishName: boolean;
  active: boolean;
  locale: string;
  createdAt: string;
};

export type InboxKind = "events" | "programs" | "bookings" | "suggestions" | "contact";

/** Satu baris kotak masuk yang sudah diratakan agar DataTable/CSV seragam. */
export type InboxRecord = {
  id: string;
  kind: InboxKind;
  name: string;
  contact: string;
  /** Agenda / program / ruangan / jenis saran / subjek. */
  subject: string;
  message: string;
  /** Jumlah peserta / hadir, atau kosong. */
  count: number | null;
  /** Rentang waktu peminjaman (ISO) atau kosong. */
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  locale: string;
  createdAt: string;
};

export const INBOX_STATUSES: Record<InboxKind, string[]> = {
  events: ["registered", "waitlist", "cancelled", "attended"],
  programs: ["new", "accepted", "waitlist", "rejected"],
  bookings: ["requested", "approved", "rejected", "cancelled"],
  suggestions: ["new", "in_progress", "done", "spam"],
  contact: ["new", "read", "replied", "done"],
};

export const INBOX_TABLES: Record<InboxKind, string> = {
  events: "event_registrations",
  programs: "program_registrations",
  bookings: "room_bookings",
  suggestions: "suggestions",
  contact: "contact_messages",
};

export type AdminRecord = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  uiLocale: string;
  active: boolean;
  createdAt: string;
};

export type ActivityRecord = {
  id: string;
  adminId: string | null;
  adminName: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
};

export type PushStats = { total: number; byLocale: Record<Locale, number> };

export type DashboardStats = {
  announcements: number;
  events: number;
  donationsPending: number;
  registrations: number;
  suggestions: number;
  push: number;
};

export type PrayerConfigRecord = PrayerConfig;
