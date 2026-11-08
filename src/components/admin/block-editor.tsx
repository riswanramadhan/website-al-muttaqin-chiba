"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Copy, Plus, X } from "lucide-react";
import type { ContentBlock, Locale, LocalizedBlocks } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAdminT } from "@/components/admin/i18n-context";
import { LOCALES } from "@/components/admin/utils";

type BlockType = ContentBlock["type"];
const BLOCK_TYPES: BlockType[] = ["p", "h2", "h3", "ul", "ol", "quote", "callout", "arabic"];

function newBlock(type: BlockType): ContentBlock {
  switch (type) {
    case "ul":
    case "ol":
      return { type, items: [""] };
    case "quote":
      return { type, text: "", cite: "" };
    case "callout":
      return { type, text: "", title: "", tone: "info" };
    case "arabic":
      return { type, text: "", translation: "" };
    default:
      return { type, text: "" };
  }
}

/** Ganti tipe blok sambil mempertahankan teks sebisa mungkin. */
function convert(block: ContentBlock, type: BlockType): ContentBlock {
  const text = "text" in block ? block.text : block.items.join("\n");
  const next = newBlock(type);
  if ("items" in next) return { ...next, items: text.split("\n") };
  return { ...next, text };
}

/**
 * Editor blok konten sederhana (ContentBlock[]) tanpa library: paragraf, h2, h3, ul, ol,
 * kutipan, callout, teks Arab. Tambah / hapus / naik / turun.
 */
export function BlockEditor({ value, onChange, disabled, lang }: { value: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void; disabled?: boolean; lang?: Locale }) {
  const { t } = useAdminT();
  const [addType, setAddType] = React.useState<BlockType>("p");

  const update = (index: number, block: ContentBlock) => onChange(value.map((b, i) => (i === index ? block : b)));
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 && <p className="card-muted px-4 py-6 text-center text-sm text-muted-foreground">{t("blocks.empty")}</p>}
      {value.map((block, index) => (
        <div key={index} className="card-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{t("blocks.block", { index: index + 1 })}</span>
            <div className="w-44">
              <Select value={block.type} disabled={disabled} onChange={(e) => update(index, convert(block, e.target.value as BlockType))} className="h-9 text-xs" aria-label={t("blocks.block", { index: index + 1 })}>
                {BLOCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`blocks.types.${type}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button type="button" variant="ghost" size="iconSm" disabled={disabled || index === 0} onClick={() => move(index, -1)} aria-label={t("common.moveUp")}>
                <ChevronUp />
              </Button>
              <Button type="button" variant="ghost" size="iconSm" disabled={disabled || index === value.length - 1} onClick={() => move(index, 1)} aria-label={t("common.moveDown")}>
                <ChevronDown />
              </Button>
              <Button type="button" variant="ghost" size="iconSm" disabled={disabled} onClick={() => remove(index)} aria-label={t("common.remove")} className="text-destructive">
                <X />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {"items" in block ? (
              <Textarea
                lang={lang}
                value={block.items.join("\n")}
                disabled={disabled}
                aria-label={t("blocks.items")}
                placeholder={t("blocks.items")}
                onChange={(e) => update(index, { ...block, items: e.target.value.split("\n") })}
                className="min-h-24"
              />
            ) : (
              <Textarea
                lang={block.type === "arabic" ? "ar" : lang}
                dir={block.type === "arabic" ? "rtl" : undefined}
                value={block.text}
                disabled={disabled}
                aria-label={t("blocks.text")}
                placeholder={t("blocks.text")}
                onChange={(e) => update(index, { ...block, text: e.target.value })}
                className={cn(block.type === "h2" && "min-h-12 font-bold", block.type === "h3" && "min-h-12 font-semibold", block.type === "arabic" && "font-arabic text-lg", (block.type === "h2" || block.type === "h3") && "min-h-12")}
              />
            )}
            {block.type === "quote" && (
              <Input lang={lang} value={block.cite ?? ""} disabled={disabled} placeholder={t("blocks.cite")} aria-label={t("blocks.cite")} onChange={(e) => update(index, { ...block, cite: e.target.value })} />
            )}
            {block.type === "arabic" && (
              <Input lang={lang} value={block.translation ?? ""} disabled={disabled} placeholder={t("blocks.translation")} aria-label={t("blocks.translation")} onChange={(e) => update(index, { ...block, translation: e.target.value })} />
            )}
            {block.type === "callout" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem]">
                <Input lang={lang} value={block.title ?? ""} disabled={disabled} placeholder={t("blocks.calloutTitle")} aria-label={t("blocks.calloutTitle")} onChange={(e) => update(index, { ...block, title: e.target.value })} />
                <Select value={block.tone ?? "info"} disabled={disabled} aria-label={t("blocks.tone")} onChange={(e) => update(index, { ...block, tone: e.target.value as "info" | "warning" | "success" })}>
                  {(["info", "warning", "success"] as const).map((tone) => (
                    <option key={tone} value={tone}>
                      {t(`blocks.tones.${tone}`)}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-44">
          <Select value={addType} disabled={disabled} onChange={(e) => setAddType(e.target.value as BlockType)} className="h-9 text-xs" aria-label={t("blocks.add")}>
            {BLOCK_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`blocks.types.${type}`)}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" variant="soft" size="sm" disabled={disabled} onClick={() => onChange([...value, newBlock(addType)])}>
          <Plus />
          {t("blocks.add")}
        </Button>
      </div>
    </div>
  );
}

/** BlockEditor tiga bahasa: tab JA/EN/ID + "Salin dari ID" (menyalin seluruh blok). */
export function LocalizedBlockEditor({ label, value, onChange, disabled, hint }: { label: string; value: LocalizedBlocks; onChange: (value: LocalizedBlocks) => void; disabled?: boolean; hint?: string }) {
  const { t } = useAdminT();
  const [tab, setTab] = React.useState<Locale>("id");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {tab !== "id" && !disabled && (
            <Button type="button" variant="link" size="sm" className="h-auto text-xs" disabled={value.id.length === 0} onClick={() => onChange({ ...value, [tab]: structuredClone(value.id) })}>
              <Copy className="size-3.5" />
              {t("common.copyFromId")}
            </Button>
          )}
          <Tabs value={tab} onValueChange={(v) => setTab(v as Locale)}>
            <TabsList className="h-8 p-0.5">
              {LOCALES.map((l) => (
                <TabsTrigger key={l} value={l} className="h-7 px-2.5 text-xs">
                  <span className={cn("size-1.5 rounded-full", value[l].length > 0 ? "bg-success" : "bg-muted-foreground/40")} aria-hidden />
                  {t(`content.locales.${l}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as Locale)}>
        {LOCALES.map((l) => (
          <TabsContent key={l} value={l} className="mt-0">
            <BlockEditor lang={l} value={value[l]} disabled={disabled} onChange={(blocks) => onChange({ ...value, [l]: blocks })} />
          </TabsContent>
        ))}
      </Tabs>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
