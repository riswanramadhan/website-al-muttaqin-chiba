import { describe, expect, it } from "vitest";
import type { DictionaryEntry, HaramIngredient } from "@/lib/types";
import { formatDistance, haversineKm, sortByDistance } from "./geo";
import { filterDictionary, filterIngredients, matchesQuery, normalize } from "./search";

const MOSQUE = { lat: 35.7876, lng: 139.9031 };
const NISHI_CHIBA = { lat: 35.6207, lng: 140.1085 };

describe("geo", () => {
  it("haversine: zero for the same point", () => {
    expect(haversineKm(MOSQUE, MOSQUE)).toBe(0);
  });

  it("haversine: Matsudo to Nishi-Chiba is roughly 26-28 km", () => {
    const km = haversineKm(MOSQUE, NISHI_CHIBA);
    expect(km).toBeGreaterThan(25);
    expect(km).toBeLessThan(29);
  });

  it("haversine is symmetric", () => {
    expect(haversineKm(MOSQUE, NISHI_CHIBA)).toBeCloseTo(haversineKm(NISHI_CHIBA, MOSQUE), 9);
  });

  it("sortByDistance orders nearest first and keeps items intact", () => {
    const items = [
      { id: "far", coordinates: NISHI_CHIBA },
      { id: "near", coordinates: { lat: 35.789, lng: 139.905 } },
      { id: "self", coordinates: MOSQUE },
    ];
    const sorted = sortByDistance(items, MOSQUE);
    expect(sorted.map((s) => s.id)).toEqual(["self", "near", "far"]);
    expect(sorted[0].distanceKm).toBe(0);
    expect(sorted[1].distanceKm).toBeLessThan(1);
  });

  it("formatDistance switches units sensibly", () => {
    expect(formatDistance(0.004)).toBe("10 m");
    expect(formatDistance(0.35)).toBe("350 m");
    expect(formatDistance(1.234)).toBe("1.2 km");
    expect(formatDistance(27.4)).toBe("27 km");
  });
});

describe("normalize / matchesQuery", () => {
  it("strips macrons and case", () => {
    expect(normalize("Kyūkyūsha")).toBe("kyukyusha");
  });

  it("folds katakana into hiragana and full-width into half-width", () => {
    expect(normalize("ゼラチン")).toBe(normalize("ぜらちん"));
    expect(normalize("ＡＢＣ")).toBe("abc");
  });

  it("matches every term across fields", () => {
    expect(matchesQuery(["豚肉", "butaniku", "Pork"], "pork")).toBe(true);
    expect(matchesQuery(["豚肉", "butaniku", "Pork"], "buta niku")).toBe(true);
    expect(matchesQuery(["豚肉", "butaniku", "Pork"], "beef")).toBe(false);
    expect(matchesQuery(["豚肉"], "")).toBe(true);
  });
});

const entries: DictionaryEntry[] = [
  { id: "a", category: "food", japanese: "豚肉", reading: "ぶたにく (butaniku)", meaning: { ja: "豚の肉", en: "Pork", id: "Daging babi" } },
  { id: "b", category: "worship", japanese: "礼拝", reading: "れいはい (reihai)", meaning: { ja: "礼拝", en: "Prayer", id: "Salat" }, example: { ja: "礼拝をしてもいいですか", translation: { ja: "", en: "May I pray?", id: "Boleh salat?" } } },
  { id: "c", category: "emergency", japanese: "救急車", reading: "きゅうきゅうしゃ (kyūkyūsha)", meaning: { ja: "救急車", en: "Ambulance", id: "Ambulans" } },
];

describe("filterDictionary", () => {
  it("filters by category", () => {
    expect(filterDictionary(entries, "", "food", "en").map((e) => e.id)).toEqual(["a"]);
    expect(filterDictionary(entries, "", "all", "en")).toHaveLength(3);
  });

  it("searches japanese, reading, meaning in any locale and example text", () => {
    expect(filterDictionary(entries, "kyukyu", "all", "id").map((e) => e.id)).toEqual(["c"]);
    expect(filterDictionary(entries, "babi", "all", "ja").map((e) => e.id)).toEqual(["a"]);
    expect(filterDictionary(entries, "pray", "all", "ja").map((e) => e.id)).toEqual(["b"]);
    expect(filterDictionary(entries, "してもいい", "all", "en").map((e) => e.id)).toEqual(["b"]);
  });
});

const ingredients: HaramIngredient[] = [
  { id: "x", kanji: "豚", kana: "ぶた", romaji: "buta", meaning: { ja: "豚", en: "Pig", id: "Babi" }, status: "haram" },
  { id: "y", kanji: "ゼラチン", kana: "ぜらちん", romaji: "zerachin", meaning: { ja: "ゼラチン", en: "Gelatin", id: "Gelatin" }, status: "syubhat", note: { ja: "魚由来なら可", en: "Fish is fine", id: "Ikan boleh" } },
];

describe("filterIngredients", () => {
  it("filters by status and query", () => {
    expect(filterIngredients(ingredients, "", "syubhat", "en").map((i) => i.id)).toEqual(["y"]);
    expect(filterIngredients(ingredients, "ゼラ", "all", "en").map((i) => i.id)).toEqual(["y"]);
    expect(filterIngredients(ingredients, "fish", "all", "id").map((i) => i.id)).toEqual(["y"]);
    expect(filterIngredients(ingredients, "buta", "syubhat", "en")).toHaveLength(0);
  });
});
