import { describe, expect, it } from "vitest";
import { buildSchema, cleanValue, defaultValue, displayText, getAtPath, hydrate, toItemKey, type CmsData } from "@/components/admin/cms/fields";
import { COLLECTIONS, SETTINGS, findCollection, findSetting } from "@/components/admin/cms/registry";
import { t } from "@/components/admin/i18n";
import { collectMediaPaths, mediaPublicPrefix, removedMediaPaths, shouldSkipOptimization } from "@/lib/utils/media";
import { board, facilities, profile, timeline } from "@/data/profile";
import { donationAccounts, donationPrograms, transparencyReports } from "@/data/donations";
import { faqs } from "@/data/faq";
import { gallery } from "@/data/gallery";
import { halalPlaces } from "@/data/halal";
import { documentary } from "@/data/lectures";
import { programs, rooms } from "@/data/programs";
import { promoPopup } from "@/data/promo";

const SEED_COLLECTIONS: Record<string, object[]> = {
  faqs,
  gallery,
  donation_accounts: donationAccounts,
  donation_programs: donationPrograms,
  transparency_reports: transparencyReports,
  programs,
  rooms,
  halal_places: halalPlaces,
  board,
  facilities,
  timeline,
};

const SEED_SETTINGS: Record<string, object> = { profile, featured_video: documentary, promo_popup: promoPopup };

const withoutId = (item: object): CmsData => {
  const { id: _id, ...rest } = item as CmsData;
  void _id;
  return rest;
};

describe("registry CMS selaras dengan tipe data publik", () => {
  it("setiap koleksi punya data seed", () => {
    expect(COLLECTIONS.map((c) => c.name).sort()).toEqual(Object.keys(SEED_COLLECTIONS).sort());
    expect(SETTINGS.map((s) => s.key).sort()).toEqual(Object.keys(SEED_SETTINGS).sort());
  });

  for (const def of COLLECTIONS) {
    it(`koleksi ${def.name}: semua item seed lolos validasi dan tidak kehilangan kolom`, () => {
      const schema = buildSchema(def.fields);
      for (const item of SEED_COLLECTIONS[def.name]) {
        const source = withoutId(item);
        const cleaned = cleanValue(def.fields, source);
        const parsed = schema.safeParse(cleaned);
        expect(parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)).toEqual([]);
        // Menyimpan ulang dari formulir admin tidak boleh mengubah atau membuang data yang ada
        // (boleh menambah nilai bawaan, mis. sakelar yang belum pernah diisi menjadi false).
        expect(parsed.success ? parsed.data : null).toMatchObject(source);
      }
    });
  }

  for (const def of SETTINGS) {
    it(`pengaturan ${def.key}: nilai seed lolos validasi dan tidak kehilangan kolom`, () => {
      const source = SEED_SETTINGS[def.key] as CmsData;
      const parsed = buildSchema(def.fields).safeParse(cleanValue(def.fields, source));
      expect(parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)).toEqual([]);
      expect(parsed.success ? parsed.data : null).toMatchObject(source);
    });
  }

  it("kolom judul, meta, gambar, dan sumber kunci menunjuk kolom yang ada", () => {
    for (const def of COLLECTIONS) {
      const keys = def.fields.map((f) => f.key);
      for (const key of [def.titleField, def.metaField, def.imageField, def.keyFrom]) {
        if (key) expect(keys, `${def.name}.${key}`).toContain(key);
      }
    }
  });

  it("semua label, petunjuk, dan pilihan punya terjemahan Indonesia dan Jepang", () => {
    const missing: string[] = [];
    const check = (key: string) => {
      for (const lang of ["id", "ja"] as const) if (t(lang, key) === key) missing.push(`${lang}:${key}`);
    };
    const walk = (fields: (typeof COLLECTIONS)[number]["fields"]) => {
      for (const f of fields) {
        check(f.label);
        if (f.hint) check(f.hint);
        if (f.type === "select") for (const option of f.options) check(`${f.optionLabel}.${option}`);
        if (f.type === "group" || f.type === "list") walk(f.fields);
      }
    };
    for (const def of COLLECTIONS) {
      walk(def.fields);
      for (const part of ["title", "subtitle", "entity"]) check(`cms.collections.${def.slug}.${part}`);
    }
    for (const def of SETTINGS) {
      walk(def.fields);
      for (const part of ["title", "subtitle", "help"]) check(`cms.settings.${def.slug}.${part}`);
    }
    expect(missing).toEqual([]);
  });
});

