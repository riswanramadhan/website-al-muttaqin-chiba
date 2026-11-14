/**
 * Skema Zod panel admin: dipakai formulir (react-hook-form) dan Server Action yang sama.
 * Pesan kesalahan berupa kunci `errors.*` di admin.json agar dapat diterjemahkan.
 * Tanpa default/transform supaya tipe input == output (aman untuk z.infer di RHF).
 */
import { z } from "zod";

export const localizedTextSchema = z.object({ ja: z.string(), en: z.string(), id: z.string() });

/** Teks tiga bahasa yang minimal terisi bahasa Indonesia (sumber salinan). */
export const requiredLocalizedTextSchema = localizedTextSchema.refine((v) => v.id.trim().length > 0, {
  message: "errors.titleRequired",
  path: ["id"],
});

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h2"), text: z.string() }),
  z.object({ type: z.literal("h3"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(z.string()) }),
  z.object({ type: z.literal("ol"), items: z.array(z.string()) }),
  z.object({ type: z.literal("quote"), text: z.string(), cite: z.string().optional() }),
  z.object({ type: z.literal("callout"), title: z.string().optional(), text: z.string(), tone: z.enum(["info", "warning", "success"]).optional() }),
  z.object({ type: z.literal("arabic"), text: z.string(), translation: z.string().optional() }),
]);

export const localizedBlocksSchema = z.object({
  ja: z.array(contentBlockSchema),
  en: z.array(contentBlockSchema),
  id: z.array(contentBlockSchema),
});

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export const slugSchema = z.string().trim().min(2, "errors.required").max(120).regex(/^[a-z0-9-]+$/, "errors.slug");
export const isoOrEmptySchema = z.string().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "errors.date");
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "errors.time");
export const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "errors.date");
export const localeSchema = z.enum(["ja", "en", "id"]);

export const announcementSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  title: requiredLocalizedTextSchema,
  excerpt: localizedTextSchema,
  body: localizedBlocksSchema,
  category: z.enum(["general", "prayer", "event", "donation", "urgent"]),
  pinned: z.boolean(),
  status: contentStatusSchema,
  publishedAt: isoOrEmptySchema,
  expiresAt: isoOrEmptySchema,
});
export type AnnouncementInput = z.infer<typeof announcementSchema>;

export const eventSchema = z
  .object({
    id: z.string().optional(),
    slug: slugSchema,
    title: requiredLocalizedTextSchema,
    excerpt: localizedTextSchema,
    description: localizedBlocksSchema,
    category: z.enum(["kajian", "tpa", "muallaf", "community", "culture", "ramadan", "eid", "class", "open-mosque"]),
    startsAt: z.string().min(1, "errors.required"),
    endsAt: z.string().min(1, "errors.required"),
    location: localizedTextSchema,
    speaker: z.string(),
    languages: z.array(localeSchema),
    coverImage: z.string(),
    registrationRequired: z.boolean(),
    quota: z.string(),
    deadline: isoOrEmptySchema,
    feeAmount: z.string(),
    recurring: localizedTextSchema,
    featured: z.boolean(),
    status: contentStatusSchema,
  })
  .refine((v) => Date.parse(v.endsAt) > Date.parse(v.startsAt), { message: "errors.endBeforeStart", path: ["endsAt"] });
export type EventInput = z.infer<typeof eventSchema>;

export const jumuahSchema = z.object({
  id: z.string().optional(),
  date: dateKeySchema,
  khatib: z.string().trim().min(1, "errors.required"),
  imam: z.string().trim().min(1, "errors.required"),
  time: timeSchema,
  language: z.enum(["ja", "en", "id", "ar", "mixed"]),
  topic: localizedTextSchema,
  note: localizedTextSchema,
  published: z.boolean(),
});
export type JumuahInput = z.infer<typeof jumuahSchema>;

export const lectureSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  title: requiredLocalizedTextSchema,
  speaker: z.string().trim().min(1, "errors.required"),
  youtubeId: z.string().trim().regex(/^[A-Za-z0-9_-]{11}$/, "errors.youtubeId"),
  publishedAt: isoOrEmptySchema,
  durationMinutes: z.string(),
  series: localizedTextSchema,
  description: localizedTextSchema,
  language: z.enum(["ja", "en", "id", "ar"]),
  tags: z.string(),
  status: contentStatusSchema,
});
export type LectureInput = z.infer<typeof lectureSchema>;

