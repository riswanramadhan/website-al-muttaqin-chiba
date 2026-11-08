import type { DictionaryCategory, DictionaryEntry, HaramIngredient, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";

/** Katakana ke hiragana supaya "ゼラチン" cocok dengan "ぜらちん". */
function kataToHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/**
 * Normalisasi untuk pencarian: NFKC, huruf kecil, tanpa diakritik (kyūkyū = kyukyu),
 * katakana menjadi hiragana, tanpa spasi/apostrof/tanda baca ringan.
 */
export function normalize(s: string): string {
  return kataToHira(
    s
      .normalize("NFKC")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, ""),
  ).replace(/[\s'’\-()（）.,、。]/g, "");
}

/** Benar bila setiap kata kueri ditemukan di salah satu field. */
export function matchesQuery(fields: (string | undefined)[], query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = fields.filter((f): f is string => Boolean(f)).map(normalize);
  return terms.every((term) => haystack.some((h) => h.includes(term)));
}

export type DictionaryFilter = DictionaryCategory | "all";

export function filterDictionary(entries: DictionaryEntry[], query: string, category: DictionaryFilter, locale: Locale): DictionaryEntry[] {
  const q = query.trim();
  return entries.filter((e) => {
    if (category !== "all" && e.category !== category) return false;
    if (!q) return true;
    return matchesQuery(
      [e.japanese, e.reading, pick(e.meaning, locale), e.meaning.en, e.meaning.ja, e.meaning.id, e.example?.ja, e.example ? pick(e.example.translation, locale) : undefined],
      q,
    );
  });
}

export type IngredientFilter = HaramIngredient["status"] | "all";

export function filterIngredients(items: HaramIngredient[], query: string, status: IngredientFilter, locale: Locale): HaramIngredient[] {
  const q = query.trim();
  return items.filter((i) => {
    if (status !== "all" && i.status !== status) return false;
    if (!q) return true;
    return matchesQuery([i.kanji, i.kana, i.romaji, pick(i.meaning, locale), i.meaning.en, i.meaning.ja, i.meaning.id, i.note?.en, i.note?.ja, i.note?.id], q);
  });
}
