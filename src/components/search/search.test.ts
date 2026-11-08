import { describe, expect, it } from "vitest";
import type { SearchDocument } from "@/lib/types";
import { NAV_GROUPS } from "@/components/site/nav-config";
import { buildPageItems, groupResults, isLocale, localizeDocuments, normalizeText, scoreItem, searchItems, tokenize, type SearchItem } from "./search";

const docs: SearchDocument[] = [
  {
    id: "e-1",
    type: "event",
    title: { ja: "金曜礼拝のご案内", en: "Friday prayer guide", id: "Panduan salat Jumat" },
    excerpt: { ja: "毎週金曜日", en: "Every Friday at the mosque", id: "Setiap Jumat di masjid" },
    href: "/events/friday",
  },
  {
    id: "l-1",
    type: "lecture",
    title: { ja: "タフシール勉強会", en: "Tafsir study circle", id: "Kajian tafsir" },
    excerpt: { ja: "アル・ファーティハ", en: "Surah Al-Fatihah explained", id: "Penjelasan surah Al-Fatihah" },
    href: "/lectures/tafsir",
    keywords: ["Ustadz Ahmad", "prayer"],
  },
  {
    id: "n-1",
    type: "news",
    title: { ja: "ラマダン報告", en: "Ramadan report", id: "Laporan Ramadan" },
    excerpt: { ja: "イフタール", en: "Iftar together and prayer nights", id: "Buka puasa bersama" },
    href: "/news/ramadan",
  },
];

describe("normalizeText / tokenize", () => {
  it("lowercases, strips diacritics and collapses spaces", () => {
    expect(normalizeText("  Café   ÉID ")).toBe("cafe eid");
  });
  it("normalizes full-width characters", () => {
    expect(normalizeText("ＡＢＣ")).toBe("abc");
  });
  it("splits into unique terms and ignores empty queries", () => {
    expect(tokenize("Prayer prayer  times")).toEqual(["prayer", "times"]);
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("searchItems", () => {
  const items = localizeDocuments(docs, "en");

  it("ranks title matches above keyword and excerpt matches", () => {
    const results = searchItems(items, "prayer");
    expect(results.map((r) => r.id)).toEqual(["e-1", "l-1", "n-1"]);
    expect(results[0].score).toBeGreaterThan(results[1].score);
    expect(results[1].score).toBeGreaterThan(results[2].score);
  });

  it("requires every term to match", () => {
    expect(searchItems(items, "friday mosque").map((r) => r.id)).toEqual(["e-1"]);
    expect(searchItems(items, "friday tafsir")).toEqual([]);
  });

  it("localizes titles and still matches titles in other languages with low weight", () => {
    const id = localizeDocuments(docs, "id");
    const res = searchItems(id, "tafsir");
    expect(res[0].title).toBe("Kajian tafsir");
    const ja = localizeDocuments(docs, "ja");
    const cross = searchItems(ja, "ramadan");
    expect(cross).toHaveLength(1);
    expect(cross[0].title).toBe("ラマダン報告");
  });

  it("matches Japanese text", () => {
    const ja = localizeDocuments(docs, "ja");
    expect(searchItems(ja, "礼拝")[0].id).toBe("e-1");
  });

  it("returns nothing for an empty query and respects the limit", () => {
    expect(searchItems(items, "")).toEqual([]);
    const many: SearchItem[] = Array.from({ length: 40 }, (_, i) => ({ id: `x${i}`, type: "faq", title: `Question ${i}`, excerpt: "", href: `/faq#${i}` }));
    expect(searchItems(many, "question")).toHaveLength(20);
    expect(searchItems(many, "question", 5)).toHaveLength(5);
  });

  it("gives an exact title match a bonus", () => {
    const list: SearchItem[] = [
      { id: "a", type: "page", title: "Halal guide and places", excerpt: "", href: "/a" },
      { id: "b", type: "page", title: "Halal", excerpt: "", href: "/b" },
    ];
    expect(searchItems(list, "halal")[0].id).toBe("b");
    expect(scoreItem(list[1], ["halal"])).toBeGreaterThan(scoreItem(list[0], ["halal"]));
  });
});

describe("buildPageItems", () => {
  const nav: Record<string, string> = { prayerTimes: "Prayer times", "descriptions.prayerTimes": "Daily times", "groups.worship": "Worship", donate: "Infaq", privacy: "Privacy policy" };
  const app: Record<string, string> = { title: "Jamaah App", "screens.qibla": "Qibla" };
  const items = buildPageItems({
    groups: NAV_GROUPS,
    appScreens: [{ key: "qibla", href: "/app/qibla" }, { key: "unknown", href: "/app/unknown" }],
    extra: [{ key: "privacy", href: "/privacy" }],
    navT: (k) => nav[k],
    appT: (k) => app[k],
  });

  it("only includes pages with a translated title", () => {
    expect(items.map((i) => i.href)).toEqual(["/prayer-times", "/donate", "/privacy", "/app/qibla"]);
  });

  it("finds static pages by title and group keyword", () => {
    expect(searchItems(items, "prayer")[0].href).toBe("/prayer-times");
    expect(searchItems(items, "worship")[0].href).toBe("/prayer-times");
    expect(searchItems(items, "qibla")[0].href).toBe("/app/qibla");
  });
});

describe("groupResults / isLocale", () => {
  it("groups results by type in display order", () => {
    const results = searchItems(localizeDocuments(docs, "en"), "prayer");
    expect(groupResults(results).map((g) => g.type)).toEqual(["event", "lecture", "news"]);
  });
  it("validates locales", () => {
    expect(isLocale("ja")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});