export const newsSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  title: requiredLocalizedTextSchema,
  excerpt: localizedTextSchema,
  body: localizedBlocksSchema,
  category: z.enum(["news", "report", "article", "press"]),
  author: z.string(),
  coverImage: z.string(),
  tags: z.string(),
  status: contentStatusSchema,
  publishedAt: isoOrEmptySchema,
});
export type NewsInput = z.infer<typeof newsSchema>;

export const quickAnnouncementSchema = z.object({
  title: requiredLocalizedTextSchema,
  body: localizedTextSchema,
  category: z.enum(["general", "prayer", "event", "donation", "urgent"]),
  pinned: z.boolean(),
});
export type QuickAnnouncementInput = z.infer<typeof quickAnnouncementSchema>;

const iqamahRuleSchema = z.object({
  type: z.enum(["offset", "fixed"]),
  minutes: z.number().int().min(0).max(120),
  time: z.string(),
});

export const prayerConfigSchema = z.object({
  method: z.enum(["MuslimWorldLeague", "Egyptian", "Karachi", "UmmAlQura", "Dubai", "MoonsightingCommittee", "NorthAmerica", "Kuwait", "Qatar", "Singapore", "Turkey", "Tehran"]),
  madhab: z.enum(["shafi", "hanafi"]),
  highLatitudeRule: z.enum(["MiddleOfTheNight", "SeventhOfTheNight", "TwilightAngle"]),
  adjustments: z.object({
    fajr: z.number().int().min(-60).max(60),
    sunrise: z.number().int().min(-60).max(60),
    dhuhr: z.number().int().min(-60).max(60),
    asr: z.number().int().min(-60).max(60),
    maghrib: z.number().int().min(-60).max(60),
    isha: z.number().int().min(-60).max(60),
  }),
  iqamah: z.object({ fajr: iqamahRuleSchema, dhuhr: iqamahRuleSchema, asr: iqamahRuleSchema, maghrib: iqamahRuleSchema, isha: iqamahRuleSchema }),
  hijriAdjustment: z.number().int().min(-1).max(1),
  jumuahTime: timeSchema,
  jumuahSecondTime: z.string(),
  jumuahNote: localizedTextSchema,
  ramadanStart: z.string(),
  ramadanEnd: z.string(),
});
export type PrayerConfigInput = z.infer<typeof prayerConfigSchema>;

export const donationStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "matched", "rejected"]),
  adminNote: z.string().max(500),
});

export const recurringDonorActiveSchema = z.object({ id: z.string().min(1), active: z.boolean() });

export const inboxStatusSchema = z.object({
  kind: z.enum(["events", "programs", "bookings", "suggestions", "contact"]),
  id: z.string().min(1),
  status: z.string().min(1).max(32),
});

export const pushBroadcastSchema = z.object({
  title: requiredLocalizedTextSchema,
  body: requiredLocalizedTextSchema,
  url: z.string().regex(/^(\/[A-Za-z0-9\-._~/?#@!$&'()*+,;=%]*)?$/, "errors.url"),
});
export type PushBroadcastInput = z.infer<typeof pushBroadcastSchema>;

export const adminInviteSchema = z.object({
  email: z.string().trim().email("errors.invalidEmail"),
  fullName: z.string().trim().min(2, "errors.required").max(80),
  role: z.enum(["super_admin", "content_admin", "donation_admin", "viewer"]),
});
export type AdminInviteInput = z.infer<typeof adminInviteSchema>;

export const adminUpdateSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["super_admin", "content_admin", "donation_admin", "viewer"]).optional(),
  active: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("errors.invalidEmail"),
  password: z.string().min(8, "errors.password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const magicLinkSchema = z.object({ email: z.string().trim().email("errors.invalidEmail") });

export const accountProfileSchema = z.object({ fullName: z.string().trim().min(2, "errors.required").max(80) });
export type AccountProfileInput = z.infer<typeof accountProfileSchema>;

export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "errors.required"),
    newPassword: z.string().min(8, "errors.password").max(72, "errors.tooLong"),
    confirmPassword: z.string().min(1, "errors.required"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "account.mismatch", path: ["confirmPassword"] })
  .refine((v) => v.newPassword !== v.currentPassword, { message: "account.samePassword", path: ["newPassword"] });
export type AccountPasswordInput = z.infer<typeof accountPasswordSchema>;
