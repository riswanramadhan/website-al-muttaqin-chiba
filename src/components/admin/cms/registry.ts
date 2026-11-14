/**
 * Daftar koleksi dan pengaturan situs yang dapat diubah dari panel admin.
 * Menambah isian baru cukup dengan menambah FieldDef di sini; formulir, validasi, dan
 * penyimpanan mengikuti otomatis. Bentuk data mengikuti tipe di src/lib/types.ts.
 */
import type { AdminRole } from "@/lib/supabase/admin";
import type { CollectionName, SettingKey } from "@/lib/data";
import type { AdminNavIcon } from "@/components/admin/nav";
import type { FieldDef } from "@/components/admin/cms/fields";

export type CollectionDef = {
  /** Nama koleksi di tabel content_items. */
  name: CollectionName;
  /** Segmen URL: /admin/cms/<slug>. */
  slug: string;
  icon: AdminNavIcon;
  /** Peran yang boleh mengubah (super_admin selalu boleh). Harus selaras dengan can_manage_collection() di SQL. */
  roles: AdminRole[];
  /** Kolom yang tampil sebagai judul dan keterangan di tabel. */
  titleField: string;
  metaField?: string;
  /** Kolom gambar untuk pratinjau kecil di tabel. */
  imageField?: string;
  /** Kolom sumber kunci item saat membuat baru (default: titleField). */
  keyFrom?: string;
  /** Halaman publik terkait (tanpa prefix locale). */
  publicPath: string;
  fields: FieldDef[];
};

export type SettingDef = {
  key: SettingKey;
  slug: string;
  icon: AdminNavIcon;
  roles: AdminRole[];
  publicPath: string;
  fields: FieldDef[];
};

const CONTENT: AdminRole[] = ["content_admin"];
const DONATION: AdminRole[] = ["donation_admin"];

const coordinates: FieldDef = {
  key: "coordinates",
  type: "group",
  label: "cms.fields.coordinates",
  hint: "cms.hints.coordinates",
  wide: true,
  fields: [
    { key: "lat", type: "number", label: "cms.fields.lat", required: true, min: -90, max: 90 },
    { key: "lng", type: "number", label: "cms.fields.lng", required: true, min: -180, max: 180 },
  ],
};

