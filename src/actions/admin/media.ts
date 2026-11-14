"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { AdminError, createServerSupabase, hasRole, logActivity, type AdminRole } from "@/lib/supabase/admin";
import { mediaPrefix } from "@/lib/supabase/media";
import { MEDIA_BUCKET } from "@/lib/utils/media";
import { runAdminAction, type AdminActionResult } from "@/actions/admin/shared";

/**
 * Unggah media hemat kuota: server hanya menerbitkan URL unggah bertanda tangan (signed upload
 * URL) setelah memeriksa peran admin; berkasnya dikirim browser LANGSUNG ke Supabase Storage.
 * Dengan begitu byte gambar tidak pernah melewati fungsi Vercel (tidak memakan bandwidth/durasi
 * fungsi dan tidak terkena batas body 4,5 MB).
 */

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" } as const;

/** Folder -> peran yang boleh mengunggah (super_admin selalu boleh). */
const FOLDER_ROLES: Record<string, AdminRole[]> = {
  gallery: ["content_admin"],
  covers: ["content_admin"],
  people: ["content_admin"],
  rooms: ["content_admin"],
  partners: ["content_admin"],
  promo: ["content_admin"],
  donations: ["donation_admin"],
  reports: ["donation_admin"],
};

const uploadSchema = z.object({
  folder: z.enum(["gallery", "covers", "donations", "people", "rooms", "partners", "promo", "reports"]),
  contentType: z.enum(["image/webp", "image/jpeg", "image/png", "application/pdf"]),
  size: z.number().int().positive().max(MAX_BYTES, "errors.fileTooLarge"),
});

export type MediaUploadTicket = { path: string; token: string; publicUrl: string };

export async function createMediaUpload(raw: unknown): Promise<AdminActionResult<MediaUploadTicket>> {
  return runAdminAction({
    roles: ["content_admin", "donation_admin"],
    schema: uploadSchema,
    raw,
    handler: async (d, session) => {
      if (!hasRole(session, FOLDER_ROLES[d.folder] ?? [])) throw new AdminError("forbidden");
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const month = new Date().toISOString().slice(0, 7);
      const path = `${d.folder}/${month}/${randomUUID()}.${EXTENSIONS[d.contentType]}`;
      const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw new Error(error?.message ?? "errors.uploadFailed");
      await logActivity(session.admin.id, "upload", "media", data.path, { size: d.size, type: d.contentType });
      return { path: data.path, token: data.token, publicUrl: `${mediaPrefix()}${data.path}` };
    },
  });
}
