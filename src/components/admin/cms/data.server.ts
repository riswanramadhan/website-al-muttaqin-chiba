import "server-only";
/**
 * Pembacaan data CMS untuk panel admin. Dengan Supabase: klien sesi (RLS admin) membaca semua
 * item termasuk yang disembunyikan, tanpa cache. Mode demo: data seed hanya-baca.
 */
import { createServerSupabase } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSeedCollection, getSeedSetting } from "@/lib/data";
import type { CmsData } from "@/components/admin/cms/fields";
import type { CollectionDef, SettingDef } from "@/components/admin/cms/registry";

export type CmsItem = {
  id: string;
  key: string;
  data: CmsData;
  published: boolean;
  sortOrder: number;
  updatedAt: string | null;
};

type Row = Record<string, unknown>;

function mapItem(r: Row): CmsItem {
  return {
    id: String(r.id),
    key: String(r.item_key),
    data: (r.data ?? {}) as CmsData,
    published: r.published !== false,
    sortOrder: Number(r.sort_order ?? 0),
    updatedAt: r.updated_at ? String(r.updated_at) : null,
  };
}

/** Item seed sebagai baris CMS: `id` di data menjadi kunci item (linimasa memakai nomor urut). */
function seedItems(def: CollectionDef): CmsItem[] {
  return getSeedCollection(def.name).map((entry, index) => {
    const { id, ...data } = entry as { id?: string } & CmsData;
    const key = typeof id === "string" && id ? id : `item-${String(index + 1).padStart(2, "0")}`;
    return { id: key, key, data, published: true, sortOrder: index, updatedAt: null };
  });
}

export async function listItems(def: CollectionDef): Promise<CmsItem[]> {
  if (!isSupabaseConfigured()) return seedItems(def);
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("content_items")
    .select("id, item_key, data, published, sort_order, updated_at")
    .eq("collection", def.name)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.warn(`[admin] gagal membaca koleksi ${def.name}:`, error.message);
    return [];
  }
  return ((data ?? []) as Row[]).map(mapItem);
}

export async function getItem(def: CollectionDef, id: string): Promise<CmsItem | null> {
  return (await listItems(def)).find((item) => item.id === id) ?? null;
}

/** Nilai pengaturan untuk formulir: tersimpan di atas bawaan; `saved` menandai sudah pernah disimpan. */
export async function getSettingValue(def: SettingDef): Promise<{ data: CmsData; saved: boolean; updatedAt: string | null }> {
  const seed = getSeedSetting(def.key) as CmsData;
  if (!isSupabaseConfigured()) return { data: seed, saved: false, updatedAt: null };
  const supabase = await createServerSupabase();
  if (!supabase) return { data: seed, saved: false, updatedAt: null };
  const { data, error } = await supabase.from("site_settings").select("value, updated_at").eq("key", def.key).maybeSingle();
  if (error || !data) return { data: seed, saved: false, updatedAt: null };
  const row = data as Row;
  return { data: { ...seed, ...((row.value ?? {}) as CmsData) }, saved: true, updatedAt: row.updated_at ? String(row.updated_at) : null };
}

/** Jumlah item per koleksi untuk dasbor. */
export async function countItems(def: CollectionDef): Promise<number> {
  return (await listItems(def)).length;
}
