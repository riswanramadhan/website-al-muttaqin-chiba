import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/admin";

/**
 * Tujuan magic link / undangan Supabase: tukar `code` (PKCE) menjadi sesi di cookie,
 * lalu arahkan ke /admin. Bila gagal, kembali ke halaman login dengan penanda error.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  const supabase = await createServerSupabase();
  if (!supabase || !code) return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
  return NextResponse.redirect(new URL(next.startsWith("/admin") ? next : "/admin", url.origin));
}