export const COLLECTIONS: CollectionDef[] = [
  {
    name: "faqs",
    slug: "faqs",
    icon: "faqs",
    roles: CONTENT,
    titleField: "question",
    metaField: "category",
    publicPath: "/faq",
    fields: [
      { key: "category", type: "select", label: "fields.category", required: true, options: ["general", "prayer", "donation", "newcomer", "program", "visit"], optionLabel: "cms.options.faqCategory" },
      { key: "question", type: "ltext", label: "cms.fields.question", required: true, wide: true },
      { key: "answer", type: "ltext", label: "cms.fields.answer", required: true, multiline: true, wide: true },
    ],
  },
  {
    name: "gallery",
    slug: "gallery",
    icon: "gallery",
    roles: CONTENT,
    titleField: "alt",
    metaField: "category",
    imageField: "src",
    publicPath: "/gallery",
    fields: [
      { key: "src", type: "image", label: "cms.fields.photo", required: true, folder: "gallery", preset: "photo", dims: ["width", "height"], wide: true },
      { key: "alt", type: "ltext", label: "cms.fields.caption", hint: "cms.hints.caption", required: true, wide: true },
      { key: "category", type: "select", label: "fields.category", required: true, options: ["building", "activity", "community", "ramadan", "eid"], optionLabel: "cms.options.galleryCategory" },
      { key: "takenAt", type: "date", label: "cms.fields.takenAt" },
      { key: "width", type: "number", label: "cms.fields.width", hint: "cms.hints.dimensions", required: true, integer: true, min: 1, defaultValue: 1200 },
      { key: "height", type: "number", label: "cms.fields.height", required: true, integer: true, min: 1, defaultValue: 800 },
    ],
  },
  {
    name: "programs",
    slug: "programs",
    icon: "programs",
    roles: CONTENT,
    titleField: "title",
    metaField: "schedule",
    keyFrom: "slug",
    publicPath: "/programs",
    fields: [
      { key: "title", type: "ltext", label: "fields.title", required: true, wide: true },
      { key: "slug", type: "text", format: "slug", label: "fields.slug", hint: "fields.slugHint", required: true },
      { key: "icon", type: "select", label: "cms.fields.icon", required: true, options: ["book-open", "heart-handshake", "languages", "door-open", "school", "mic", "users"], optionLabel: "cms.options.programIcon" },
      { key: "excerpt", type: "ltext", label: "fields.excerpt", multiline: true, required: true, wide: true },
      { key: "schedule", type: "ltext", label: "cms.fields.schedule", required: true },
      { key: "audience", type: "ltext", label: "cms.fields.audience", required: true },
      { key: "languages", type: "locales", label: "fields.languages" },
      { key: "contactPerson", type: "text", label: "cms.fields.contactPerson" },
      { key: "registrationOpen", type: "boolean", label: "cms.fields.registrationOpen", defaultValue: true },
      { key: "description", type: "lblocks", label: "fields.description", wide: true },
    ],
  },
  {
    name: "rooms",
    slug: "rooms",
    icon: "rooms",
    roles: CONTENT,
    titleField: "name",
    metaField: "capacity",
    publicPath: "/booking",
    fields: [
      { key: "name", type: "ltext", label: "common.name", required: true, wide: true },
      { key: "capacity", type: "number", label: "cms.fields.capacity", required: true, integer: true, min: 1 },
      { key: "description", type: "ltext", label: "fields.description", multiline: true, required: true, wide: true },
      { key: "amenities", type: "ltextList", label: "cms.fields.amenities", wide: true },
      { key: "availableFor", type: "ltextList", label: "cms.fields.availableFor", wide: true },
    ],
  },
  {
    name: "halal_places",
    slug: "halal-places",
    icon: "halal",
    roles: CONTENT,
    titleField: "name",
    metaField: "type",
    publicPath: "/halal",
    fields: [
      { key: "name", type: "text", label: "common.name", required: true },
      { key: "nameJa", type: "text", label: "cms.fields.nameJa" },
      { key: "type", type: "select", label: "cms.fields.placeType", required: true, options: ["mosque", "prayer-room", "restaurant", "mart", "service"], optionLabel: "cms.options.placeType" },
      { key: "verified", type: "boolean", label: "cms.fields.verified" },
      { key: "address", type: "text", label: "cms.fields.address", required: true, wide: true },
      { key: "mapsUrl", type: "text", format: "url", label: "cms.fields.mapsUrl", required: true, wide: true },
      coordinates,
      { key: "distanceKmFromMosque", type: "number", label: "cms.fields.distanceKm", min: 0 },
      { key: "note", type: "ltext", label: "fields.note", multiline: true, wide: true },
    ],
  },
  {
    name: "board",
    slug: "board",
    icon: "board",
    roles: CONTENT,
    titleField: "name",
    metaField: "role",
    imageField: "photo",
    publicPath: "/about",
    fields: [
      { key: "name", type: "text", label: "common.name", required: true },
      { key: "organization", type: "text", label: "cms.fields.organization" },
      { key: "role", type: "ltext", label: "cms.fields.position", required: true, wide: true },
      { key: "photo", type: "image", label: "cms.fields.photo", folder: "people", preset: "avatar", wide: true },
    ],
  },
  {
    name: "facilities",
    slug: "facilities",
    icon: "facilities",
    roles: CONTENT,
    titleField: "name",
    metaField: "icon",
    publicPath: "/about",
    fields: [
      { key: "name", type: "ltext", label: "common.name", required: true, wide: true },
      { key: "icon", type: "select", label: "cms.fields.icon", required: true, options: ["landmark", "users", "baby", "book", "utensils", "parking", "accessibility", "wifi", "droplets"], optionLabel: "cms.options.facilityIcon" },
      { key: "description", type: "ltext", label: "fields.description", multiline: true, required: true, wide: true },
    ],
  },
  {
    name: "timeline",
    slug: "timeline",
    icon: "timeline",
    roles: CONTENT,
    titleField: "title",
    metaField: "year",
    publicPath: "/about",
    fields: [
      { key: "year", type: "text", label: "cms.fields.year", required: true },
      { key: "title", type: "ltext", label: "fields.title", required: true, wide: true },
      { key: "description", type: "ltext", label: "fields.description", multiline: true, required: true, wide: true },
    ],
  },
  {
    name: "donation_accounts",
    slug: "donation-accounts",
    icon: "accounts",
    roles: DONATION,
    titleField: "bankName",
    metaField: "accountNumber",
    imageField: "qrImage",
    publicPath: "/donate",
    fields: [
      { key: "bankName", type: "text", label: "cms.fields.bankName", required: true },
      { key: "bankNameLocalized", type: "ltext", label: "cms.fields.bankNameLocalized" },
      { key: "currency", type: "select", label: "cms.fields.currency", required: true, options: ["JPY", "IDR"], optionLabel: "cms.options.currency" },
      { key: "method", type: "select", label: "cms.fields.method", required: true, options: ["bank", "qris", "ewallet"], optionLabel: "cms.options.method" },
      { key: "accountNumber", type: "text", label: "cms.fields.accountNumber", required: true },
      { key: "accountName", type: "text", label: "cms.fields.accountName", required: true },
      { key: "branch", type: "text", label: "cms.fields.branch" },
      { key: "branchCode", type: "text", label: "cms.fields.branchCode" },
      { key: "accountType", type: "text", label: "cms.fields.accountType" },
      { key: "primary", type: "boolean", label: "cms.fields.primary" },
      { key: "qrImage", type: "image", label: "cms.fields.qrImage", hint: "cms.hints.qrImage", folder: "donations", preset: "qr", wide: true },
      { key: "note", type: "ltext", label: "fields.note", multiline: true, wide: true },
    ],
  },
  {
    name: "donation_programs",
    slug: "donation-programs",
    icon: "donationPrograms",
    roles: DONATION,
    titleField: "title",
    metaField: "status",
    keyFrom: "slug",
    publicPath: "/donate",
    fields: [
      { key: "title", type: "ltext", label: "fields.title", required: true, wide: true },
      { key: "slug", type: "text", format: "slug", label: "fields.slug", hint: "fields.slugHint", required: true },
      { key: "status", type: "select", label: "fields.status", required: true, options: ["open", "closed", "completed"], optionLabel: "cms.options.programStatus" },
      { key: "icon", type: "select", label: "cms.fields.icon", required: true, options: ["building", "heart", "book-open", "graduation-cap", "utensils", "moon"], optionLabel: "cms.options.donationIcon" },
      { key: "target", type: "money", currency: "JPY", label: "cms.fields.target", hint: "cms.hints.target" },
      { key: "raised", type: "money", currency: "JPY", label: "cms.fields.raised", hint: "cms.hints.raised" },
      { key: "description", type: "ltext", label: "fields.description", multiline: true, required: true, wide: true },
    ],
  },
  {
    name: "transparency_reports",
    slug: "transparency-reports",
    icon: "reports",
    roles: DONATION,
    titleField: "title",
    metaField: "period",
    keyFrom: "period",
    publicPath: "/transparency",
    fields: [
      { key: "period", type: "month", label: "cms.fields.period", required: true },
      { key: "currency", type: "select", label: "cms.fields.currency", required: true, options: ["JPY"], optionLabel: "cms.options.currency" },
      { key: "title", type: "ltext", label: "fields.title", required: true, wide: true },
      { key: "openingBalance", type: "number", label: "cms.fields.openingBalance", required: true },
      { key: "closingBalance", type: "number", label: "cms.fields.closingBalance", hint: "cms.hints.closingBalance", required: true },
      {
        key: "income",
        type: "list",
        label: "cms.fields.income",
        wide: true,
        titleKey: "label",
        fields: [
          { key: "label", type: "ltext", label: "cms.fields.lineLabel", required: true, wide: true },
          { key: "amount", type: "number", label: "cms.fields.amount", required: true, min: 0 },
        ],
      },
      {
        key: "expense",
        type: "list",
        label: "cms.fields.expense",
        wide: true,
        titleKey: "label",
        fields: [
          { key: "label", type: "ltext", label: "cms.fields.lineLabel", required: true, wide: true },
          { key: "amount", type: "number", label: "cms.fields.amount", required: true, min: 0 },
        ],
      },
      { key: "publishedAt", type: "datetime", label: "fields.publishedAt", hint: "fields.timeHint", required: true, defaultNow: true },
      { key: "fileUrl", type: "image", label: "cms.fields.reportFile", hint: "cms.hints.reportFile", folder: "reports", preset: "photo", allowPdf: true },
      { key: "note", type: "ltext", label: "fields.note", multiline: true, wide: true },
    ],
  },
];

