import type { Locale } from "@/lib/types";

/**
 * Daftar namespace pesan. Setiap namespace adalah satu file JSON per bahasa:
 * src/messages/{ja,en,id}/{namespace}.json
 *
 * Aturan: setiap namespace dimiliki satu modul fitur; jangan menambah namespace
 * tanpa menambahkannya ke daftar ini (dan membuat ketiga file JSON-nya).
 */
export const NAMESPACES = [
  "common",
  "nav",
  "footer",
  "metadata",
  "pwa",
  "offline",
  "notFound",
  "search",
  "home",
  "about",
  "contact",
  "gallery",
  "faq",
  "privacy",
  "prayer",
  "jumuah",
  "lectures",
  "events",
  "news",
  "donate",
  "zakat",
  "transparency",
  "newcomers",
  "halal",
  "dictionary",
  "programs",
  "booking",
  "islam",
  "app",
  "qibla",
  "dua",
  "tasbih",
  "quran",
  "hijri",
  "live",
  "help",
  "radar",
  "settings",
  "admin",
] as const;

export type Namespace = (typeof NAMESPACES)[number];

type MessageTree = { [key: string]: string | MessageTree };

async function loadNamespace(locale: Locale, ns: Namespace): Promise<MessageTree> {
  try {
    const mod = (await import(`./${locale}/${ns}.json`)) as { default: MessageTree };
    return mod.default ?? {};
  } catch {
    return {};
  }
}

async function loadLocale(locale: Locale): Promise<MessageTree> {
  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => [ns, await loadNamespace(locale, ns)] as const),
  );
  return Object.fromEntries(entries);
}

/**
 * Gabungkan pesan bahasa dengan fallback EN: kunci yang hilang atau kosong di
 * bahasa target diisi dari EN (PRD §7: "fallback ke EN bila terjemahan kosong").
 */
function mergeWithFallback(fallback: MessageTree, target: MessageTree): MessageTree {
  const out: MessageTree = { ...fallback };
  for (const [key, value] of Object.entries(target)) {
    const base = fallback[key];
    if (typeof value === "string") {
      if (value.trim() !== "") out[key] = value;
      else if (base !== undefined) out[key] = base;
      else out[key] = value;
    } else if (value && typeof value === "object") {
      out[key] =
        base && typeof base === "object" ? mergeWithFallback(base, value) : value;
    }
  }
  return out;
}

/**
 * Namespace yang hanya dibaca di server (`getTranslations`). Tidak ada komponen browser yang
 * memakainya lewat `useTranslations`, jadi tidak dikirim ke browser: setiap halaman publik menjadi
 * sekitar 70 KB lebih kecil (sebelum kompresi) per bahasa. Tes `client-messages.test.ts` menjaga
 * agar daftar ini tetap benar ketika kode berubah.
 */
export const SERVER_ONLY_NAMESPACES: readonly Namespace[] = ["admin", "footer", "metadata", "offline", "home", "about", "privacy", "jumuah", "transparency", "islam", "app"];

/** Pesan untuk `NextIntlClientProvider`: semua namespace kecuali yang hanya dipakai server. */
export function clientMessages<T extends Record<string, unknown>>(messages: T): Partial<T> {
  const skip = new Set<string>(SERVER_ONLY_NAMESPACES);
  return Object.fromEntries(Object.entries(messages).filter(([namespace]) => !skip.has(namespace))) as Partial<T>;
}

export async function loadMessages(locale: Locale): Promise<MessageTree> {
  if (locale === "en") return loadLocale("en");
  const [own, en] = await Promise.all([loadLocale(locale), loadLocale("en")]);
  return mergeWithFallback(en, own);
}
