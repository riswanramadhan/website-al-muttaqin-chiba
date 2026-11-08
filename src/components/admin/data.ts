import "server-only";
/**
 * Pembacaan data untuk panel admin. Dengan Supabase: klien SSR (RLS admin) membaca semua
 * baris termasuk draf. Tanpa Supabase (mode demo): data seed lewat @/lib/data ditambah
 * contoh kecil untuk tabel formulir publik yang tidak punya seed.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale, LocalizedText, PrayerConfig } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase, getAdminReadClient, isAdminRole } from "@/lib/supabase/admin";
import { getAnnouncements, getEvents, getJumuahSchedules, getLectures, getNews, getPrayerConfig } from "@/lib/data";
import { blocksOrEmpty, textOrEmpty } from "@/components/admin/utils";
import {
  INBOX_TABLES,
  type ActivityRecord,
  type AdminRecord,
  type AnnouncementRecord,
  type ContentStatus,
  type DashboardStats,
  type DonationConfirmationRecord,
  type EventRecord,
  type InboxKind,
  type InboxRecord,
  type JumuahRecord,
  type LectureRecord,
  type NewsRecord,
  type PushStats,
  type RecurringDonorRecord,
} from "@/components/admin/types";

type Row = Record<string, unknown>;

export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

function str(v: unknown, fallback = ""): string {
  return v === null || v === undefined ? fallback : String(v);
}
function strOrNull(v: unknown): string | null {
  return v === null || v === undefined || v === "" ? null : String(v);
}
function statusOf(v: unknown): ContentStatus {
  return v === "draft" || v === "archived" ? v : "published";
}
function text(v: unknown): LocalizedText {
  return textOrEmpty((v ?? null) as LocalizedText | null);
}

async function client(): Promise<SupabaseClient | null> {
  return createServerSupabase();
}

async function rows(table: string, order: { column: string; ascending: boolean }, select = "*"): Promise<Row[]> {
  const supabase = await client();
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select(select).order(order.column, { ascending: order.ascending });
  if (error) {
    console.warn(`[admin] gagal membaca ${table}:`, error.message);
    return [];
  }
  return (data ?? []) as unknown as Row[];
}

// ---------------------------------------------------------------------------
// Pengumuman
// ---------------------------------------------------------------------------
export function mapAnnouncement(r: Row): AnnouncementRecord {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: text(r.title),
    excerpt: text(r.excerpt),
    body: blocksOrEmpty(r.body as AnnouncementRecord["body"] | null),
    category: (r.category as AnnouncementRecord["category"]) ?? "general",
    pinned: Boolean(r.pinned),
    status: statusOf(r.status),
    publishedAt: strOrNull(r.published_at),
    expiresAt: strOrNull(r.expires_at),
    updatedAt: strOrNull(r.updated_at),
  };
}

export async function listAnnouncements(): Promise<AnnouncementRecord[]> {
  if (isDemoMode()) {
    const seed = await getAnnouncements({ includeExpired: true, pinnedFirst: false });
    return seed.map((a) => ({ ...a, status: "published", publishedAt: a.publishedAt, expiresAt: a.expiresAt ?? null, updatedAt: null }));
  }
  return (await rows("announcements", { column: "updated_at", ascending: false })).map(mapAnnouncement);
}

export async function getAnnouncement(id: string): Promise<AnnouncementRecord | null> {
  return (await listAnnouncements()).find((a) => a.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------
export function mapEvent(r: Row): EventRecord {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: text(r.title),
    excerpt: text(r.excerpt),
    description: blocksOrEmpty(r.description as EventRecord["description"] | null),
    category: (r.category as EventRecord["category"]) ?? "community",
    startsAt: str(r.starts_at),
    endsAt: str(r.ends_at),
    location: text(r.location),
    speaker: str(r.speaker),
    languages: (r.languages as Locale[]) ?? ["id"],
    coverImage: str(r.cover_image),
    registration: (r.registration as EventRecord["registration"]) ?? { required: false },
    recurring: r.recurring ? text(r.recurring) : null,
    featured: Boolean(r.featured),
    status: statusOf(r.status),
    updatedAt: strOrNull(r.updated_at),
  };
}

export async function listEvents(): Promise<EventRecord[]> {
  if (isDemoMode()) {
    const seed = await getEvents();
    return seed
      .map((e) => ({
        ...e,
        speaker: e.speaker ?? "",
        coverImage: e.coverImage ?? "",
        recurring: e.recurring ?? null,
        featured: Boolean(e.featured),
        status: "published" as const,
        updatedAt: null,
      }))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  }
  return (await rows("events", { column: "starts_at", ascending: false })).map(mapEvent);
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  return (await listEvents()).find((e) => e.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Jumat
// ---------------------------------------------------------------------------
export function mapJumuah(r: Row): JumuahRecord {
  return {
    id: str(r.id),
    date: str(r.date),
    khatib: str(r.khatib),
    imam: str(r.imam),
    time: str(r.time, "12:30"),
    language: (r.language as JumuahRecord["language"]) ?? "mixed",
    topic: r.topic ? text(r.topic) : null,
    note: r.note ? text(r.note) : null,
    published: r.published !== false,
    updatedAt: strOrNull(r.updated_at),
  };
}

export async function listJumuah(): Promise<JumuahRecord[]> {
  if (isDemoMode()) {
    const seed = await getJumuahSchedules();
    return seed.map((j) => ({ ...j, topic: j.topic ?? null, note: j.note ?? null, published: true, updatedAt: null })).sort((a, b) => b.date.localeCompare(a.date));
  }
  return (await rows("jumuah_schedules", { column: "date", ascending: false })).map(mapJumuah);
}

export async function getJumuah(id: string): Promise<JumuahRecord | null> {
  return (await listJumuah()).find((j) => j.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Kajian video
// ---------------------------------------------------------------------------
export function mapLecture(r: Row): LectureRecord {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: text(r.title),
    speaker: str(r.speaker),
    youtubeId: str(r.youtube_id),
    publishedAt: strOrNull(r.published_at),
    durationMinutes: Number(r.duration_minutes ?? 0),
    series: r.series ? text(r.series) : null,
    description: text(r.description),
    language: (r.language as LectureRecord["language"]) ?? "id",
    tags: (r.tags as string[]) ?? [],
    status: statusOf(r.status),
    updatedAt: strOrNull(r.updated_at),
  };
}

export async function listLectures(): Promise<LectureRecord[]> {
  if (isDemoMode()) {
    const seed = await getLectures();
    return seed.map((l) => ({ ...l, series: l.series ?? null, status: "published" as const, updatedAt: null }));
  }
  return (await rows("lectures", { column: "published_at", ascending: false })).map(mapLecture);
}

export async function getLecture(id: string): Promise<LectureRecord | null> {
  return (await listLectures()).find((l) => l.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Berita
// ---------------------------------------------------------------------------
export function mapNews(r: Row): NewsRecord {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: text(r.title),
    excerpt: text(r.excerpt),
    body: blocksOrEmpty(r.body as NewsRecord["body"] | null),
    category: (r.category as NewsRecord["category"]) ?? "news",
    author: str(r.author),
    coverImage: str(r.cover_image),
    tags: (r.tags as string[]) ?? [],
    status: statusOf(r.status),
    publishedAt: strOrNull(r.published_at),
    updatedAt: strOrNull(r.updated_at),
  };
}

export async function listNews(): Promise<NewsRecord[]> {
  if (isDemoMode()) {
    const seed = await getNews();
    return seed.map((n) => ({ ...n, coverImage: n.coverImage ?? "", status: "published" as const, updatedAt: null }));
  }
  return (await rows("news", { column: "updated_at", ascending: false })).map(mapNews);
}

export async function getNewsPost(id: string): Promise<NewsRecord | null> {
  return (await listNews()).find((n) => n.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Konfigurasi salat
// ---------------------------------------------------------------------------
export async function getAdminPrayerConfig(): Promise<PrayerConfig> {
  return getPrayerConfig();
}

// ---------------------------------------------------------------------------
// Donasi
// ---------------------------------------------------------------------------
function mapConfirmation(r: Row): DonationConfirmationRecord {
  return {
    id: str(r.id),
    programSlug: str(r.program_slug),
    accountId: str(r.account_id),
    currency: r.currency === "IDR" ? "IDR" : "JPY",
    amount: Number(r.amount ?? 0),
    uniqueCode: r.unique_code === null || r.unique_code === undefined ? null : Number(r.unique_code),
    transferredAt: str(r.transferred_at),
    donorName: str(r.donor_name),
    donorContact: str(r.donor_contact),
    onBehalfOf: str(r.on_behalf_of),
    message: str(r.message),
    status: r.status === "matched" || r.status === "rejected" ? r.status : "pending",
    adminNote: str(r.admin_note),
    matchedBy: strOrNull(r.matched_by),
    matchedAt: strOrNull(r.matched_at),
    locale: str(r.locale, "id"),
    createdAt: str(r.created_at),
  };
}

const DEMO_CONFIRMATIONS: DonationConfirmationRecord[] = [
  {
    id: "demo-dc-1",
    programSlug: "operasional",
    accountId: "jpb",
    currency: "JPY",
    amount: 10123,
    uniqueCode: 123,
    transferredAt: "2026-11-05",
    donorName: "Hamba Allah",
    donorContact: "08012345678",
    onBehalfOf: "",
    message: "Semoga bermanfaat.",
    status: "pending",
    adminNote: "",
    matchedBy: null,
    matchedAt: null,
    locale: "id",
    createdAt: "2026-11-05T02:10:00.000Z",
  },
  {
    id: "demo-dc-2",
    programSlug: "pembangunan",
    accountId: "qris",
    currency: "IDR",
    amount: 500000,
    uniqueCode: null,
    transferredAt: "2026-11-03",
    donorName: "Keluarga Sato",
    donorContact: "sato@example.com",
    onBehalfOf: "Alm. Ibu",
    message: "",
    status: "matched",
    adminNote: "Cocok dengan mutasi 03/11.",
    matchedBy: null,
    matchedAt: "2026-11-04T01:00:00.000Z",
    locale: "ja",
    createdAt: "2026-11-03T09:30:00.000Z",
  },
];

export async function listDonationConfirmations(): Promise<DonationConfirmationRecord[]> {
  if (isDemoMode()) return DEMO_CONFIRMATIONS;
  return (await rows("donation_confirmations", { column: "created_at", ascending: false })).map(mapConfirmation);
}

function mapRecurring(r: Row): RecurringDonorRecord {
  return {
    id: str(r.id),
    fullName: str(r.full_name),
    contact: str(r.contact),
    monthlyAmount: Number(r.monthly_amount ?? 0),
    currency: str(r.currency, "JPY"),
    paymentDay: Number(r.payment_day ?? 1),
    method: str(r.method),
    publishName: Boolean(r.publish_name),
    active: r.active !== false,
    locale: str(r.locale, "id"),
    createdAt: str(r.created_at),
  };
}

const DEMO_RECURRING: RecurringDonorRecord[] = [
  { id: "demo-rd-1", fullName: "Abdullah", contact: "abdullah@example.com", monthlyAmount: 3000, currency: "JPY", paymentDay: 25, method: "bank", publishName: false, active: true, locale: "id", createdAt: "2026-10-20T00:00:00.000Z" },
];

export async function listRecurringDonors(): Promise<RecurringDonorRecord[]> {
  if (isDemoMode()) return DEMO_RECURRING;
  return (await rows("recurring_donors", { column: "created_at", ascending: false })).map(mapRecurring);
}

// ---------------------------------------------------------------------------
// Kotak masuk
// ---------------------------------------------------------------------------
function eventTitle(r: Row): string {
  const ev = r.events as Row | null | undefined;
  const title = ev?.title as LocalizedText | undefined;
  return title ? title.id || title.en || title.ja : str(r.event_id);
}

function mapInbox(kind: InboxKind, r: Row): InboxRecord {
  switch (kind) {
    case "events":
      return { id: str(r.id), kind, name: str(r.full_name), contact: str(r.contact), subject: eventTitle(r), message: str(r.notes), count: Number(r.participants ?? 1), startsAt: null, endsAt: null, status: str(r.status, "registered"), locale: str(r.locale, "id"), createdAt: str(r.created_at) };
    case "programs":
      return { id: str(r.id), kind, name: str(r.full_name), contact: str(r.contact), subject: str(r.program_id), message: [r.participant_name ? `${str(r.participant_name)}${r.participant_age ? ` (${str(r.participant_age)})` : ""}` : "", str(r.notes)].filter(Boolean).join(" - "), count: null, startsAt: null, endsAt: null, status: str(r.status, "new"), locale: str(r.locale, "id"), createdAt: str(r.created_at) };
    case "bookings":
      return { id: str(r.id), kind, name: str(r.organizer_name), contact: str(r.organizer_contact), subject: `${str(r.room_id)}: ${str(r.purpose)}`, message: str(r.notes), count: Number(r.attendees ?? 1), startsAt: strOrNull(r.starts_at), endsAt: strOrNull(r.ends_at), status: str(r.status, "requested"), locale: str(r.locale, "id"), createdAt: str(r.created_at) };
    case "suggestions":
      return { id: str(r.id), kind, name: str(r.sender_name), contact: str(r.sender_contact), subject: str(r.kind, "suggestion"), message: str(r.message), count: null, startsAt: null, endsAt: null, status: str(r.status, "new"), locale: str(r.locale, "id"), createdAt: str(r.created_at) };
    case "contact":
      return { id: str(r.id), kind, name: str(r.full_name), contact: str(r.email), subject: str(r.subject), message: str(r.message), count: null, startsAt: null, endsAt: null, status: str(r.status, "new"), locale: str(r.locale, "id"), createdAt: str(r.created_at) };
  }
}

const DEMO_INBOX: InboxRecord[] = [
  { id: "demo-in-1", kind: "events", name: "Fatimah", contact: "08098765432", subject: "Kajian Sabtu: adab bertetangga", message: "", count: 2, startsAt: null, endsAt: null, status: "registered", locale: "id", createdAt: "2026-11-04T12:00:00.000Z" },
  { id: "demo-in-2", kind: "programs", name: "Yamada Hanako", contact: "hanako@example.com", subject: "japanese-class", message: "Pemula", count: null, startsAt: null, endsAt: null, status: "new", locale: "ja", createdAt: "2026-11-03T08:00:00.000Z" },
  { id: "demo-in-3", kind: "bookings", name: "PPI Chiba", contact: "ppi@example.com", subject: "hall: Rapat bulanan", message: "", count: 20, startsAt: "2026-11-15T05:00:00.000Z", endsAt: "2026-11-15T08:00:00.000Z", status: "requested", locale: "id", createdAt: "2026-11-02T10:00:00.000Z" },
  { id: "demo-in-4", kind: "suggestions", name: "", contact: "", subject: "facility", message: "Keran tempat wudu nomor 3 bocor.", count: null, startsAt: null, endsAt: null, status: "new", locale: "id", createdAt: "2026-11-01T22:00:00.000Z" },
  { id: "demo-in-5", kind: "contact", name: "John Smith", contact: "john@example.com", subject: "Visit with students", message: "Can we bring a class of 30 students next month?", count: null, startsAt: null, endsAt: null, status: "new", locale: "en", createdAt: "2026-10-30T03:00:00.000Z" },
];

export async function listInbox(kind: InboxKind): Promise<InboxRecord[]> {
  if (isDemoMode()) return DEMO_INBOX.filter((r) => r.kind === kind);
  const select = kind === "events" ? "*, events(title)" : "*";
  return (await rows(INBOX_TABLES[kind], { column: "created_at", ascending: false }, select)).map((r) => mapInbox(kind, r));
}

// ---------------------------------------------------------------------------
// Push, admin, aktivitas
// ---------------------------------------------------------------------------
export async function getPushStats(): Promise<PushStats> {
  if (isDemoMode()) return { total: 0, byLocale: { ja: 0, en: 0, id: 0 } };
  const supabase = await getAdminReadClient();
  if (!supabase) return { total: 0, byLocale: { ja: 0, en: 0, id: 0 } };
  const { data, error } = await supabase.from("push_subscriptions").select("locale");
  if (error || !data) return { total: 0, byLocale: { ja: 0, en: 0, id: 0 } };
  const byLocale: Record<Locale, number> = { ja: 0, en: 0, id: 0 };
  for (const r of data as Row[]) {
    const l = r.locale;
    if (l === "ja" || l === "en" || l === "id") byLocale[l] += 1;
    else byLocale.id += 1;
  }
  return { total: data.length, byLocale };
}

function mapAdminRow(r: Row): AdminRecord {
  return {
    id: str(r.id),
    email: str(r.email),
    fullName: str(r.full_name),
    role: isAdminRole(r.role) ? r.role : "viewer",
    uiLocale: str(r.ui_locale, "id"),
    active: r.active !== false,
    createdAt: str(r.created_at),
  };
}

const DEMO_ADMINS: AdminRecord[] = [
  { id: "demo-admin-1", email: "pengurus@almuttaqinculturalcenter.org", fullName: "Pengurus Demo", role: "super_admin", uiLocale: "id", active: true, createdAt: "2026-10-01T00:00:00.000Z" },
  { id: "demo-admin-2", email: "sugimoto@example.com", fullName: "Sugimoto Kyoichiro", role: "content_admin", uiLocale: "ja", active: true, createdAt: "2026-10-05T00:00:00.000Z" },
];

export async function listAdmins(): Promise<AdminRecord[]> {
  if (isDemoMode()) return DEMO_ADMINS;
  const supabase = await getAdminReadClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("admins").select("*").order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as Row[]).map(mapAdminRow);
}

const DEMO_ACTIVITY: ActivityRecord[] = [
  { id: "demo-act-1", adminId: "demo-admin-1", adminName: "Pengurus Demo", action: "publish", entity: "announcements", entityId: "ann-001", detail: { slug: "jadwal-kajian-pekanan-november-2026" }, createdAt: "2026-11-06T01:00:00.000Z" },
  { id: "demo-act-2", adminId: "demo-admin-2", adminName: "Sugimoto Kyoichiro", action: "update", entity: "jumuah_schedules", entityId: "j-2026-11-13", detail: null, createdAt: "2026-11-05T09:30:00.000Z" },
  { id: "demo-act-3", adminId: "demo-admin-1", adminName: "Pengurus Demo", action: "update", entity: "prayer_config", entityId: "1", detail: { hijriAdjustment: 0 }, createdAt: "2026-11-01T00:15:00.000Z" },
];

export async function listActivity(limit = 100): Promise<ActivityRecord[]> {
  if (isDemoMode()) return DEMO_ACTIVITY.slice(0, limit);
  const supabase = await client();
  if (!supabase) return [];
  const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error || !data) return [];
  const admins = await listAdmins();
  const names = new Map(admins.map((a) => [a.id, a.fullName || a.email]));
  return (data as Row[]).map((r) => ({
    id: str(r.id),
    adminId: strOrNull(r.admin_id),
    adminName: names.get(str(r.admin_id)) ?? "",
    action: str(r.action),
    entity: str(r.entity),
    entityId: strOrNull(r.entity_id),
    detail: (r.detail as Record<string, unknown> | null) ?? null,
    createdAt: str(r.created_at),
  }));
}

// ---------------------------------------------------------------------------
// Dasbor
// ---------------------------------------------------------------------------
export async function getDashboardStats(): Promise<DashboardStats> {
  const nowIso = new Date().toISOString();
  const [ann, ev, push] = await Promise.all([listAnnouncements(), listEvents(), getPushStats()]);
  const announcements = ann.filter((a) => a.status === "published" && (!a.expiresAt || a.expiresAt >= nowIso)).length;
  const events = ev.filter((e) => e.status === "published" && e.endsAt >= nowIso).length;

  if (isDemoMode()) {
    return {
      announcements,
      events,
      donationsPending: DEMO_CONFIRMATIONS.filter((d) => d.status === "pending").length,
      registrations: DEMO_INBOX.filter((r) => (r.kind === "events" && r.status === "registered") || (r.kind === "programs" && r.status === "new")).length,
      suggestions: DEMO_INBOX.filter((r) => r.kind === "suggestions" && r.status === "new").length,
      push: push.total,
    };
  }

  const supabase = await client();
  const countWhere = async (table: string, column: string, value: string): Promise<number> => {
    if (!supabase) return 0;
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true }).eq(column, value);
    return error ? 0 : (count ?? 0);
  };
  const [donationsPending, evReg, prReg, suggestions] = await Promise.all([
    countWhere("donation_confirmations", "status", "pending"),
    countWhere("event_registrations", "status", "registered"),
    countWhere("program_registrations", "status", "new"),
    countWhere("suggestions", "status", "new"),
  ]);
  return { announcements, events, donationsPending, registrations: evReg + prReg, suggestions, push: push.total };
}