export const SETTINGS: SettingDef[] = [
  {
    key: "profile",
    slug: "profile",
    icon: "profile",
    roles: CONTENT,
    publicPath: "/contact",
    fields: [
      { key: "name", type: "ltext", label: "cms.fields.mosqueName", required: true, wide: true },
      { key: "shortName", type: "text", label: "cms.fields.shortName", required: true },
      { key: "foundedYear", type: "number", label: "cms.fields.foundedYear", required: true, integer: true, min: 1900, max: 2100 },
      { key: "legalName", type: "ltext", label: "cms.fields.legalName", required: true, wide: true },
      { key: "tagline", type: "ltext", label: "cms.fields.tagline", required: true, wide: true },
      { key: "description", type: "ltext", label: "fields.description", multiline: true, required: true, wide: true },
      { key: "address", type: "ltext", label: "cms.fields.address", required: true, wide: true },
      { key: "postalCode", type: "text", label: "cms.fields.postalCode", required: true },
      { key: "capacity", type: "number", label: "cms.fields.capacity", required: true, integer: true, min: 1 },
      { key: "city", type: "ltext", label: "cms.fields.city", required: true },
      { key: "prefecture", type: "ltext", label: "cms.fields.prefecture", required: true },
      { key: "country", type: "ltext", label: "cms.fields.country", required: true },
      { key: "openingHours", type: "ltext", label: "cms.fields.openingHours", required: true },
      coordinates,
      { key: "googleMapsUrl", type: "text", format: "url", label: "cms.fields.mapsUrl", required: true, wide: true },
      { key: "phone", type: "text", label: "cms.fields.phone", required: true },
      { key: "whatsapp", type: "text", label: "cms.fields.whatsapp", hint: "cms.hints.whatsapp", required: true },
      { key: "email", type: "text", format: "email", label: "fields.email", required: true },
      { key: "website", type: "text", format: "url", label: "cms.fields.website", required: true },
      {
        key: "social",
        type: "group",
        label: "cms.fields.social",
        wide: true,
        fields: [
          { key: "youtube", type: "text", format: "url", label: "cms.fields.youtube" },
          { key: "instagram", type: "text", format: "url", label: "cms.fields.instagram" },
          { key: "facebook", type: "text", format: "url", label: "cms.fields.facebook" },
          { key: "tiktok", type: "text", format: "url", label: "cms.fields.tiktok" },
          { key: "whatsapp", type: "text", format: "url", label: "cms.fields.whatsappLink" },
        ],
      },
      {
        key: "nearestStations",
        type: "list",
        label: "cms.fields.nearestStations",
        wide: true,
        titleKey: "name",
        fields: [
          { key: "name", type: "ltext", label: "cms.fields.stationName", required: true, wide: true },
          { key: "walkMinutes", type: "number", label: "cms.fields.walkMinutes", required: true, integer: true, min: 0 },
          { key: "lines", type: "text", label: "cms.fields.lines", required: true },
        ],
      },
      {
        key: "partners",
        type: "list",
        label: "cms.fields.partners",
        wide: true,
        titleKey: "name",
        fields: [
          { key: "name", type: "text", label: "common.name", required: true },
          { key: "url", type: "text", format: "url", label: "cms.fields.website" },
          { key: "role", type: "ltext", label: "cms.fields.partnerRole", required: true, wide: true },
          { key: "logo", type: "image", label: "cms.fields.logo", folder: "partners", preset: "logo", shape: "object", wide: true },
        ],
      },
    ],
  },
  {
    key: "featured_video",
    slug: "video",
    icon: "video",
    roles: CONTENT,
    publicPath: "/about",
    fields: [
      { key: "youtubeId", type: "text", format: "youtube", label: "fields.youtubeId", hint: "cms.hints.youtubeId", required: true },
      { key: "durationSeconds", type: "number", label: "cms.fields.durationSeconds", required: true, integer: true, min: 0 },
      { key: "title", type: "text", label: "cms.fields.videoTitle", required: true, wide: true },
      { key: "channelName", type: "text", label: "cms.fields.channelName", required: true },
      { key: "channelUrl", type: "text", format: "url", label: "cms.fields.channelUrl", required: true },
      { key: "publishedAt", type: "datetime", label: "fields.publishedAt", hint: "fields.timeHint", required: true, defaultNow: true },
    ],
  },
  {
    key: "promo_popup",
    slug: "promo",
    icon: "promo",
    roles: CONTENT,
    publicPath: "",
    fields: [
      { key: "enabled", type: "boolean", label: "cms.fields.promoEnabled", wide: true },
      { key: "image", type: "image", label: "cms.fields.poster", hint: "cms.hints.poster", required: true, folder: "promo", preset: "poster", shape: "object", wide: true },
      { key: "alt", type: "ltext", label: "cms.fields.posterAlt", required: true, wide: true },
      { key: "href", type: "text", format: "href", label: "cms.fields.posterHref", hint: "cms.hints.posterHref", required: true, defaultValue: "/donate" },
      { key: "version", type: "text", format: "slug", label: "cms.fields.posterVersion", hint: "cms.hints.posterVersion", required: true, defaultValue: "v1" },
    ],
  },
];

export function findCollection(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function findCollectionByName(name: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.name === name);
}

export function findSetting(slug: string): SettingDef | undefined {
  return SETTINGS.find((s) => s.slug === slug);
}

export function findSettingByKey(key: string): SettingDef | undefined {
  return SETTINGS.find((s) => s.key === key);
}
