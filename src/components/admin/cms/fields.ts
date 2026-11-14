/**
 * Definisi kolom formulir CMS generik (koleksi & pengaturan situs). Satu definisi dipakai untuk:
 * membangun formulir (cms-form.tsx), membersihkan isian (cleanValue), dan validasi Zod
 * (buildSchema) di client maupun Server Action. Nilai tersimpan berbentuk sama dengan tipe
 * publik di src/lib/types.ts sehingga lapisan data cukup membacanya apa adanya.
 * Aman di client dan server (tanpa next/headers).
 */
import { z } from "zod";
import type { Locale, LocalizedBlocks, LocalizedText } from "@/lib/types";
import { localeSchema, localizedBlocksSchema, localizedTextSchema } from "@/components/admin/schemas";
import { blocksOrEmpty, emptyBlocks, emptyText, textOrEmpty } from "@/components/admin/utils";

export type UploadFolder = "gallery" | "covers" | "donations" | "people" | "rooms" | "partners" | "promo" | "reports";

/** Ukuran & kualitas kompresi di browser sebelum unggah (lihat image-upload.tsx). */
export type ImagePreset = "photo" | "poster" | "qr" | "avatar" | "logo";

type Base = {
  key: string;
  /** Kunci terjemahan di admin.json (mis. "cms.fields.question"). */
  label: string;
  hint?: string;
  required?: boolean;
  /** Lebar penuh pada grid dua kolom. */
  wide?: boolean;
};

export type FieldDef =
  | (Base & { type: "text"; format?: "slug" | "url" | "href" | "time" | "youtube" | "email"; placeholder?: string; defaultValue?: string })
  | (Base & { type: "textarea" })
  | (Base & { type: "number"; min?: number; max?: number; integer?: boolean; defaultValue?: number })
  | (Base & { type: "boolean"; defaultValue?: boolean })
  | (Base & { type: "select"; options: readonly string[]; optionLabel: string; defaultValue?: string })
  | (Base & { type: "ltext"; multiline?: boolean })
  | (Base & { type: "lblocks" })
  | (Base & { type: "image"; folder: UploadFolder; preset: ImagePreset; shape?: "string" | "object"; dims?: [string, string]; allowPdf?: boolean })
  | (Base & { type: "date" })
  | (Base & { type: "month" })
  | (Base & { type: "datetime"; defaultNow?: boolean })
  | (Base & { type: "money"; currency: "JPY" })
  | (Base & { type: "locales" })
  | (Base & { type: "group"; fields: FieldDef[] })
  | (Base & { type: "list"; fields: FieldDef[]; titleKey?: string })
  | (Base & { type: "ltextList" });

export type CmsData = Record<string, unknown>;

const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const YOUTUBE = /^[A-Za-z0-9_-]{11}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const itemKeySchema = z.string().regex(SLUG, "errors.slug");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: LocalizedText): boolean {
  return Boolean(value.ja.trim() || value.en.trim() || value.id.trim());
}

function asText(value: unknown): LocalizedText {
  return textOrEmpty(isRecord(value) ? (value as Partial<LocalizedText> as LocalizedText) : null);
}

function isHttpOrPath(value: string): boolean {
  return value.startsWith("/") || /^https:\/\/[^\s]+$/.test(value);
}

/** Nilai awal formulir untuk item baru. */
export function defaultValue(fields: FieldDef[]): CmsData {
  const out: CmsData = {};
  for (const f of fields) {
    switch (f.type) {
      case "text":
        out[f.key] = f.defaultValue ?? "";
        break;
      case "textarea":
      case "date":
      case "month":
        out[f.key] = "";
        break;
      case "datetime":
        out[f.key] = f.defaultNow ? new Date().toISOString() : "";
        break;
      case "number":
        out[f.key] = f.defaultValue;
        break;
      case "boolean":
        out[f.key] = f.defaultValue ?? false;
        break;
      case "select":
        out[f.key] = f.defaultValue ?? (f.required ? f.options[0] : "");
        break;
      case "ltext":
        out[f.key] = emptyText();
        break;
      case "lblocks":
        out[f.key] = emptyBlocks();
        break;
      case "image":
        out[f.key] = f.shape === "object" ? undefined : "";
        break;
      case "money":
        out[f.key] = undefined;
        break;
      case "locales":
        out[f.key] = ["id"] satisfies Locale[];
        break;
      case "group":
        out[f.key] = defaultValue(f.fields);
        break;
      case "list":
      case "ltextList":
        out[f.key] = [];
        break;
    }
  }
  return out;
}