describe("cleanValue dan buildSchema", () => {
  const faq = findCollection("faqs")!;
  const account = findCollection("donation-accounts")!;
  const report = findCollection("transparency-reports")!;

  it("membuang kunci di luar definisi dan kolom opsional kosong", () => {
    const cleaned = cleanValue(account.fields, {
      bankName: "  Japan Post Bank ",
      currency: "JPY",
      method: "bank",
      accountNumber: "1234567",
      accountName: "ACC",
      branch: "   ",
      note: { ja: "", en: "", id: "" },
      qrImage: "",
      primary: true,
      injected: "<script>",
    });
    expect(cleaned).toEqual({ bankName: "Japan Post Bank", currency: "JPY", method: "bank", accountNumber: "1234567", accountName: "ACC", primary: true });
    expect(buildSchema(account.fields).safeParse(cleaned).success).toBe(true);
  });

  it("kolom wajib yang kosong menghasilkan errors.required / errors.idRequired", () => {
    const parsed = buildSchema(faq.fields).safeParse(cleanValue(faq.fields, defaultValue(faq.fields)));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const byPath = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
      expect(byPath["question.id"]).toBe("errors.idRequired");
      expect(byPath["answer.id"]).toBe("errors.idRequired");
    }
    const missingNumber = buildSchema(report.fields).safeParse(cleanValue(report.fields, { ...defaultValue(report.fields), period: "2026-11", title: { ja: "", en: "", id: "Laporan" } }));
    expect(missingNumber.success).toBe(false);
    if (!missingNumber.success) {
      const messages = missingNumber.error.issues.filter((i) => i.path.join(".") === "openingBalance").map((i) => i.message);
      expect(messages[0]).toBe("errors.required");
    }
  });

  it("menolak nilai di luar pilihan, URL tidak valid, dan angka di luar batas", () => {
    const schema = buildSchema(findCollection("halal-places")!.fields);
    const base = { name: "Toko", type: "mart", address: "Matsudo", mapsUrl: "https://maps.example.com/x", coordinates: { lat: 35.7, lng: 139.9 }, verified: false };
    expect(schema.safeParse(cleanValue(findCollection("halal-places")!.fields, base)).success).toBe(true);
    for (const bad of [{ type: "bar" }, { mapsUrl: "javascript:alert(1)" }, { coordinates: { lat: 135, lng: 139.9 } }]) {
      expect(schema.safeParse(cleanValue(findCollection("halal-places")!.fields, { ...base, ...bad })).success).toBe(false);
    }
  });

  it("gambar hanya menerima jalur lokal atau https", () => {
    const fields = findCollection("gallery")!.fields;
    const base = { alt: { ja: "", en: "", id: "Foto" }, category: "building", width: 1200, height: 800 };
    const run = (src: string) => buildSchema(fields).safeParse(cleanValue(fields, { ...base, src })).success;
    expect(run("/images/gallery/01.svg")).toBe(true);
    expect(run("https://abc.supabase.co/storage/v1/object/public/media/gallery/a.webp")).toBe(true);
    expect(run("http://tidak-aman.example/a.jpg")).toBe(false);
    expect(run("javascript:alert(1)")).toBe(false);
    expect(run("")).toBe(false);
  });

  it("hydrate mengisi kolom yang belum ada tanpa mengubah nilai tersimpan", () => {
    const hydrated = hydrate(faq.fields, { category: "prayer", question: { ja: "Q", en: "", id: "T" } });
    expect(hydrated.category).toBe("prayer");
    expect(hydrated.question).toEqual({ ja: "Q", en: "", id: "T" });
    expect(hydrated.answer).toEqual({ ja: "", en: "", id: "" });
  });

  it("pengaturan promo: versi dan tujuan divalidasi", () => {
    const fields = findSetting("promo")!.fields;
    const good = { enabled: true, image: { src: "/images/promo/poster-donasi.jpg", width: 1080, height: 1350 }, alt: { ja: "", en: "", id: "Poster" }, href: "/donate", version: "v2" };
    expect(buildSchema(fields).safeParse(cleanValue(fields, good)).success).toBe(true);
    expect(buildSchema(fields).safeParse(cleanValue(fields, { ...good, version: "Versi 2" })).success).toBe(false);
    expect(buildSchema(fields).safeParse(cleanValue(fields, { ...good, image: undefined })).success).toBe(false);
  });
});

describe("util CMS", () => {
  it("toItemKey membuat kunci huruf kecil bertanda hubung", () => {
    expect(toItemKey("Jam Buka Masjid?")).toBe("jam-buka-masjid");
    expect(toItemKey("  Résumé 2026/11  ")).toBe("resume-2026-11");
    expect(toItemKey("日本語")).toBe("");
  });

  it("getAtPath dan displayText", () => {
    const data = { title: { ja: "", en: "Hall", id: "Aula" }, coordinates: { lat: 35.7 }, income: [{ amount: 10 }] };
    expect(displayText(getAtPath(data, "title"))).toBe("Aula");
    expect(getAtPath(data, "coordinates.lat")).toBe(35.7);
    expect(getAtPath(data, "income.0.amount")).toBe(10);
    expect(getAtPath(data, "tidak.ada")).toBeUndefined();
  });
});

describe("util media", () => {
  const prefix = mediaPublicPrefix("https://abc.supabase.co/");

  it("mengumpulkan jalur berkas bucket media dari JSON bersarang", () => {
    expect(prefix).toBe("https://abc.supabase.co/storage/v1/object/public/media/");
    const value = { src: `${prefix}gallery/2026-11/a.webp`, list: [{ logo: { src: `${prefix}partners/b.webp?v=1` } }, "/images/local.png", "https://lain.example/c.jpg"] };
    expect([...collectMediaPaths(value, prefix)].sort()).toEqual(["gallery/2026-11/a.webp", "partners/b.webp"]);
  });

  it("hanya berkas yang tidak lagi dirujuk yang dianggap terhapus", () => {
    const before = { a: `${prefix}x/1.webp`, b: `${prefix}x/2.webp` };
    expect(removedMediaPaths(before, { a: `${prefix}x/1.webp`, b: `${prefix}x/3.webp` }, prefix)).toEqual(["x/2.webp"]);
    expect(removedMediaPaths(before, null, prefix).sort()).toEqual(["x/1.webp", "x/2.webp"]);
    expect(removedMediaPaths({ a: "/images/local.png" }, null, prefix)).toEqual([]);
  });

  it("gambar remote dan SVG tidak dioptimasi ulang", () => {
    expect(shouldSkipOptimization(`${prefix}gallery/a.webp`)).toBe(true);
    expect(shouldSkipOptimization("/images/gallery/01.svg")).toBe(true);
    expect(shouldSkipOptimization("/images/hero.jpg")).toBe(false);
    expect(shouldSkipOptimization(undefined)).toBe(false);
  });
});
