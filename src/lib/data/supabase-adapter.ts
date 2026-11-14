/**
 * Adapter Supabase untuk konten yang dikelola admin (PRD-02 / PRD-09).
 * Setiap fungsi mengembalikan null bila gagal, sehingga pemanggil jatuh ke data seed.
 * Skema tabel: supabase/migrations/0001_init.sql dan 0003_cms.sql.
 *
 * Hemat kuota (Vercel Hobby + Supabase Free): semua pembacaan publik disimpan di Data Cache
 * Next.js dengan tag `cms`. Database hanya disentuh saat cache kosong, setelah admin menyimpan
 * (tag dibatalkan lewat `revalidatePublic`), atau paling lama tiap CMS_REVALIDATE_SECONDS.
 * Kegagalan query dilempar di dalam fungsi ter-cache agar hasil gagal tidak ikut tersimpan.
 */
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Announcement, JumuahSchedule, Lecture, MosqueEvent, NewsPost, PrayerConfig } from "@/lib/types";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/** Tag Data Cache untuk seluruh konten yang berasal dari Supabase. */
export const CMS_TAG = "cms";
/** Tag tambahan khusus agenda: pendaftaran hanya menyegarkan data agenda, bukan seluruh situs. */
export const EVENTS_TAG = "cms:events";
/** Batas umur cache: perubahan langsung di dasbor Supabase tampil paling lambat setelah ini. */
export const CMS_REVALIDATE_SECONDS = 3600;

function client() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await fn();
  } catch (error) {
    console.warn("[supabase] fallback ke seed:", error instanceof Error ? error.message : error);
    return null;
  }
}

/** Bungkus query dengan Data Cache; argumen ikut menjadi kunci cache. */
function cached<Args extends unknown[], T>(name: string, fn: (...args: Args) => Promise<T>, extraTags: string[] = []): (...args: Args) => Promise<T | null> {
  const run = unstable_cache(fn, [CMS_TAG, name], { tags: [CMS_TAG, ...extraTags], revalidate: CMS_REVALIDATE_SECONDS });
  return (...args: Args) => safe(() => run(...args));
}

type Row = Record<string, unknown>;

/** Normalkan timestamptz PostgREST ("...+00:00") ke ISO UTC ("...Z") agar perbandingan string konsisten. */
function iso(value: unknown): string {
  const ms = Date.parse(String(value));
  return Number.isNaN(ms) ? String(value) : new Date(ms).toISOString();
}

function mapRows<T>(data: unknown, map: (row: Row) => T): T[] {
  if (!Array.isArray(data)) throw new Error("respons tidak berbentuk daftar");
  return data.map((row) => map(row as Row));
}

/** Konfigurasi salat; `{ config: null }` bila baris belum ada (tetap di-cache agar tidak query berulang). */
export const fetchPrayerConfig = cached("prayer-config", async (): Promise<{ config: PrayerConfig | null }> => {
  const { data, error } = await client().from("prayer_config").select("config").eq("id", 1).maybeSingle();
  if (error) throw error;
  return { config: data ? ((data.config ?? null) as PrayerConfig | null) : null };
});

export const fetchJumuah = cached("jumuah", async (): Promise<JumuahSchedule[]> => {
  const { data, error } = await client().from("jumuah_schedules").select("*").eq("published", true);
  if (error) throw error;
  return mapRows(data, (r) => ({
    id: String(r.id),
    date: String(r.date),
    khatib: String(r.khatib ?? ""),
    imam: String(r.imam ?? ""),
    time: String(r.time ?? "12:30"),
    language: (r.language as JumuahSchedule["language"]) ?? "mixed",
    topic: (r.topic as JumuahSchedule["topic"]) ?? undefined,
    note: (r.note as JumuahSchedule["note"]) ?? undefined,
  }));
});