/** Gabungkan data tersimpan ke nilai awal, sehingga kolom yang belum ada tetap punya isian kosong. */
export function hydrate(fields: FieldDef[], data: CmsData | null | undefined): CmsData {
  const base = defaultValue(fields);
  if (!data) return base;
  for (const f of fields) {
    const v = data[f.key];
    if (v === undefined || v === null) continue;
    if (f.type === "group") base[f.key] = hydrate(f.fields, isRecord(v) ? v : {});
    else if (f.type === "list") base[f.key] = Array.isArray(v) ? v.map((item) => hydrate(f.fields, isRecord(item) ? item : {})) : [];
    else if (f.type === "ltext") base[f.key] = asText(v);
    else if (f.type === "ltextList") base[f.key] = Array.isArray(v) ? v.map(asText) : [];
    else if (f.type === "lblocks") base[f.key] = blocksOrEmpty(isRecord(v) ? (v as unknown as LocalizedBlocks) : null);
    else base[f.key] = v;
  }
  return base;
}

/**
 * Bersihkan isian formulir menjadi bentuk yang disimpan: teks di-trim, kolom opsional yang
 * kosong dibuang, dan kunci di luar definisi diabaikan.
 */
export function cleanValue(fields: FieldDef[], draft: unknown): CmsData {
  const source = isRecord(draft) ? draft : {};
  const out: CmsData = {};
  for (const f of fields) {
    const v = source[f.key];
    switch (f.type) {
      case "text":
      case "textarea":
      case "date":
      case "month":
      case "datetime":
      case "select": {
        const s = typeof v === "string" ? v.trim() : "";
        if (s || f.required) out[f.key] = s;
        break;
      }
      case "number":
        if (typeof v === "number" && Number.isFinite(v)) out[f.key] = v;
        break;
      case "boolean":
        out[f.key] = v === true;
        break;
      case "ltext": {
        const t = asText(v);
        if (f.required || hasText(t)) out[f.key] = { ja: t.ja.trim(), en: t.en.trim(), id: t.id.trim() };
        break;
      }
      case "lblocks":
        out[f.key] = blocksOrEmpty(isRecord(v) ? (v as unknown as LocalizedBlocks) : null);
        break;
      case "image":
        if (f.shape === "object") {
          if (isRecord(v) && typeof v.src === "string" && v.src.trim()) {
            out[f.key] = { src: v.src.trim(), width: Number(v.width) || 0, height: Number(v.height) || 0 };
          }
        } else {
          const s = typeof v === "string" ? v.trim() : "";
          if (s || f.required) out[f.key] = s;
        }
        break;
      case "money":
        if (isRecord(v) && typeof v.amount === "number" && Number.isFinite(v.amount)) out[f.key] = { amount: v.amount, currency: f.currency };
        break;
      case "locales":
        out[f.key] = Array.isArray(v) ? v.filter((l): l is Locale => l === "ja" || l === "en" || l === "id") : [];
        break;
      case "group":
        out[f.key] = cleanValue(f.fields, v);
        break;
      case "list":
        out[f.key] = Array.isArray(v) ? v.map((item) => cleanValue(f.fields, item)) : [];
        break;
      case "ltextList":
        out[f.key] = Array.isArray(v)
          ? v
              .map(asText)
              .filter(hasText)
              .map((t) => ({ ja: t.ja.trim(), en: t.en.trim(), id: t.id.trim() }))
          : [];
        break;
    }
  }
  return out;
}

