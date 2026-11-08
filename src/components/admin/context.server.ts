import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession, hasRole, type AdminRole, type AdminSession } from "@/lib/supabase/admin";
import { getAdminT } from "@/components/admin/lang.server";
import type { AdminLang, Translate } from "@/components/admin/i18n";

export type PanelContext = {
  demo: boolean;
  session: AdminSession | null;
  lang: AdminLang;
  t: Translate;
};

/** Konteks halaman admin: mode demo, sesi, dan terjemahan. Layout (panel) sudah menjamin sesi bila Supabase aktif. */
export async function getPanelContext(): Promise<PanelContext> {
  const demo = !isSupabaseConfigured();
  const [session, { lang, t }] = await Promise.all([demo ? Promise.resolve(null) : getAdminSession(), getAdminT()]);
  return { demo, session, lang, t };
}

/** Alasan tombol simpan dinonaktifkan: "demo", "role" (peran tidak cukup), atau undefined. */
export function guardFor(ctx: PanelContext, roles: AdminRole[]): "demo" | "role" | undefined {
  if (ctx.demo) return "demo";
  return hasRole(ctx.session, roles) ? undefined : "role";
}

/** Boleh melihat halaman: mode demo selalu boleh, selain itu cek peran. */
export function canView(ctx: PanelContext, roles: AdminRole[]): boolean {
  return ctx.demo || hasRole(ctx.session, roles);
}