export const fetchAnnouncements = cached("announcements", async (): Promise<Announcement[]> => {
  const { data, error } = await client().from("announcements").select("*").eq("status", "published");
  if (error) throw error;
  return mapRows(data, (r) => ({
    id: String(r.id),
    slug: String(r.slug),
    title: r.title as Announcement["title"],
    excerpt: r.excerpt as Announcement["excerpt"],
    body: r.body as Announcement["body"],
    category: (r.category as Announcement["category"]) ?? "general",
    publishedAt: iso(r.published_at ?? r.created_at),
    pinned: Boolean(r.pinned),
    expiresAt: r.expires_at ? iso(r.expires_at) : undefined,
  }));
});

export const fetchEvents = cached("events", async (): Promise<MosqueEvent[]> => {
  const { data, error } = await client().from("events").select("*").eq("status", "published");
  if (error) throw error;
  return mapRows(data, (r) => ({
    id: String(r.id),
    slug: String(r.slug),
    title: r.title as MosqueEvent["title"],
    excerpt: r.excerpt as MosqueEvent["excerpt"],
    description: r.description as MosqueEvent["description"],
    category: (r.category as MosqueEvent["category"]) ?? "community",
    startsAt: iso(r.starts_at),
    endsAt: iso(r.ends_at),
    location: r.location as MosqueEvent["location"],
    speaker: r.speaker ? String(r.speaker) : undefined,
    languages: (r.languages as MosqueEvent["languages"]) ?? ["id"],
    coverImage: r.cover_image ? String(r.cover_image) : undefined,
    registration: (r.registration as MosqueEvent["registration"]) ?? { required: false },
    recurring: (r.recurring as MosqueEvent["recurring"]) ?? undefined,
    featured: Boolean(r.featured),
  }));
}, [EVENTS_TAG]);

export const fetchLectures = cached("lectures", async (): Promise<Lecture[]> => {
  const { data, error } = await client().from("lectures").select("*").eq("status", "published");
  if (error) throw error;
  return mapRows(data, (r) => ({
    id: String(r.id),
    slug: String(r.slug),
    title: r.title as Lecture["title"],
    speaker: String(r.speaker ?? ""),
    youtubeId: String(r.youtube_id ?? ""),
    publishedAt: iso(r.published_at ?? r.created_at),
    durationMinutes: Number(r.duration_minutes ?? 0),
    series: (r.series as Lecture["series"]) ?? undefined,
    description: r.description as Lecture["description"],
    language: (r.language as Lecture["language"]) ?? "id",
    tags: (r.tags as string[]) ?? [],
  }));
});

export const fetchNews = cached("news", async (): Promise<NewsPost[]> => {
  const { data, error } = await client().from("news").select("*").eq("status", "published");
  if (error) throw error;
  return mapRows(data, (r) => ({
    id: String(r.id),
    slug: String(r.slug),
    title: r.title as NewsPost["title"],
    excerpt: r.excerpt as NewsPost["excerpt"],
    body: r.body as NewsPost["body"],
    category: (r.category as NewsPost["category"]) ?? "news",
    publishedAt: iso(r.published_at ?? r.created_at),
    author: String(r.author ?? ""),
    coverImage: r.cover_image ? String(r.cover_image) : undefined,
    tags: (r.tags as string[]) ?? [],
  }));
});

/** Satu item koleksi CMS (tabel content_items) yang sudah diterbitkan. */
export type CollectionRow = { key: string; data: Record<string, unknown> };

/** Item terbit sebuah koleksi, urut sort_order lalu waktu dibuat. Daftar kosong berarti memang kosong. */
export const fetchCollection = cached("collection", async (collection: string): Promise<CollectionRow[]> => {
  const { data, error } = await client()
    .from("content_items")
    .select("item_key, data")
    .eq("collection", collection)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return mapRows(data, (r) => ({ key: String(r.item_key), data: (r.data ?? {}) as Record<string, unknown> }));
});

/** Nilai satu pengaturan situs (tabel site_settings); `{ value: null }` bila belum pernah disimpan. */
export const fetchSetting = cached("setting", async (key: string): Promise<{ value: Record<string, unknown> | null }> => {
  const { data, error } = await client().from("site_settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return { value: data ? ((data.value ?? null) as Record<string, unknown> | null) : null };
});
