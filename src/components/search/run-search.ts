import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getSearchIndex } from "@/lib/data";
import { APP_SCREENS, NAV_GROUPS } from "@/components/site/nav-config";
import { SEARCH_LIMIT, buildPageItems, localizeDocuments, searchItems, type SearchResult } from "./search";

/** Pencarian di server: indeks konten + halaman statis, dilokalkan ke `locale`. */
export async function runSearch(locale: Locale, query: string, limit = SEARCH_LIMIT): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const [docs, navT, appT] = await Promise.all([
    getSearchIndex(),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "app" }),
  ]);
  const pages = buildPageItems({
    groups: NAV_GROUPS,
    appScreens: APP_SCREENS,
    extra: [{ key: "privacy", href: "/privacy" }],
    navT: (key) => (navT.has(key) ? navT(key) : undefined),
    appT: (key) => (appT.has(key) ? appT(key) : undefined),
  });
  return searchItems([...pages, ...localizeDocuments(docs, locale)], query, limit);
}
