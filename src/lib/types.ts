/**
 * Tipe data inti Al Muttaqin Cultural Center.
 * Semua konten multibahasa memakai bentuk { ja, en, id } (PRD §6.3, §7).
 * Data disimpan sebagai seed (src/data) dan dapat dipindah ke Supabase (supabase/migrations)
 * tanpa mengubah komponen, karena semua akses lewat src/lib/data.
 */

export type Locale = "ja" | "en" | "id";

/** Teks pendek tiga bahasa. */
export type LocalizedText = Record<Locale, string>;

/** Blok konten sederhana untuk isi artikel, panduan, dan pengumuman. */
export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title?: string; text: string; tone?: "info" | "warning" | "success" }
  | { type: "arabic"; text: string; translation?: string };

/** Isi panjang tiga bahasa. */
export type LocalizedBlocks = Record<Locale, ContentBlock[]>;

export type GeoPoint = { lat: number; lng: number };

export type SocialLinks = {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tiktok?: string;
};

export type MosqueProfile = {
  name: LocalizedText;
  shortName: string;
  legalName: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  /** Alamat jalan (placeholder sampai pengurus mengisi). */
  address: LocalizedText;
  postalCode: string;
  city: LocalizedText;
  prefecture: LocalizedText;
  country: LocalizedText;
  coordinates: GeoPoint;
  googleMapsUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  social: SocialLinks;
  foundedYear: number;
  capacity: number;
  openingHours: LocalizedText;
  nearestStations: { name: LocalizedText; walkMinutes: number; lines: string }[];
  partners: Partner[];
};

/** Mitra pengelola/pendukung. `logo` berupa berkas di `public/` (rasio asli lewat width/height). */
export type Partner = {
  name: string;
  role: LocalizedText;
  url?: string;
  logo?: { src: string; width: number; height: number };
};

export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
export type ObligatoryPrayer = Exclude<PrayerName, "sunrise">;

export type CalculationMethodId =
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "Dubai"
  | "MoonsightingCommittee"
  | "NorthAmerica"
  | "Kuwait"
  | "Qatar"
  | "Singapore"
  | "Turkey"
  | "Tehran";

export type IqamahRule =
  | { type: "offset"; minutes: number }
  | { type: "fixed"; time: string }; // "HH:mm" waktu Asia/Tokyo

export type PrayerConfig = {
  method: CalculationMethodId;
  madhab: "shafi" | "hanafi";
  highLatitudeRule: "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle";
  /** Koreksi menit per waktu salat dari admin. */
  adjustments: Record<PrayerName, number>;
  iqamah: Record<ObligatoryPrayer, IqamahRule>;
  /** Koreksi tanggal Hijriah (-1, 0, +1) dari admin. */
  hijriAdjustment: number;
  timezone: "Asia/Tokyo";
  jumuah: { time: string; secondTime?: string; note?: LocalizedText };
  /** Jika diisi, mode Ramadan aktif pada rentang tanggal ini (YYYY-MM-DD). */
  ramadan?: { start: string; end: string };
};

export type JumuahSchedule = {
  id: string;
  /** Tanggal Jumat (YYYY-MM-DD, Asia/Tokyo). */
  date: string;
  khatib: string;
  imam: string;
  time: string;
  language: "ja" | "en" | "id" | "ar" | "mixed";
  topic?: LocalizedText;
  note?: LocalizedText;
};

export type AnnouncementCategory = "general" | "prayer" | "event" | "donation" | "urgent";

export type Announcement = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedBlocks;
  category: AnnouncementCategory;
  publishedAt: string; // ISO
  pinned: boolean;
  expiresAt?: string;
};

export type EventCategory =
  | "kajian"
  | "tpa"
  | "muallaf"
  | "community"
  | "culture"
  | "ramadan"
  | "eid"
  | "class"
  | "open-mosque";

export type MosqueEvent = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  description: LocalizedBlocks;
  category: EventCategory;
  startsAt: string; // ISO (UTC); tampilkan JST
  endsAt: string;
  location: LocalizedText;
  speaker?: string;
  languages: Locale[];
  coverImage?: string;
  registration: {
    required: boolean;
    quota?: number;
    registered?: number;
    deadline?: string;
    fee?: { amount: number; currency: "JPY" | "IDR"; note?: LocalizedText };
  };
  recurring?: LocalizedText;
  featured?: boolean;
};

export type Lecture = {
  id: string;
  slug: string;
  title: LocalizedText;
  speaker: string;
  youtubeId: string;
  publishedAt: string;
  durationMinutes: number;
  series?: LocalizedText;
  description: LocalizedText;
  language: "ja" | "en" | "id" | "ar";
  tags: string[];
};

/** Video unggulan tunggal (mis. dokumenter masjid). `title` = judul asli di YouTube. */
export type FeaturedVideo = {
  youtubeId: string;
  title: string;
  channelName: string;
  channelUrl: string;
  publishedAt: string;
  durationSeconds: number;
};

export type NewsCategory = "news" | "report" | "article" | "press";

