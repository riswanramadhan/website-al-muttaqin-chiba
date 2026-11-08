"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase, logActivity } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/site";
import { ADMIN_LANG_COOKIE, isAdminLang } from "@/components/admin/i18n";
import { loginSchema, magicLinkSchema } from "@/components/admin/schemas";
import type { AdminActionResult } from "@/actions/admin/shared";

/** Masuk dengan email + kata sandi; setelah berhasil redirect ke /admin. */
export async function signInWithPassword(raw: unknown): Promise<AdminActionResult<undefined>> {
  if (!isSupabaseConfigured()) return { ok: false, error: "demo" };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: "demo" };
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { ok: false, error: "unauthorized", message: "login.failed" };

  const { data: admin } = await supabase.from("admins").select("id, active").eq("id", data.user.id).maybeSingle();
  if (!admin || (admin as { active?: boolean }).active === false) {
    await supabase.auth.signOut();
    return { ok: false, error: "forbidden", message: "login.notAdmin" };
  }
  await logActivity(data.user.id, "login", "session", null, { method: "password" });
  redirect("/admin");
}

/** Kirim magic link; tautan kembali ke /admin/auth/callback untuk menukar kode menjadi sesi. */
export async function sendMagicLink(raw: unknown): Promise<AdminActionResult<undefined>> {
  if (!isSupabaseConfigured()) return { ok: false, error: "demo" };
  const parsed = magicLinkSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation" };
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: "demo" };
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl}/admin/auth/callback`, shouldCreateUser: false },
  });
  if (error) return { ok: false, error: "server", message: error.message };
  return { ok: true, data: undefined };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await logActivity(user.id, "logout", "session");
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

/** Ganti bahasa UI admin (cookie `acc-admin-lang`), lalu segarkan seluruh /admin. */
export async function setAdminLang(lang: string): Promise<void> {
  if (!isAdminLang(lang)) return;
  const store = await cookies();
  store.set(ADMIN_LANG_COOKIE, lang, { path: "/admin", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/admin", "layout");
}
