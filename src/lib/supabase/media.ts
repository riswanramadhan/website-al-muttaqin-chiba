import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { MEDIA_BUCKET, mediaPublicPrefix, removedMediaPaths } from "@/lib/utils/media";

/** Awalan URL publik bucket media untuk proyek Supabase yang sedang dipakai. */
export function mediaPrefix(): string {
  return mediaPublicPrefix(getSupabaseEnv().url);
}

/**
 * Hapus berkas unggahan yang tidak lagi dirujuk setelah sebuah data diubah atau dihapus,
 * supaya Storage (kuota 1 GB paket gratis) tidak dipenuhi berkas yatim. Kegagalan hanya dicatat.
 * Hak hapus tetap dijaga RLS Storage per folder (lihat can_manage_media di 0003_cms.sql).
 */
export async function removeUnusedMedia(supabase: SupabaseClient, before: unknown, after: unknown): Promise<number> {
  const candidates = removedMediaPaths(before, after, mediaPrefix());
  if (candidates.length === 0) return 0;
  // Dipanggil SETELAH data baru tersimpan: berkas yang masih dirujuk baris mana pun (mis. URL yang
  // sama ditempel di dua item) dibiarkan. Bila pemeriksaan gagal, tidak ada yang dihapus.
  const { data: inUse, error: checkError } = await supabase.rpc("media_paths_in_use", { paths: candidates });
  if (checkError) {
    console.warn("[media] pemeriksaan rujukan gagal, berkas lama dibiarkan:", checkError.message);
    return 0;
  }
  const used = new Set(Array.isArray(inUse) ? (inUse as string[]) : []);
  const paths = candidates.filter((candidate) => !used.has(candidate));
  if (paths.length === 0) return 0;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) {
    console.warn("[media] gagal menghapus berkas lama:", error.message);
    return 0;
  }
  return paths.length;
}
