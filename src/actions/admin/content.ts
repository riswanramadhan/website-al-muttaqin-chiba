"use server";

import { z } from "zod";
import { createServerSupabase, logActivity, type AdminSession } from "@/lib/supabase/admin";
import { removeUnusedMedia } from "@/lib/supabase/media";
import { runAdminAction, revalidatePublic, type AdminActionResult } from "@/actions/admin/shared";
import {
  announcementSchema,
  contentStatusSchema,
  eventSchema,
  jumuahSchema,
  lectureSchema,
  newsSchema,
  quickAnnouncementSchema,
  type AnnouncementInput,
  type EventInput,
  type JumuahInput,
  type LectureInput,
  type NewsInput,
} from "@/components/admin/schemas";
import type { ContentEntity, ContentStatus } from "@/components/admin/types";
import { parseTags, slugify, textOrNull } from "@/components/admin/utils";

/**
 * CRUD konten lima entitas (pengumuman, agenda, Jumat, kajian video, berita).
 * Setiap mutasi: requireAdmin(content_admin) -> zod -> tulis Supabase -> activity_log -> revalidate.
 */

type Row = Record<string, unknown>;
type EntityConfig = { table: string; publicPaths: (slug?: string) => string[] };

const ENTITIES: Record<ContentEntity, EntityConfig> = {
  announcements: { table: "announcements", publicPaths: (slug) => ["", "/news", "/app", ...(slug ? [`/news/${slug}`] : [])] },
  events: { table: "events", publicPaths: (slug) => ["", "/events", "/app", ...(slug ? [`/events/${slug}`] : [])] },
  jumuah: { table: "jumuah_schedules", publicPaths: () => ["", "/prayer-times", "/jumuah", "/app"] },
  lectures: { table: "lectures", publicPaths: (slug) => ["/lectures", ...(slug ? [`/lectures/${slug}`] : [])] },
  news: { table: "news", publicPaths: (slug) => ["", "/news", ...(slug ? [`/news/${slug}`] : [])] },
};

const CONTENT_ROLES = ["content_admin" as const];

function nullable(iso: string): string | null {
  return iso ? iso : null;
}

function publishedAtFor(status: ContentStatus, value: string): string | null {
  if (value) return value;
  return status === "published" ? new Date().toISOString() : null;
}

function announcementRow(d: AnnouncementInput, session: AdminSession): Row {
  return {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    body: d.body,
    category: d.category,
    pinned: d.pinned,
    status: d.status,
    published_at: publishedAtFor(d.status, d.publishedAt),
    expires_at: nullable(d.expiresAt),
    ...(d.id ? {} : { created_by: session.admin.id }),
  };
}

function eventRow(d: EventInput, session: AdminSession): Row {
  const quota = Number.parseInt(d.quota, 10);
  const fee = Number.parseInt(d.feeAmount, 10);
  return {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    description: d.description,
    category: d.category,
    starts_at: d.startsAt,
    ends_at: d.endsAt,
    location: d.location,
    speaker: d.speaker || null,
    languages: d.languages.length ? d.languages : ["id"],
    cover_image: d.coverImage || null,
    registration: {
      required: d.registrationRequired,
      ...(Number.isFinite(quota) && quota > 0 ? { quota } : {}),
      ...(d.deadline ? { deadline: d.deadline } : {}),
      ...(Number.isFinite(fee) && fee > 0 ? { fee: { amount: fee, currency: "JPY" } } : {}),
    },
    recurring: textOrNull(d.recurring),
    featured: d.featured,
    status: d.status,
    ...(d.id ? {} : { created_by: session.admin.id }),
  };
}

function jumuahRow(d: JumuahInput): Row {
  return {
    date: d.date,
    khatib: d.khatib,
    imam: d.imam,
    time: d.time,
    language: d.language,
    topic: textOrNull(d.topic),
    note: textOrNull(d.note),
    published: d.published,
  };
}

function lectureRow(d: LectureInput): Row {
  const duration = Number.parseInt(d.durationMinutes, 10);
  return {
    slug: d.slug,
    title: d.title,
    speaker: d.speaker,
    youtube_id: d.youtubeId,
    published_at: publishedAtFor(d.status, d.publishedAt),
    duration_minutes: Number.isFinite(duration) && duration > 0 ? duration : 0,
    series: textOrNull(d.series),
    description: d.description,
    language: d.language,
    tags: parseTags(d.tags),
    status: d.status,
  };
}

function newsRow(d: NewsInput): Row {
  return {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    body: d.body,
    category: d.category,
    author: d.author || null,
    cover_image: d.coverImage || null,
    tags: parseTags(d.tags),
    status: d.status,
    published_at: publishedAtFor(d.status, d.publishedAt),
  };
}

