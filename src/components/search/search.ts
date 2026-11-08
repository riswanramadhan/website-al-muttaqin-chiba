import type { Locale, SearchDocument } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import type { NavGroup, NavLink } from "@/components/site/nav-config";

/**
 * Pencarian global murni (tanpa I/O): dipakai GET /api/search dan halaman /search.
 * Pencocokan sederhana: huruf kecil + normalisasi Unicode, semua kata harus cocok,
 * skor judul > kata kunci > ringkasan.
 */

export type SearchType = SearchDocument["type"];

/** Dokumen yang sudah dilokalkan ke satu bahasa. */
export type SearchItem = {
  id: string;
  type: SearchType;
  title: string;
  excerpt: string;
  href: string;
  keywords?: string[];
  /** Judul dalam bahasa lain (dicocokkan dengan bobot rendah). */
  altTitles?: string[];
};

export type SearchResult = {
  id: string;
  type: SearchType;
  title: string;
  excerpt: string;
  href: string;
  score: number;
};

export const SEARCH_LIMIT = 20;
export const MAX_QUERY_LENGTH = 100;

/** Urutan tampil kelompok hasil. */
export const SEARCH_TYPE_ORDER: SearchType[] = ["page", "announcement", "event", "lecture", "news", "program", "faq", "dictionary", "dua", "halal"];

export function normalizeText(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  const norm = normalizeText(query.slice(0, MAX_QUERY_LENGTH));
  return norm ? Array.from(new Set(norm.split(" "))) : [];
}

const WEIGHT = { titleExact: 30, titleStart: 18, title: 12, keyword: 6, excerpt: 2, alt: 1 } as const;

/** Skor satu item untuk kumpulan kata; 0 bila ada kata yang tidak cocok di mana pun. */
export function scoreItem(item: SearchItem, terms: string[]): number {
  if (terms.length === 0) return 0;
  const title = normalizeText(item.title);
  const keywords = (item.keywords ?? []).map(normalizeText);
  const excerpt = normalizeText(item.excerpt);
  const alts = (item.altTitles ?? []).map(normalizeText);
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (title.includes(term)) {
      s += WEIGHT.title;
      if (title.startsWith(term)) s += WEIGHT.titleStart - WEIGHT.title;
    }
    if (keywords.some((k) => k.includes(term))) s += WEIGHT.keyword;
    if (excerpt.includes(term)) s += WEIGHT.excerpt;
    if (s === 0 && alts.some((a) => a.includes(term))) s += WEIGHT.alt;
    if (s === 0) return 0;
    total += s;
  }
  if (title === terms.join(" ")) total += WEIGHT.titleExact;
  return total;
}

export function searchItems(items: SearchItem[], query: string, limit = SEARCH_LIMIT): SearchResult[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  const scored: SearchResult[] = [];
  for (const item of items) {
    const score = scoreItem(item, terms);
    if (score > 0) scored.push({ id: item.id, type: item.type, title: item.title, excerpt: item.excerpt, href: item.href, score });
  }
  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return scored.slice(0, Math.max(0, limit));
}

/** Lokalkan dokumen indeks ke satu bahasa. */
export function localizeDocuments(docs: SearchDocument[], locale: Locale): SearchItem[] {
  return docs.map((d) => {
    const title = pick(d.title, locale);
    const altTitles = Array.from(new Set(Object.values(d.title).filter((t) => t && t !== title)));
    return { id: d.id, type: d.type, title, excerpt: pick(d.excerpt, locale), href: d.href, keywords: d.keywords, altTitles };
  });
}

type Translate = (key: string) => string | undefined;

/**
 * Halaman statis dari NAV_GROUPS (judul & deskripsi dari pesan `nav`) dan layar App
 * (judul dari `app.screens`). `navT`/`appT` mengembalikan undefined bila kunci tidak ada.
 */
export function buildPageItems({ groups, appScreens = [], navT, appT, extra = [] }: { groups: NavGroup[]; appScreens?: NavLink[]; navT: Translate; appT?: Translate; extra?: NavLink[] }): SearchItem[] {
  const items: SearchItem[] = [];
  const seen = new Set<string>();
  const push = (item: SearchItem) => {
    if (seen.has(item.href)) return;
    seen.add(item.href);
    items.push(item);
  };
  for (const group of groups) {
    const groupLabel = navT(`groups.${group.key}`);
    for (const link of group.links) {
      const title = navT(link.key);
      if (!title) continue;
      push({ id: `page-${link.key}`, type: "page", title, excerpt: navT(`descriptions.${link.key}`) ?? "", href: link.href, keywords: groupLabel ? [groupLabel] : undefined });
    }
  }
  for (const link of extra) {
    const title = navT(link.key);
    if (title) push({ id: `page-${link.key}`, type: "page", title, excerpt: navT(`descriptions.${link.key}`) ?? "", href: link.href });
  }
  if (appT) {
    const appTitle = appT("title");
    for (const screen of appScreens) {
      const title = appT(`screens.${screen.key}`);
      if (title) push({ id: `app-${screen.key}`, type: "page", title, excerpt: appTitle ?? "", href: screen.href, keywords: appTitle ? [appTitle] : undefined });
    }
  }
  return items;
}

/** Kelompokkan hasil per tipe sesuai SEARCH_TYPE_ORDER, urutan dalam kelompok dipertahankan. */
export function groupResults(results: SearchResult[]): { type: SearchType; items: SearchResult[] }[] {
  const map = new Map<SearchType, SearchResult[]>();
  for (const r of results) {
    const list = map.get(r.type);
    if (list) list.push(r);
    else map.set(r.type, [r]);
  }
  return SEARCH_TYPE_ORDER.filter((t) => map.has(t)).map((type) => ({ type, items: map.get(type) ?? [] }));
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ja" || value === "en" || value === "id";
}

/** Bentuk respons GET /api/search. */
export type SearchApiResponse = { query: string; locale: Locale; results: SearchResult[] };
