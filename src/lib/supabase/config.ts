/**
 * Konfigurasi Supabase dari environment. Aman di client: hanya variabel NEXT_PUBLIC_*.
 * Kunci publik boleh memakai nama lama (ANON_KEY, JWT) atau nama baru Supabase
 * (PUBLISHABLE_KEY, `sb_publishable_...`); keduanya tunduk pada RLS yang sama.
 */
function publicKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
}

/** Supabase aktif hanya bila URL dan kunci publik tersedia; selain itu situs memakai data seed. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && publicKey());
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: publicKey(),
  };
}
