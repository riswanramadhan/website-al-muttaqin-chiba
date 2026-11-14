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
  PromoPopup,
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
import { promoPopup } from "@/data/promo";
import { tokyoDateKey, tokyoParts, addDays } from "@/lib/utils/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as remote from "@/lib/data/supabase-adapter";

function sortByDateDesc<T extends { publishedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Nama koleksi CMS di tabel content_items (lihat supabase/migrations/0003_cms.sql). */
export type CollectionName =
  | "faqs"
  | "gallery"
  | "donation_accounts"
  | "donation_programs"
  | "transparency_reports"
  | "programs"
  | "rooms"
  | "halal_places"
  | "board"
  | "facilities"
  | "timeline";

/** Kunci pengaturan situs di tabel site_settings. */
export type SettingKey = "profile" | "featured_video" | "promo_popup";

/**
 * Item koleksi dari Supabase; `id` selalu diisi dari item_key. Supabase aktif berarti database
 * menjadi sumber kebenaran (koleksi kosong tampil kosong); seed hanya dipakai bila Supabase
 * belum dikonfigurasi atau query gagal.
 */
async function collection<T>(name: CollectionName, seed: T[]): Promise<T[]> {
  if (!isSupabaseConfigured()) return seed;
  const rows = await remote.fetchCollection(name);
  // Query gagal dan cache kosong: data keuangan contoh (nomor rekening, angka laporan) tidak
  // boleh tampil sebagai data asli, jadi koleksi donasi ditampilkan kosong, bukan seed.
  if (!rows) return FINANCIAL_COLLECTIONS.has(name) ? [] : seed;
  return rows.map((row) => ({ ...row.data, id: row.key }) as T);
}

const FINANCIAL_COLLECTIONS: ReadonlySet<CollectionName> = new Set(["donation_accounts", "donation_programs", "transparency_reports"]);

/** Pengaturan tunggal: nilai tersimpan ditimpakan di atas bawaan agar kolom baru tetap terisi. */
async function setting<T extends object>(key: SettingKey, seed: T): Promise<T> {
  if (!isSupabaseConfigured()) return seed;
  const stored = await remote.fetchSetting(key);
  if (!stored?.value) return seed;
  return { ...seed, ...(stored.value as Partial<T>) };
}

/** Data bawaan (seed) sebuah koleksi: dipakai panel admin pada mode demo. */
export function getSeedCollection(name: CollectionName): object[] {
  const seeds: Record<CollectionName, object[]> = {
    faqs,
    gallery,
    donation_accounts: donationAccounts,
    donation_programs: donationPrograms,
    transparency_reports: transparencyReports,
    programs,
    rooms,
    halal_places: halalPlaces,
    board,
    facilities,
    timeline,
  };
  return seeds[name];
}

/** Nilai bawaan (seed) sebuah pengaturan: isian awal formulir admin sebelum pernah disimpan. */
export function getSeedSetting(key: SettingKey): object {
  const seeds: Record<SettingKey, object> = { profile, featured_video: documentary, promo_popup: promoPopup };
  return seeds[key];
}

export async function getProfile(): Promise<MosqueProfile> {
  return setting("profile", profile);
}

export async function getBoard(): Promise<BoardMember[]> {
  return collection("board", board);
}

export async function getTimeline(): Promise<TimelineItem[]> {
  return collection("timeline", timeline);
}

export async function getFacilities(): Promise<Facility[]> {
  return collection("facilities", facilities);
}

export async function getPromoPopup(): Promise<PromoPopup> {
  return setting("promo_popup", promoPopup);
}

export async function getPrayerConfig(): Promise<PrayerConfig> {
  if (isSupabaseConfigured()) {
    const stored = await remote.fetchPrayerConfig();
    if (stored?.config) return { ...prayerConfig, ...stored.config };
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
  return setting("featured_video", documentary);
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
  return collection("donation_accounts", donationAccounts);
}

export async function getDonationPrograms(): Promise<DonationProgram[]> {
  return collection("donation_programs", donationPrograms);
}

export async function getTransparencyReports(): Promise<TransparencyReport[]> {
  const list = await collection("transparency_reports", transparencyReports);
  return [...list].sort((a, b) => b.period.localeCompare(a.period));
}

export async function getFaqs(category?: FaqCategory): Promise<FaqItem[]> {
  const list = await collection("faqs", faqs);
  return category ? list.filter((f) => f.category === category) : list;
}

export async function getDictionary(): Promise<DictionaryEntry[]> {
  return dictionary;
}

export async function getHaramIngredients(): Promise<HaramIngredient[]> {
  return haramIngredients;
}

export async function getHalalPlaces(): Promise<HalalPlace[]> {
  return collection("halal_places", halalPlaces);
}

export async function getDuas(category?: DuaCategory): Promise<Dua[]> {
  return category ? duas.filter((d) => d.category === category) : duas;
}

export async function getGallery(): Promise<GalleryItem[]> {
  return collection("gallery", gallery);
}

export async function getPrograms(): Promise<Program[]> {
  return collection("programs", programs);
}

export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
  return (await getPrograms()).find((p) => p.slug === slug);
}

export async function getRooms(): Promise<Room[]> {
  return collection("rooms", rooms);
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
  const [ann, ev, lec, nw, faqs, programs, halalPlaces] = await Promise.all([
    getAnnouncements({ includeExpired: true }),
    getEvents(),
    getLectures(),
    getNews(),
    getFaqs(),
    getPrograms(),
    getHalalPlaces(),
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
