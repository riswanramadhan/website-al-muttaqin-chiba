/**
 * Adapter Supabase untuk konten yang dikelola admin (PRD-02 / PRD-09).
 * Setiap fungsi mengembalikan null bila gagal, sehingga pemanggil jatuh ke data seed.
 * Skema tabel: supabase/migrations/0001_init.sql.
 */
import { createClient } from "@supabase/supabase-js";
import type { Announcement, JumuahSchedule, Lecture, MosqueEvent, NewsPost, PrayerConfig } from "@/lib/types";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

function client() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await fn();
  } catch (error) {
    console.warn("[supabase] fallback ke seed:", error);
    return null;
  }
}

type Row = Record<string, unknown>;

function rowsOrNull<T>(data: unknown, map: (row: Row) => T): T[] | null {
  if (!Array.isArray(data)) return null;
  return data.map((row) => map(row as Row));
}

export async function fetchPrayerConfig(): Promise<PrayerConfig | null> {
  return safe(async () => {
    const { data, error } = await client().from("prayer_config").select("*").eq("id", 1).maybeSingle();
    if (error || !data) throw error ?? new Error("empty");
    return data.config as PrayerConfig;
  });
}

export async function fetchJumuah(): Promise<JumuahSchedule[] | null> {
  return safe(async () => {
    const { data, error } = await client().from("jumuah_schedules").select("*").eq("published", true);
    if (error) throw error;
    return rowsOrNull(data, (r) => ({
      id: String(r.id),
      date: String(r.date),
      khatib: String(r.khatib ?? ""),
      imam: String(r.imam ?? ""),
      time: String(r.time ?? "12:30"),
      language: (r.language as JumuahSchedule["language"]) ?? "mixed",
      topic: r.topic as JumuahSchedule["topic"],
      note: r.note as JumuahSchedule["note"],
    }));
  });
}

export async function fetchAnnouncements(): Promise<Announcement[] | null> {
  return safe(async () => {
    const { data, error } = await client().from("announcements").select("*").eq("status", "published");
    if (error) throw error;
    return rowsOrNull(data, (r) => ({
      id: String(r.id),
      slug: String(r.slug),
      title: r.title as Announcement["title"],
      excerpt: r.excerpt as Announcement["excerpt"],
      body: r.body as Announcement["body"],
      category: (r.category as Announcement["category"]) ?? "general",
      publishedAt: String(r.published_at),
      pinned: Boolean(r.pinned),
      expiresAt: r.expires_at ? String(r.expires_at) : undefined,
    }));
  });
}

export async function fetchEvents(): Promise<MosqueEvent[] | null> {
  return safe(async () => {
    const { data, error } = await client().from("events").select("*").eq("status", "published");
    if (error) throw error;
    return rowsOrNull(data, (r) => ({
      id: String(r.id),
      slug: String(r.slug),
      title: r.title as MosqueEvent["title"],
      excerpt: r.excerpt as MosqueEvent["excerpt"],
      description: r.description as MosqueEvent["description"],
      category: (r.category as MosqueEvent["category"]) ?? "community",
      startsAt: String(r.starts_at),
      endsAt: String(r.ends_at),
      location: r.location as MosqueEvent["location"],
      speaker: r.speaker ? String(r.speaker) : undefined,
      languages: (r.languages as MosqueEvent["languages"]) ?? ["id"],
      coverImage: r.cover_image ? String(r.cover_image) : undefined,
      registration: (r.registration as MosqueEvent["registration"]) ?? { required: false },
      recurring: r.recurring as MosqueEvent["recurring"],
      featured: Boolean(r.featured),
    }));
  });
}

export async function fetchLectures(): Promise<Lecture[] | null> {
  return safe(async () => {
    const { data, error } = await client().from("lectures").select("*").eq("status", "published");
    if (error) throw error;
    return rowsOrNull(data, (r) => ({
      id: String(r.id),
      slug: String(r.slug),
      title: r.title as Lecture["title"],
      speaker: String(r.speaker ?? ""),
      youtubeId: String(r.youtube_id ?? ""),
      publishedAt: String(r.published_at),
      durationMinutes: Number(r.duration_minutes ?? 0),
      series: r.series as Lecture["series"],
      description: r.description as Lecture["description"],
      language: (r.language as Lecture["language"]) ?? "id",
      tags: (r.tags as string[]) ?? [],
    }));
  });
}

export async function fetchNews(): Promise<NewsPost[] | null> {
  return safe(async () => {
    const { data, error } = await client().from("news").select("*").eq("status", "published");
    if (error) throw error;
    return rowsOrNull(data, (r) => ({
      id: String(r.id),
      slug: String(r.slug),
      title: r.title as NewsPost["title"],
      excerpt: r.excerpt as NewsPost["excerpt"],
      body: r.body as NewsPost["body"],
      category: (r.category as NewsPost["category"]) ?? "news",
      publishedAt: String(r.published_at),
      author: String(r.author ?? ""),
      coverImage: r.cover_image ? String(r.cover_image) : undefined,
      tags: (r.tags as string[]) ?? [],
    }));
  });
}
