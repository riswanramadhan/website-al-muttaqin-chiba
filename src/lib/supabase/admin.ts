import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";
import { getServiceClient } from "@/lib/supabase/server";

/**
 * Klien Supabase SSR untuk panel admin (PRD-09): sesi dibaca/ditulis lewat cookie,
 * sehingga RLS (`is_admin`, `has_role`) berlaku pada setiap query admin.
 * Semua fungsi mengembalikan null bila Supabase belum dikonfigurasi (mode demo).
 */

export type AdminRole = "super_admin" | "content_admin" | "donation_admin" | "viewer";
export const ADMIN_ROLES: AdminRole[] = ["super_admin", "content_admin", "donation_admin", "viewer"];

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  ui_locale: string;
  active: boolean;
};

export type AdminSession = { user: User; admin: AdminProfile };

export type AdminErrorCode = "demo" | "unauthorized" | "forbidden";

/** Kesalahan otorisasi yang dapat ditangkap Server Action dan diubah menjadi { ok: false }. */
export class AdminError extends Error {
  code: AdminErrorCode;
  constructor(code: AdminErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AdminError";
    this.code = code;
  }
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (ADMIN_ROLES as string[]).includes(value);
}

/**
 * Klien SSR dengan cookie Next.js. `setAll` gagal di Server Component (cookie hanya bisa
 * ditulis di Server Action / Route Handler); kegagalan itu diabaikan karena sesi tetap
 * terbaca dan diperbarui pada aksi berikutnya.
 */
export async function createServerSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const { url, anonKey } = getSupabaseEnv();
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) store.set(name, value, options);
        } catch {
          // Dipanggil dari Server Component: abaikan, proxy/aksi berikutnya akan menyegarkan sesi.
        }
      },
    },
  });
}

function mapAdmin(row: Record<string, unknown>): AdminProfile {
  return {
    id: String(row.id),
    email: String(row.email ?? ""),
    full_name: String(row.full_name ?? ""),
    role: isAdminRole(row.role) ? row.role : "viewer",
    ui_locale: String(row.ui_locale ?? "id"),
    active: row.active !== false,
  };
}

/** Sesi admin saat ini: pengguna Supabase Auth + baris di tabel `admins` (aktif). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("admins").select("*").eq("id", user.id).eq("active", true).maybeSingle();
  if (error || !data) return null;
  return { user, admin: mapAdmin(data as Record<string, unknown>) };
}

/**
 * Wajib ada sesi admin. Tanpa sesi: redirect ke /admin/login. Peran tidak cocok: lempar
 * AdminError("forbidden"); `super_admin` selalu lolos. Mode demo: lempar AdminError("demo").
 */
export async function requireAdmin(roles?: AdminRole[]): Promise<AdminSession> {
  if (!isSupabaseConfigured()) throw new AdminError("demo");
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (roles && roles.length > 0 && session.admin.role !== "super_admin" && !roles.includes(session.admin.role)) {
    throw new AdminError("forbidden");
  }
  return session;
}

/** Cek peran tanpa melempar (untuk menyembunyikan tombol di UI). */
export function hasRole(session: AdminSession | null, roles: AdminRole[]): boolean {
  if (!session) return false;
  return session.admin.role === "super_admin" || roles.includes(session.admin.role);
}

/** Catat ke activity_log (RLS: hanya admin aktif). Kegagalan tidak menghentikan aksi. */
export async function logActivity(
  admin_id: string,
  action: string,
  entity: string,
  entity_id?: string | null,
  detail?: Record<string, unknown> | null,
): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("activity_log").insert({ admin_id, action, entity, entity_id: entity_id ?? null, detail: detail ?? null });
  if (error) console.warn("[admin] gagal mencatat aktivitas:", error.message);
}

/**
 * Klien untuk pembacaan lintas-admin (daftar admin, subscription push): service role bila ada,
 * selain itu klien sesi (dibatasi RLS). Null dalam mode demo.
 */
export async function getAdminReadClient(): Promise<SupabaseClient | null> {
  return getServiceClient() ?? (await createServerSupabase());
}
