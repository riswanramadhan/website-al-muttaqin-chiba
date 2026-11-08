import { describe, expect, it } from "vitest";
import { buildCsv, isoToJstLocal, jstLocalToIso, parseTags, slugify, textOrNull } from "@/components/admin/utils";
import { t } from "@/components/admin/i18n";
import idMessages from "@/messages/id/admin.json";
import jaMessages from "@/messages/ja/admin.json";
import enMessages from "@/messages/en/admin.json";

type Tree = { [key: string]: string | Tree };
const flat = (o: Tree, p = ""): string[] => Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [p + k] : flat(v, `${p}${k}.`)));

describe("admin i18n", () => {
  it("kunci admin.json identik di ketiga bahasa", () => {
    const id = flat(idMessages as Tree).sort();
    expect(flat(jaMessages as Tree).sort()).toEqual(id);
    expect(flat(enMessages as Tree).sort()).toEqual(id);
  });

  it("menerjemahkan, menyisipkan variabel, dan fallback ke kunci", () => {
    expect(t("ja", "common.save")).toBe("保存");
    expect(t("id", "content.listCount", { count: 2, total: 5 })).toBe("2 dari 5 data");
    expect(t("id", "tidak.ada")).toBe("tidak.ada");
  });
});

describe("admin utils", () => {
  it("konversi datetime-local JST <-> ISO UTC", () => {
    expect(isoToJstLocal("2026-11-07T10:00:00.000Z")).toBe("2026-11-07T19:00");
    expect(jstLocalToIso("2026-11-07T19:00")).toBe("2026-11-07T10:00:00.000Z");
    expect(isoToJstLocal(null)).toBe("");
    expect(jstLocalToIso("")).toBe("");
  });

  it("slug, tag, dan teks kosong", () => {
    expect(slugify("Kajian Sabtu: Adab Bertetangga!")).toBe("kajian-sabtu-adab-bertetangga");
    expect(parseTags(" akidah, , fiqih ")).toEqual(["akidah", "fiqih"]);
    expect(textOrNull({ ja: " ", en: "", id: "" })).toBeNull();
  });

  it("CSV dengan BOM dan escape tanda kutip/koma", () => {
    const csv = buildCsv(["a", "b"], [["x, y", 'say "hi"'], [null, true]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe('﻿a,b\r\n"x, y","say ""hi"""\r\n,true');
  });
});
