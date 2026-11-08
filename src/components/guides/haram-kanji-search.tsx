"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, ShieldAlert, TriangleAlert } from "lucide-react";
import type { HaramIngredient, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";
import { filterIngredients, type IngredientFilter } from "./search";

const FILTERS: IngredientFilter[] = ["all", "haram", "syubhat"];

/** Pencarian kanji bahan haram/syubhat: kanji, kana, romaji, arti; filter status; salin kanji. */
export function HaramKanjiSearch({ items, locale }: { items: HaramIngredient[]; locale: Locale }) {
  const t = useTranslations("halal.search");
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<IngredientFilter>("all");
  const inputId = React.useId();

  const results = React.useMemo(() => filterIngredients(items, query, status, locale), [items, query, status, locale]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor={inputId} className="sr-only">
            {t("placeholder")}
          </label>
          <Input id={inputId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("placeholder")} className="pl-11" autoComplete="off" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("tag")}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={status === f}
              onClick={() => setStatus(f)}
              className={buttonVariants({ variant: status === f ? "primary" : "outline", size: "sm" })}
            >
              {t(`filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t("count", { count: results.length })}
      </p>

      {results.length === 0 ? (
        <EmptyState icon={<Search />} title={t("empty")} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => {
            const haram = item.status === "haram";
            return (
              <li key={item.id} id={`ingredient-${item.id}`} className={cn("card-surface flex flex-col gap-3 p-5", haram ? "border-destructive/30" : "border-warning/30")}>
                <div className="flex items-start justify-between gap-3">
                  <Badge variant={haram ? "destructive" : "warning"}>
                    {haram ? <ShieldAlert /> : <TriangleAlert />}
                    {t(`status.${item.status}`)}
                  </Badge>
                  <CopyButton value={item.kanji} label={t("copy")} variant="ghost" size="sm" className="-mt-1 -mr-2" />
                </div>
                <p lang="ja" className="headline text-4xl leading-tight sm:text-5xl">
                  {item.kanji}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span lang="ja">{item.kana}</span>
                  <span aria-hidden> · </span>
                  <span className="italic">{item.romaji}</span>
                </p>
                <p className="font-semibold">{pick(item.meaning, locale)}</p>
                {item.note && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("noteLabel")}: </span>
                    {pick(item.note, locale)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
