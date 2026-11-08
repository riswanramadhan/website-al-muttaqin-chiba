"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CircleQuestionMark, Search, X } from "lucide-react";
import type { FaqCategory, FaqItem, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const CATEGORIES: FaqCategory[] = ["general", "prayer", "donation", "newcomer", "program", "visit"];

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
function readHash() {
  return window.location.hash.replace(/^#/, "");
}
function serverHash() {
  return "";
}

/**
 * Akordeon FAQ (PRD-03a) dengan kotak cari, filter kategori, dan deep link `#faq-id`
 * yang membuka item terkait. Hash dibaca lewat useSyncExternalStore agar hidrasi aman.
 */
export function FaqAccordion({ items, locale, searchable = true, className }: { items: FaqItem[]; locale: Locale; searchable?: boolean; className?: string }) {
  const t = useTranslations("faq");
  const hash = React.useSyncExternalStore(subscribeHash, readHash, serverHash);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<FaqCategory | "all">("all");
  const [open, setOpen] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);
  const [seenHash, setSeenHash] = React.useState(hash);

  // Hash berubah (klik deep link lain): izinkan hash baru membuka itemnya lagi.
  if (hash !== seenHash) {
    setSeenHash(hash);
    setTouched(false);
  }

  const hashTarget = hash && items.some((i) => i.id === hash) ? hash : "";
  const value = !touched && hashTarget ? Array.from(new Set([...open, hashTarget])) : open;

  const available = CATEGORIES.filter((c) => items.some((i) => i.category === c));
  const q = query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    return pick(item.question, locale).toLowerCase().includes(q) || pick(item.answer, locale).toLowerCase().includes(q);
  });

  function onValueChange(next: string[]) {
    setTouched(true);
    setOpen(next);
  }

  return (
    <div className={cn("space-y-6", className)}>
      {searchable && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.label")}
              className="pl-11 pr-11"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
                aria-label={t("search.clear")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("categories.label")}>
            {(["all", ...available] as const).map((c) => (
              <Button key={c} type="button" size="sm" variant={category === c ? "primary" : "outline"} aria-pressed={category === c} onClick={() => setCategory(c)}>
                {t(`categories.${c}`)}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t("search.results", { count: filtered.length })}
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CircleQuestionMark />}
          title={t("search.emptyTitle")}
          description={t("search.emptyBody")}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              {t("search.reset")}
            </Button>
          }
        />
      ) : (
        <Accordion type="multiple" value={value} onValueChange={onValueChange} className="space-y-3">
          {filtered.map((item) => (
            <AccordionItem key={item.id} value={item.id} id={item.id} className="scroll-mt-28">
              <AccordionTrigger>
                <span className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="shrink-0 text-[0.65rem] font-semibold tracking-wide text-brand uppercase">{t(`categories.${item.category}`)}</span>
                  <span>{pick(item.question, locale)}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>{pick(item.answer, locale)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
