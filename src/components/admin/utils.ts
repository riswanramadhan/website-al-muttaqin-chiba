/**
 * Util kecil panel admin yang aman di client maupun server (tanpa next/headers).
 */
import type { ContentBlock, Locale, LocalizedBlocks, LocalizedText } from "@/lib/types";
import { TOKYO_OFFSET_MS } from "@/lib/utils/i18n";
import type { AdminLang } from "@/components/admin/i18n";

export const LOCALES: Locale[] = ["ja", "en", "id"];

export const emptyText = (): LocalizedText => ({ ja: "", en: "", id: "" });
export const emptyBlocks = (): LocalizedBlocks => ({ ja: [], en: [], id: [] });

export function textOrEmpty(value: LocalizedText | null | undefined): LocalizedText {
  return { ja: value?.ja ?? "", en: value?.en ?? "", id: value?.id ?? "" };
}

export function blocksOrEmpty(value: LocalizedBlocks | null | undefined): LocalizedBlocks {
  return { ja: value?.ja ?? [], en: value?.en ?? [], id: value?.id ?? [] };
}

/** Teks tiga bahasa kosong di semua bahasa dianggap null saat disimpan. */
export function textOrNull(value: LocalizedText): LocalizedText | null {
  return value.ja.trim() || value.en.trim() || value.id.trim() ? value : null;
}

/** Nilai datetime-local (JST, "YYYY-MM-DDTHH:mm") dari ISO UTC. */
export function isoToJstLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  return new Date(ms + TOKYO_OFFSET_MS).toISOString().slice(0, 16);
}

/** ISO UTC dari nilai datetime-local JST; string kosong tetap kosong. */
export function jstLocalToIso(local: string): string {
  if (!local) return "";
  const ms = Date.parse(`${local}:00.000Z`);
  if (Number.isNaN(ms)) return "";
  return new Date(ms - TOKYO_OFFSET_MS).toISOString();
}

export function nowJstLocal(): string {
  return isoToJstLocal(new Date().toISOString());
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Format tanggal/waktu Tokyo untuk UI admin sesuai bahasa panel. */
export function formatAdminDateTime(iso: string | null | undefined, lang: AdminLang, withTime = true): string {
  if (!iso) return "-";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat(lang === "ja" ? "ja-JP" : "id-ID", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } : {}),
  }).format(new Date(ms));
}

export function formatAdminNumber(value: number, lang: AdminLang): string {
  return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "id-ID").format(value);
}

export type CsvCell = string | number | boolean | null | undefined;

/** Bangun teks CSV (RFC 4180) dengan BOM agar Excel membaca UTF-8 dengan benar. */
export function buildCsv(headers: string[], rows: CsvCell[][]): string {
  const escape = (cell: CsvCell): string => {
    if (cell === null || cell === undefined) return "";
    const text = typeof cell === "boolean" ? (cell ? "true" : "false") : String(cell);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))];
  return `﻿${lines.join("\r\n")}`;
}

/** Ringkasan satu baris dari blok konten (untuk tabel). */
export function blocksPreview(blocks: ContentBlock[], max = 80): string {
  const first = blocks.find((b) => "text" in b && b.text.trim()) ?? blocks[0];
  if (!first) return "";
  const text = "text" in first ? first.text : "items" in first ? first.items.join(", ") : "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
