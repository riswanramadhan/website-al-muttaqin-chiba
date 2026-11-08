/**
 * Lapisan akses data. Semua halaman dan komponen membaca lewat fungsi di sini,
 * bukan langsung dari src/data, supaya sumbernya bisa dipindah ke Supabase
 * (PRD-02) tanpa menyentuh UI. Saat Supabase belum dikonfigurasi, data seed dipakai.
 */
import type {
  Announcement,
  BoardMember,
  DictionaryEntry,
  DonationAccount,
  DonationProgram,
  Dua,
  DuaCategory,
  Facility,
  FaqCategory,
  FaqItem,
  FeaturedVideo,
  GalleryItem,
  HadithOfTheDay,
  HalalPlace,
  HaramIngredient,
  HijriImportantDate,
  JumuahSchedule,
  Lecture,
  MosqueEvent,
  MosqueProfile,
  NewsPost,
  PrayerConfig,
  Program,
  QuranSurahMeta,
  Room,
  SearchDocument,
  TimelineItem,
  TransparencyReport,
} from "@/lib/types";
import { profile, board, timeline, facilities } from "@/data/profile";
import { prayerConfig, jumuahSchedules } from "@/data/prayer-config";
import { announcements } from "@/data/announcements";
import { events } from "@/data/events";
import { documentary, lectures } from "@/data/lectures";
import { news } from "@/data/news";
import { donationAccounts, donationPrograms, transparencyReports } from "@/data/donations";
import { faqs } from "@/data/faq";
import { dictionary } from "@/data/dictionary";
import { haramIngredients, halalPlaces } from "@/data/halal";
import { duas } from "@/data/dua";
import { gallery } from "@/data/gallery";
import { programs, rooms } from "@/data/programs";
import { hijriImportantDates } from "@/data/hijri-dates";
import { hadiths } from "@/data/hadith";
import { surahs } from "@/data/quran-meta";
import { tokyoDateKey, tokyoParts, addDays } from "@/lib/utils/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as remote from "@/lib/data/supabase-adapter";

