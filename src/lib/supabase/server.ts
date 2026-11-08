import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/** Klien anon untuk Server Actions publik (INSERT lewat RLS). Null bila Supabase belum dikonfigurasi. */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/** Klien service role: hanya untuk tugas server tepercaya (push, admin). Jangan pernah dikirim ke klien. */
export function getServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured() || !key) return null;
  const { url } = getSupabaseEnv();
  return createClient(url, key, { auth: { persistSession: false } });
}