export type NewsPost = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedBlocks;
  category: NewsCategory;
  publishedAt: string;
  author: string;
  coverImage?: string;
  tags: string[];
};

export type DonationAccount = {
  id: string;
  currency: "JPY" | "IDR";
  method: "bank" | "qris" | "ewallet";
  bankName: string;
  bankNameLocalized?: LocalizedText;
  branch?: string;
  branchCode?: string;
  accountType?: string;
  accountNumber: string;
  accountName: string;
  /** Untuk QRIS: path gambar QR resmi dari pengurus. */
  qrImage?: string;
  note?: LocalizedText;
  primary?: boolean;
};

export type DonationProgram = {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  target?: { amount: number; currency: "JPY" };
  raised?: { amount: number; currency: "JPY" };
  status: "open" | "closed" | "completed";
  icon: "building" | "heart" | "book-open" | "graduation-cap" | "utensils" | "moon";
};

export type TransparencyReport = {
  id: string;
  period: string; // "2026-10"
  title: LocalizedText;
  currency: "JPY";
  income: { label: LocalizedText; amount: number }[];
  expense: { label: LocalizedText; amount: number }[];
  openingBalance: number;
  closingBalance: number;
  publishedAt: string;
  fileUrl?: string;
  note?: LocalizedText;
};

export type FaqCategory = "general" | "prayer" | "donation" | "newcomer" | "program" | "visit";

export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: LocalizedText;
  answer: LocalizedText;
};

export type DictionaryCategory = "worship" | "food" | "daily" | "emergency" | "phrases";

export type DictionaryEntry = {
  id: string;
  category: DictionaryCategory;
  /** Istilah dalam bahasa Jepang (kanji/kana). */
  japanese: string;
  reading: string; // kana/romaji
  meaning: LocalizedText;
  /** Contoh kalimat bahasa Jepang untuk ditunjukkan ke orang Jepang. */
  example?: { ja: string; translation: LocalizedText };
};

export type HaramIngredient = {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: LocalizedText;
  status: "haram" | "syubhat";
  note?: LocalizedText;
};

export type HalalPlaceType = "mosque" | "prayer-room" | "restaurant" | "mart" | "service";

export type HalalPlace = {
  id: string;
  name: string;
  nameJa?: string;
  type: HalalPlaceType;
  address: string;
  coordinates: GeoPoint;
  mapsUrl: string;
  note?: LocalizedText;
  verified: boolean;
  distanceKmFromMosque?: number;
};

export type DuaCategory = "morning" | "evening" | "daily" | "prayer" | "travel" | "ramadan" | "jumuah";

export type Dua = {
  id: string;
  category: DuaCategory;
  title: LocalizedText;
  arabic: string;
  transliteration: string;
  translation: LocalizedText;
  source: string;
  repeat?: number;
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: LocalizedText;
  category: "building" | "activity" | "community" | "ramadan" | "eid";
  takenAt?: string;
  width: number;
  height: number;
};

export type ProgramId =
  | "tpa"
  | "muallaf-class"
  | "japanese-class"
  | "open-mosque"
  | "school-visit"
  | "weekly-kajian"
  | "youth";

export type Program = {
  id: ProgramId;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  description: LocalizedBlocks;
  schedule: LocalizedText;
  audience: LocalizedText;
  languages: Locale[];
  icon: "book-open" | "heart-handshake" | "languages" | "door-open" | "school" | "mic" | "users";
  registrationOpen: boolean;
  contactPerson?: string;
};

export type Room = {
  id: string;
  name: LocalizedText;
  capacity: number;
  description: LocalizedText;
  amenities: LocalizedText[];
  image?: string;
  availableFor: LocalizedText[];
};

export type BoardMember = {
  id: string;
  name: string;
  role: LocalizedText;
  organization?: string;
  photo?: string;
};

export type TimelineItem = {
  year: string;
  title: LocalizedText;
  description: LocalizedText;
};

export type Facility = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon:
    | "landmark"
    | "users"
    | "baby"
    | "book"
    | "utensils"
    | "parking"
    | "accessibility"
    | "wifi"
    | "droplets";
};

export type HijriImportantDate = {
  id: string;
  /** Bulan Hijriah 1-12 dan tanggal. */
  month: number;
  day: number;
  title: LocalizedText;
  description?: LocalizedText;
  kind: "eid" | "fast" | "ramadan" | "hajj" | "other";
};

export type HadithOfTheDay = {
  id: string;
  arabic?: string;
  text: LocalizedText;
  source: string;
};

export type QuranSurahMeta = {
  number: number;
  name: string; // Arabic
  englishName: string;
  transliteration: string;
  japaneseName: string;
  indonesianName: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
};

/** Hasil pencarian global. */
export type SearchDocument = {
  id: string;
  type:
    | "page"
    | "announcement"
    | "event"
    | "lecture"
    | "news"
    | "faq"
    | "program"
    | "dictionary"
    | "dua"
    | "halal";
  title: LocalizedText;
  excerpt: LocalizedText;
  href: string;
  keywords?: string[];
};