function sortByDateDesc<T extends { publishedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getProfile(): Promise<MosqueProfile> {
  return profile;
}

export async function getBoard(): Promise<BoardMember[]> {
  return board;
}

export async function getTimeline(): Promise<TimelineItem[]> {
  return timeline;
}

export async function getFacilities(): Promise<Facility[]> {
  return facilities;
}

export async function getPrayerConfig(): Promise<PrayerConfig> {
  if (isSupabaseConfigured()) {
    const cfg = await remote.fetchPrayerConfig();
    if (cfg) return cfg;
  }
  return prayerConfig;
}

export async function getJumuahSchedules(): Promise<JumuahSchedule[]> {
  const list = isSupabaseConfigured() ? ((await remote.fetchJumuah()) ?? jumuahSchedules) : jumuahSchedules;
  return [...list].sort((a, b) => a.date.localeCompare(b.date));
}

/** Jadwal Jumat pekan ini: Jumat terdekat yang belum lewat (hari Jumat itu sendiri masih dihitung). */
export async function getJumuahThisWeek(now: Date = new Date()): Promise<JumuahSchedule | undefined> {
  const list = await getJumuahSchedules();
  const todayKey = tokyoDateKey(now);
  return list.find((j) => j.date >= todayKey);
}

export async function getUpcomingJumuah(limit = 4, now: Date = new Date()): Promise<JumuahSchedule[]> {
  const list = await getJumuahSchedules();
  const todayKey = tokyoDateKey(now);
  return list.filter((j) => j.date >= todayKey).slice(0, limit);
}

export async function getPastJumuah(limit = 8, now: Date = new Date()): Promise<JumuahSchedule[]> {
  const list = await getJumuahSchedules();
  const todayKey = tokyoDateKey(now);
  return list
    .filter((j) => j.date < todayKey)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export async function getAnnouncements(opts: { limit?: number; includeExpired?: boolean; pinnedFirst?: boolean } = {}): Promise<Announcement[]> {
  const source = isSupabaseConfigured() ? ((await remote.fetchAnnouncements()) ?? announcements) : announcements;
  const nowIso = new Date().toISOString();
  let list = sortByDateDesc(source).filter((a) => a.publishedAt <= nowIso);
  if (!opts.includeExpired) list = list.filter((a) => !a.expiresAt || a.expiresAt >= nowIso);
  if (opts.pinnedFirst !== false) list = [...list.filter((a) => a.pinned), ...list.filter((a) => !a.pinned)];
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export async function getAnnouncementBySlug(slug: string): Promise<Announcement | undefined> {
  const list = await getAnnouncements({ includeExpired: true });
  return list.find((a) => a.slug === slug);
}

export async function getEvents(opts: { upcoming?: boolean; past?: boolean; limit?: number; category?: MosqueEvent["category"]; featured?: boolean } = {}): Promise<MosqueEvent[]> {
  const source = isSupabaseConfigured() ? ((await remote.fetchEvents()) ?? events) : events;
  const nowIso = new Date().toISOString();
  let list = [...source].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  if (opts.upcoming) list = list.filter((e) => e.endsAt >= nowIso);
  if (opts.past) list = list.filter((e) => e.endsAt < nowIso).reverse();
  if (opts.category) list = list.filter((e) => e.category === opts.category);
  if (opts.featured) list = list.filter((e) => e.featured);
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export async function getEventBySlug(slug: string): Promise<MosqueEvent | undefined> {
  const list = await getEvents();
  return list.find((e) => e.slug === slug);
}

export async function getLectures(opts: { limit?: number; series?: string; language?: Lecture["language"] } = {}): Promise<Lecture[]> {
  const source = isSupabaseConfigured() ? ((await remote.fetchLectures()) ?? lectures) : lectures;
  let list = sortByDateDesc(source);
  if (opts.language) list = list.filter((l) => l.language === opts.language);
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export async function getLectureBySlug(slug: string): Promise<Lecture | undefined> {
  const list = await getLectures();
  return list.find((l) => l.slug === slug);
}

/** Video dokumenter Al Muttaqin (beranda dan halaman Tentang kami). */
export async function getDocumentary(): Promise<FeaturedVideo> {
  return documentary;
}

export async function getNews(opts: { limit?: number; category?: NewsPost["category"] } = {}): Promise<NewsPost[]> {
  const source = isSupabaseConfigured() ? ((await remote.fetchNews()) ?? news) : news;
  let list = sortByDateDesc(source);
  if (opts.category) list = list.filter((n) => n.category === opts.category);
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | undefined> {
  const list = await getNews();
  return list.find((n) => n.slug === slug);
}

export async function getDonationAccounts(): Promise<DonationAccount[]> {
  return donationAccounts;
}

export async function getDonationPrograms(): Promise<DonationProgram[]> {
  return donationPrograms;
}

export async function getTransparencyReports(): Promise<TransparencyReport[]> {
  return [...transparencyReports].sort((a, b) => b.period.localeCompare(a.period));
}

export async function getFaqs(category?: FaqCategory): Promise<FaqItem[]> {
  return category ? faqs.filter((f) => f.category === category) : faqs;
}

export async function getDictionary(): Promise<DictionaryEntry[]> {
  return dictionary;
}

export async function getHaramIngredients(): Promise<HaramIngredient[]> {
  return haramIngredients;
}

export async function getHalalPlaces(): Promise<HalalPlace[]> {
  return halalPlaces;
}

export async function getDuas(category?: DuaCategory): Promise<Dua[]> {
  return category ? duas.filter((d) => d.category === category) : duas;
}

export async function getGallery(): Promise<GalleryItem[]> {
  return gallery;
}

export async function getPrograms(): Promise<Program[]> {
  return programs;
}

export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  return programs.find((p) => p.slug === slug);
}

export async function getRooms(): Promise<Room[]> {
  return rooms;
}

export async function getHijriImportantDates(): Promise<HijriImportantDate[]> {
  return hijriImportantDates;
}

/** Hadis harian: dipilih deterministik dari tanggal Tokyo agar sama di server & klien. */
export async function getHadithOfTheDay(now: Date = new Date()): Promise<HadithOfTheDay> {
  const p = tokyoParts(now);
  const dayOfYear = Math.floor((Date.UTC(p.year, p.month - 1, p.day) - Date.UTC(p.year, 0, 1)) / 86_400_000);
  return hadiths[dayOfYear % hadiths.length];
}

export async function getSurahList(): Promise<QuranSurahMeta[]> {
  return surahs;
}

export async function getSurahMeta(number: number): Promise<QuranSurahMeta | undefined> {
  return surahs.find((s) => s.number === number);
}

/** Indeks pencarian global: halaman statis ditambah konten dinamis. */
export async function getSearchIndex(): Promise<SearchDocument[]> {
  const [ann, ev, lec, nw] = await Promise.all([
    getAnnouncements({ includeExpired: true }),
    getEvents(),
    getLectures(),
    getNews(),
  ]);
  const docs: SearchDocument[] = [];
  for (const a of ann) docs.push({ id: `a-${a.id}`, type: "announcement", title: a.title, excerpt: a.excerpt, href: `/news/${a.slug}` });
  for (const e of ev) docs.push({ id: `e-${e.id}`, type: "event", title: e.title, excerpt: e.excerpt, href: `/events/${e.slug}` });
  for (const l of lec) docs.push({ id: `l-${l.id}`, type: "lecture", title: l.title, excerpt: l.description, href: `/lectures/${l.slug}`, keywords: [l.speaker, ...l.tags] });
  for (const n of nw) docs.push({ id: `n-${n.id}`, type: "news", title: n.title, excerpt: n.excerpt, href: `/news/${n.slug}`, keywords: n.tags });
  for (const f of faqs) docs.push({ id: `f-${f.id}`, type: "faq", title: f.question, excerpt: f.answer, href: `/faq#${f.id}` });
  for (const p of programs) docs.push({ id: `p-${p.id}`, type: "program", title: p.title, excerpt: p.excerpt, href: `/programs/${p.slug}` });
  for (const d of dictionary) docs.push({ id: `d-${d.id}`, type: "dictionary", title: d.meaning, excerpt: { ja: d.japanese, en: `${d.japanese} (${d.reading})`, id: `${d.japanese} (${d.reading})` }, href: `/dictionary#${d.id}`, keywords: [d.japanese, d.reading] });
  for (const h of halalPlaces) docs.push({ id: `h-${h.id}`, type: "halal", title: { ja: h.nameJa ?? h.name, en: h.name, id: h.name }, excerpt: { ja: h.address, en: h.address, id: h.address }, href: `/halal#${h.id}` });
  return docs;
}

/** Kunci tanggal Tokyo untuk N hari ke depan (dipakai jadwal & ICS). */
export function upcomingDateKeys(days: number, from: Date = new Date()): string[] {
  return Array.from({ length: days }, (_, i) => tokyoDateKey(addDays(from, i)));
}
