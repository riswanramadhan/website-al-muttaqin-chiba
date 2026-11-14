"use server";

import { z } from "zod";
import { createServerSupabase, logActivity } from "@/lib/supabase/admin";
import { removeUnusedMedia } from "@/lib/supabase/media";
import { runAdminAction, revalidatePublic, type AdminActionResult } from "@/actions/admin/shared";
import { buildSchema, cleanValue, itemKeySchema } from "@/components/admin/cms/fields";
import { COLLECTIONS, SETTINGS, findCollectionByName, findSettingByKey } from "@/components/admin/cms/registry";

/**
 * CRUD koleksi CMS (tabel content_items) dan pengaturan situs (tabel site_settings).
 * Setiap mutasi: requireAdmin(peran koleksi) -> bersihkan + validasi Zod dari definisi kolom ->
 * tulis Supabase (RLS tetap berlaku) -> hapus berkas unggahan yang tak terpakai ->
 * activity_log -> segarkan situs publik.
 */

type Row = Record<string, unknown>;

const collectionNames = COLLECTIONS.map((c) => c.name) as [string, ...string[]];
const settingKeys = SETTINGS.map((s) => s.key) as [string, ...string[]];

function collectionOf(raw: unknown) {
  const name = raw && typeof raw === "object" ? (raw as Row).collection : undefined;
  return typeof name === "string" ? findCollectionByName(name) : undefined;
}

const invalid: AdminActionResult<never> = { ok: false, error: "validation" };

export async function saveItem(raw: unknown): Promise<AdminActionResult<{ id: string }>> {
  const def = collectionOf(raw);
  if (!def) return invalid;
  const schema = z.object({
    collection: z.literal(def.name),
    id: z.string().uuid().optional(),
    key: itemKeySchema,
    published: z.boolean(),
    data: z.preprocess((value) => cleanValue(def.fields, value), buildSchema(def.fields)),
  });
  return runAdminAction({
    roles: def.roles,
    schema,
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");

      if (d.id) {
        const { data: before, error: readError } = await supabase.from("content_items").select("data").eq("id", d.id).eq("collection", def.name).maybeSingle();
        if (readError) throw new Error(readError.message);
        if (!before) throw new Error("content.notFound");
        const { error } = await supabase.from("content_items").update({ data: d.data, published: d.published, updated_by: session.admin.id }).eq("id", d.id);
        if (error) throw new Error(error.message);
        await removeUnusedMedia(supabase, (before as Row).data, d.data);
        await logActivity(session.admin.id, "update", def.name, d.id, { key: d.key });
        await revalidatePublic();
        return { id: d.id };
      }

      const { data: last } = await supabase.from("content_items").select("sort_order").eq("collection", def.name).order("sort_order", { ascending: false }).limit(1).maybeSingle();
      const sortOrder = Number((last as Row | null)?.sort_order ?? -1) + 1;
      const { data: created, error } = await supabase
        .from("content_items")
        .insert({ collection: def.name, item_key: d.key, data: d.data, published: d.published, sort_order: sortOrder, updated_by: session.admin.id })
        .select("id")
        .single();
      if (error) throw new Error(error.code === "23505" ? "errors.keyTaken" : error.message);
      const id = String((created as Row).id);
      await logActivity(session.admin.id, "create", def.name, id, { key: d.key });
      await revalidatePublic();
      return { id };
    },
  });
}

const itemRef = z.object({ collection: z.enum(collectionNames), id: z.string().uuid() });

export async function setItemPublished(raw: unknown): Promise<AdminActionResult<undefined>> {
  const def = collectionOf(raw);
  if (!def) return invalid;
  return runAdminAction({
    roles: def.roles,
    schema: itemRef.extend({ published: z.boolean() }),
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const { error } = await supabase.from("content_items").update({ published: d.published, updated_by: session.admin.id }).eq("id", d.id).eq("collection", def.name);
      if (error) throw new Error(error.message);
      await logActivity(session.admin.id, d.published ? "publish" : "unpublish", def.name, d.id);
      await revalidatePublic();
      return undefined;
    },
  });
}

export async function deleteItem(raw: unknown): Promise<AdminActionResult<undefined>> {
  const def = collectionOf(raw);
  if (!def) return invalid;
  return runAdminAction({
    roles: def.roles,
    schema: itemRef,
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const { data: removed, error } = await supabase.from("content_items").delete().eq("id", d.id).eq("collection", def.name).select("item_key, data").maybeSingle();
      if (error) throw new Error(error.message);
      if (removed) await removeUnusedMedia(supabase, (removed as Row).data, null);
      await logActivity(session.admin.id, "delete", def.name, d.id, { key: (removed as Row | null)?.item_key ?? null });
      await revalidatePublic();
      return undefined;
    },
  });
}

/** Geser urutan tampil satu item naik/turun dengan menukar sort_order terhadap tetangganya. */
export async function moveItem(raw: unknown): Promise<AdminActionResult<undefined>> {
  const def = collectionOf(raw);
  if (!def) return invalid;
  return runAdminAction({
    roles: def.roles,
    schema: itemRef.extend({ direction: z.enum(["up", "down"]) }),
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const { data, error } = await supabase
        .from("content_items")
        .select("id, sort_order")
        .eq("collection", def.name)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as { id: string; sort_order: number }[];
      const index = rows.findIndex((r) => r.id === d.id);
      const target = d.direction === "up" ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= rows.length) return undefined;

      const order = rows.map((r) => r.id);
      [order[index], order[target]] = [order[target], order[index]];
      // Tulis hanya baris yang nomor urutnya berubah (biasanya dua baris).
      const changes = order.map((id, position) => ({ id, position })).filter(({ id, position }) => rows.find((r) => r.id === id)?.sort_order !== position);
      for (const change of changes) {
        const { error: updateError } = await supabase.from("content_items").update({ sort_order: change.position }).eq("id", change.id);
        if (updateError) throw new Error(updateError.message);
      }
      await logActivity(session.admin.id, "reorder", def.name, d.id, { direction: d.direction });
      await revalidatePublic();
      return undefined;
    },
  });
}

export async function saveSetting(raw: unknown): Promise<AdminActionResult<undefined>> {
  const key = raw && typeof raw === "object" ? (raw as Row).key : undefined;
  const def = typeof key === "string" ? findSettingByKey(key) : undefined;
  if (!def) return invalid;
  const schema = z.object({
    key: z.enum(settingKeys),
    data: z.preprocess((value) => cleanValue(def.fields, value), buildSchema(def.fields)),
  });
  return runAdminAction({
    roles: def.roles,
    schema,
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const { data: before } = await supabase.from("site_settings").select("value").eq("key", def.key).maybeSingle();
      const { error } = await supabase.from("site_settings").upsert({ key: def.key, value: d.data, updated_by: session.admin.id, updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
      if (before) await removeUnusedMedia(supabase, (before as Row).value, d.data);
      await logActivity(session.admin.id, "update", "site_settings", def.key);
      await revalidatePublic();
      return undefined;
    },
  });
}

/** Tombol "Segarkan situs": buang cache data dan tandai semua halaman publik untuk dibuat ulang. */
export async function refreshSite(): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: ["content_admin", "donation_admin"],
    schema: z.undefined(),
    raw: undefined,
    handler: async (_input, session) => {
      await revalidatePublic();
      await logActivity(session.admin.id, "refresh", "site", null);
      return undefined;
    },
  });
}
