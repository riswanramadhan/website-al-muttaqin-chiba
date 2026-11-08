import "server-only";
import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, createT, isAdminLang, type AdminLang, type Translate } from "@/components/admin/i18n";

/** Bahasa UI admin dari cookie `acc-admin-lang`; default Indonesia. */
export async function getAdminLang(): Promise<AdminLang> {
  const store = await cookies();
  const value = store.get(ADMIN_LANG_COOKIE)?.value;
  return isAdminLang(value) ? value : "id";
}

export async function getAdminT(): Promise<{ lang: AdminLang; t: Translate }> {
  const lang = await getAdminLang();
  return { lang, t: createT(lang) };
}