function textSchema(f: Extract<FieldDef, { type: "text" }>) {
  let s = z.string().max(600, "errors.tooLong");
  if (f.required) s = s.min(1, "errors.required");
  switch (f.format) {
    case "slug":
      return s.regex(SLUG, "errors.slug");
    case "time":
      return s.regex(TIME, "errors.time");
    case "youtube":
      return s.regex(YOUTUBE, "errors.youtubeId");
    case "email":
      return s.regex(EMAIL, "errors.invalidEmail");
    case "url":
      return s.refine((v) => /^https?:\/\/[^\s]+$/.test(v), "errors.url");
    case "href":
      return s.refine((v) => v.startsWith("/") || /^https?:\/\/[^\s]+$/.test(v), "errors.url");
    default:
      return s;
  }
}

function fieldSchema(f: FieldDef): z.ZodType {
  switch (f.type) {
    case "text":
      return textSchema(f);
    case "textarea":
      return f.required ? z.string().min(1, "errors.required").max(5000, "errors.tooLong") : z.string().max(5000, "errors.tooLong");
    case "date":
      return z.string().regex(DATE, "errors.date");
    case "month":
      return z.string().regex(MONTH, "errors.month");
    case "datetime":
      return z.string().refine((v) => !Number.isNaN(Date.parse(v)), "errors.date");
    case "select":
      return z.enum(f.options as [string, ...string[]], { error: "errors.required" });
    case "number": {
      let n = z.number({ error: "errors.number" });
      if (f.integer) n = n.int("errors.number");
      if (f.min !== undefined) n = n.min(f.min, "errors.number");
      if (f.max !== undefined) n = n.max(f.max, "errors.number");
      return n;
    }
    case "boolean":
      return z.boolean();
    case "ltext":
      return f.required ? localizedTextSchema.refine((v) => v.id.trim().length > 0, { message: "errors.idRequired", path: ["id"] }) : localizedTextSchema;
    case "lblocks":
      return localizedBlocksSchema;
    case "image":
      return f.shape === "object"
        ? z.object({ src: z.string().max(600).refine(isHttpOrPath, "errors.url"), width: z.number().min(0), height: z.number().min(0) })
        : z.string().max(600).refine((v) => v === "" || isHttpOrPath(v), "errors.url");
    case "money":
      return z.object({ amount: z.number({ error: "errors.number" }).min(0, "errors.number"), currency: z.literal(f.currency) });
    case "locales":
      return z.array(localeSchema).min(1, "errors.required");
    case "group":
      return buildSchema(f.fields);
    case "list":
      return z.array(buildSchema(f.fields)).max(60, "errors.tooLong");
    case "ltextList":
      return z.array(localizedTextSchema).max(40, "errors.tooLong");
  }
}

/** Kolom yang selalu ada di hasil cleanValue (tidak pernah dibuang walau kosong). */
function alwaysPresent(f: FieldDef): boolean {
  return f.type === "boolean" || f.type === "lblocks" || f.type === "locales" || f.type === "group" || f.type === "list" || f.type === "ltextList";
}

const present = z.custom<unknown>((v) => v !== undefined && v !== null && v !== "", "errors.required");

/** Skema Zod untuk hasil cleanValue. Kolom wajib yang kosong menghasilkan "errors.required". */
export function buildSchema(fields: FieldDef[]): z.ZodType<CmsData> {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    const schema = fieldSchema(f);
    if (alwaysPresent(f)) shape[f.key] = schema;
    else if (f.required) shape[f.key] = present.pipe(schema);
    else shape[f.key] = schema.optional();
  }
  return z.object(shape) as unknown as z.ZodType<CmsData>;
}

/** Kunci item dari teks (judul/slug): huruf kecil, angka, tanda hubung. */
export function toItemKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Baca nilai pada jalur bertitik ("coordinates.lat", "income.0.amount"). */
export function getAtPath(data: unknown, path: string): unknown {
  let node: unknown = data;
  for (const part of path.split(".")) {
    if (Array.isArray(node)) node = node[Number(part)];
    else if (isRecord(node)) node = node[part];
    else return undefined;
  }
  return node;
}

/** Judul satu baris untuk tabel: teks biasa atau teks tiga bahasa (utamakan Indonesia). */
export function displayText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (isRecord(value)) {
    const t = asText(value);
    return t.id || t.en || t.ja;
  }
  return "";
}
