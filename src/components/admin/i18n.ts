/**
 * i18n ringan untuk panel admin (tanpa next-intl, PRD-09).
 * Pesan dimuat statis dari src/messages/{id,ja}/admin.json; kunci yang hilang
 * jatuh ke bahasa Indonesia. Bahasa UI disimpan di cookie `acc-admin-lang`.
 */
import idMessages from "@/messages/id/admin.json";
import jaMessages from "@/messages/ja/admin.json";

export type AdminLang = "id" | "ja";
export const ADMIN_LANG_COOKIE = "acc-admin-lang";
export const ADMIN_LANGS: AdminLang[] = ["id", "ja"];

type MessageTree = { [key: string]: string | MessageTree };

const MESSAGES: Record<AdminLang, MessageTree> = {
  id: idMessages as MessageTree,
  ja: jaMessages as MessageTree,
};

export type TranslateVars = Record<string, string | number>;
export type Translate = (key: string, vars?: TranslateVars) => string;

function lookup(tree: MessageTree, key: string): string | undefined {
  let node: string | MessageTree | undefined = tree;
  for (const part of key.split(".")) {
    if (!node || typeof node === "string") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function isAdminLang(value: unknown): value is AdminLang {
  return value === "id" || value === "ja";
}

/** Terjemahkan satu kunci; fallback ke ID lalu ke kunci itu sendiri. */
export function t(lang: AdminLang, key: string, vars?: TranslateVars): string {
  const own = lookup(MESSAGES[lang], key) ?? lookup(MESSAGES.id, key);
  return own === undefined ? key : interpolate(own, vars);
}

/** Buat fungsi terjemahan terikat ke satu bahasa (dipakai Server Component dan client). */
export function createT(lang: AdminLang): Translate {
  return (key, vars) => t(lang, key, vars);
}