async function upsertRow(entity: ContentEntity, id: string | undefined, row: Row, session: AdminSession, status: string | null): Promise<{ id: string }> {
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("supabase");
  const table = ENTITIES[entity].table;
  // Baris lama dibaca dulu agar gambar sampul yang diganti bisa dihapus dari Storage.
  const before = id ? (await supabase.from(table).select("*").eq("id", id).maybeSingle()).data : null;
  const query = id ? supabase.from(table).update(row).eq("id", id).select("id").single() : supabase.from(table).insert(row).select("id").single();
  const { data, error } = await query;
  if (error) throw new Error(error.code === "23505" ? "errors.slugTaken" : error.message);
  const newId = String((data as Row).id);
  if (before) await removeUnusedMedia(supabase, before, row);
  await logActivity(session.admin.id, id ? "update" : "create", table, newId, { slug: row.slug ?? row.date ?? null, status });
  await revalidatePublic(ENTITIES[entity].publicPaths(typeof row.slug === "string" ? row.slug : undefined));
  return { id: newId };
}

export async function saveAnnouncement(raw: unknown): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction({ roles: CONTENT_ROLES, schema: announcementSchema, raw, handler: (d, s) => upsertRow("announcements", d.id, announcementRow(d, s), s, d.status) });
}

export async function saveEvent(raw: unknown): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction({ roles: CONTENT_ROLES, schema: eventSchema, raw, handler: (d, s) => upsertRow("events", d.id, eventRow(d, s), s, d.status) });
}

export async function saveJumuah(raw: unknown): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction({ roles: CONTENT_ROLES, schema: jumuahSchema, raw, handler: (d, s) => upsertRow("jumuah", d.id, jumuahRow(d), s, d.published ? "published" : "draft") });
}

export async function saveLecture(raw: unknown): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction({ roles: CONTENT_ROLES, schema: lectureSchema, raw, handler: (d, s) => upsertRow("lectures", d.id, lectureRow(d), s, d.status) });
}

export async function saveNews(raw: unknown): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction({ roles: CONTENT_ROLES, schema: newsSchema, raw, handler: (d, s) => upsertRow("news", d.id, newsRow(d), s, d.status) });
}

/** Formulir cepat dasbor: judul + satu paragraf per bahasa, langsung terbit. */
export async function publishQuickAnnouncement(raw: unknown): Promise<AdminActionResult<{ id: string; slug: string }>> {
  return runAdminAction({
    roles: CONTENT_ROLES,
    schema: quickAnnouncementSchema,
    raw,
    handler: async (d, s) => {
      const slug = `${slugify(d.title.id) || "pengumuman"}-${Date.now().toString(36)}`;
      const paragraph = (text: string) => (text.trim() ? [{ type: "p" as const, text: text.trim() }] : []);
      const row: Row = {
        slug,
        title: d.title,
        excerpt: d.body,
        body: { ja: paragraph(d.body.ja), en: paragraph(d.body.en), id: paragraph(d.body.id) },
        category: d.category,
        pinned: d.pinned,
        status: "published",
        published_at: new Date().toISOString(),
        created_by: s.admin.id,
      };
      const { id } = await upsertRow("announcements", undefined, row, s, "published");
      await logActivity(s.admin.id, "publish", "announcements", id, { slug, quick: true });
      return { id, slug };
    },
  });
}

const statusInput = z.object({
  entity: z.enum(["announcements", "events", "jumuah", "lectures", "news"]),
  id: z.string().min(1),
  status: contentStatusSchema,
});

/** Terbitkan / jadikan draf / arsipkan tanpa membuka formulir. */
export async function setContentStatus(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: CONTENT_ROLES,
    schema: statusInput,
    raw,
    handler: async (d, s) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const table = ENTITIES[d.entity].table;
      const patch: Row =
        d.entity === "jumuah"
          ? { published: d.status === "published" }
          : { status: d.status, ...(d.status === "published" ? { published_at: new Date().toISOString() } : {}) };
      const { data, error } = await supabase.from(table).update(patch).eq("id", d.id).select("*").maybeSingle();
      if (error) throw new Error(error.message);
      const slug = data && typeof (data as Row).slug === "string" ? String((data as Row).slug) : undefined;
      const action = d.status === "published" ? "publish" : d.status === "archived" ? "archive" : "unpublish";
      await logActivity(s.admin.id, action, table, d.id, { slug: slug ?? null });
      await revalidatePublic(ENTITIES[d.entity].publicPaths(slug));
      return undefined;
    },
  });
}

const deleteInput = z.object({ entity: z.enum(["announcements", "events", "jumuah", "lectures", "news"]), id: z.string().min(1) });

export async function deleteContent(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: CONTENT_ROLES,
    schema: deleteInput,
    raw,
    handler: async (d, s) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const table = ENTITIES[d.entity].table;
      const { data, error } = await supabase.from(table).delete().eq("id", d.id).select("*").maybeSingle();
      if (error) throw new Error(error.message);
      if (data) await removeUnusedMedia(supabase, data, null);
      const slug = data && typeof (data as Row).slug === "string" ? String((data as Row).slug) : undefined;
      await logActivity(s.admin.id, "delete", table, d.id, { slug: slug ?? null });
      await revalidatePublic(ENTITIES[d.entity].publicPaths(slug));
      return undefined;
    },
  });
}
