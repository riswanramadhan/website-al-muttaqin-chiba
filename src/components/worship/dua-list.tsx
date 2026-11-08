"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Eye, EyeOff, RotateCcw, Search, Share2 } from "lucide-react";
import type { Dua, DuaCategory, Locale } from "@/lib/types";
import { pick, tokyoParts } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Progress } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { ArabicSizeControl, useArabicSizeClass } from "./arabic-size-control";
import { useIsClient } from "./storage";
import { normalizeSearch } from "./utils";

const CATEGORIES: DuaCategory[] = ["morning", "evening", "daily", "prayer", "travel", "ramadan", "jumuah"];

function duaToText(dua: Dua, locale: Locale): string {
  return [pick(dua.title, locale), dua.arabic, dua.transliteration, pick(dua.translation, locale), `(${dua.source})`].join("\n\n");
}

export function DuaList({ duas, locale }: { duas: Dua[]; locale: Locale }) {
  const t = useTranslations("dua");
  const isClient = useIsClient();
  const toast = useToast();
  const arabicClass = useArabicSizeClass();

  const [chosen, setChosen] = React.useState<DuaCategory | null>(null);
  const [query, setQuery] = React.useState("");
  const [showTranslit, setShowTranslit] = React.useState(true);
  const [counts, setCounts] = React.useState<Record<string, number>>({});

  // Sebelum Zuhur (jam Tokyo < 12) tampilkan dzikir pagi, selain itu petang. Dievaluasi setelah mount.
  const autoCategory: DuaCategory = isClient && tokyoParts(new Date()).hour >= 12 ? "evening" : "morning";
  const active = chosen ?? autoCategory;

  const normalizedQuery = normalizeSearch(query.trim());
  const byCategory = React.useMemo(() => {
    const map: Record<DuaCategory, Dua[]> = { morning: [], evening: [], daily: [], prayer: [], travel: [], ramadan: [], jumuah: [] };
    for (const d of duas) map[d.category].push(d);
    return map;
  }, [duas]);

  function matches(d: Dua): boolean {
    if (!normalizedQuery) return true;
    const hay = normalizeSearch([pick(d.title, locale), d.transliteration, pick(d.translation, locale), d.arabic, d.source].join(" "));
    return hay.includes(normalizedQuery);
  }

  function tap(dua: Dua) {
    const total = dua.repeat ?? 1;
    setCounts((prev) => {
      const current = prev[dua.id] ?? 0;
      return { ...prev, [dua.id]: current >= total ? 0 : current + 1 };
    });
  }

  function reset(id: string) {
    setCounts((prev) => ({ ...prev, [id]: 0 }));
  }

  async function copy(dua: Dua) {
    try {
      await navigator.clipboard.writeText(duaToText(dua, locale));
      toast({ title: t("actions.copied"), tone: "success" });
    } catch {
      toast({ title: t("actions.copied"), tone: "default" });
    }
  }

  async function share(dua: Dua) {
    const text = duaToText(dua, locale);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: pick(dua.title, locale), text });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await copy(dua);
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={active} onValueChange={(v) => setChosen(v as DuaCategory)}>
        <TabsList aria-label={t("categoriesLabel")} className="flex h-auto w-full justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c} className="h-9 px-3.5">
              {t(`categories.${c}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-3 flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">{t("autoHint")}</p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search.placeholder")} aria-label={t("search.placeholder")} className="pl-10" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ArabicSizeControl labels={{ label: t("arabicSize.label"), sm: t("arabicSize.sm"), md: t("arabicSize.md"), lg: t("arabicSize.lg") }} />
            <Button variant="ghost" size="sm" onClick={() => setShowTranslit((v) => !v)} aria-pressed={showTranslit}>
              {showTranslit ? <EyeOff /> : <Eye />}
              {showTranslit ? t("transliteration.hide") : t("transliteration.show")}
            </Button>
          </div>
        </div>

        {CATEGORIES.map((c) => {
          const list = byCategory[c].filter(matches);
          return (
            <TabsContent key={c} value={c} className="mt-4">
              <p className="mb-3 text-xs font-semibold text-muted-foreground">{t("search.count", { count: list.length })}</p>
              {list.length === 0 ? (
                <EmptyState icon={<Search />} title={t("search.empty")} />
              ) : (
                <ul className="flex flex-col gap-3">
                  {list.map((dua) => (
                    <li key={dua.id}>
                      <DuaCard
                        dua={dua}
                        locale={locale}
                        arabicClass={arabicClass}
                        showTranslit={showTranslit}
                        count={counts[dua.id] ?? 0}
                        onTap={() => tap(dua)}
                        onReset={() => reset(dua.id)}
                        onCopy={() => copy(dua)}
                        onShare={() => share(dua)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function DuaCard({
  dua,
  locale,
  arabicClass,
  showTranslit,
  count,
  onTap,
  onReset,
  onCopy,
  onShare,
}: {
  dua: Dua;
  locale: Locale;
  arabicClass: string;
  showTranslit: boolean;
  count: number;
  onTap: () => void;
  onReset: () => void;
  onCopy: () => void;
  onShare: () => void;
}) {
  const t = useTranslations("dua");
  const total = dua.repeat ?? 1;
  const done = count >= total;

  return (
    <article className="card-surface flex flex-col gap-3 p-4" id={dua.id}>
      <header className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold leading-snug">{pick(dua.title, locale)}</h2>
        <Badge variant={total > 1 ? "soft" : "outline"} className="shrink-0">
          {t("repeat", { count: total })}
        </Badge>
      </header>

      <p lang="ar" dir="rtl" className={cn("font-arabic text-right text-foreground", arabicClass)}>
        {dua.arabic}
      </p>

      {showTranslit && <p className="text-sm leading-relaxed text-muted-foreground italic">{dua.transliteration}</p>}
      <p className="text-sm leading-relaxed">{pick(dua.translation, locale)}</p>
      <p className="text-xs text-muted-foreground">
        {t("source")}: {dua.source}
      </p>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTap}
            aria-label={`${t("counter.tap")} (${t("counter.progress", { count, total })})`}
            className={cn(
              "flex h-11 flex-1 items-center justify-between rounded-full px-4 text-sm font-semibold transition-colors active:scale-[0.98]",
              done ? "bg-success/15 text-success" : "bg-accent text-accent-foreground hover:bg-accent/80",
            )}
          >
            <span>{done ? t("counter.done") : t("counter.tap")}</span>
            <span className="tabular">
              {done && <Check className="mr-1 inline size-4" aria-hidden />}
              {t("counter.progress", { count, total })}
            </span>
          </button>
          <Button variant="outline" size="iconSm" onClick={onReset} aria-label={t("counter.reset")} disabled={count === 0}>
            <RotateCcw />
          </Button>
        </div>
        {total > 1 && <Progress value={count} max={total} tone={done ? "success" : "brand"} label={t("counter.label")} className="h-1.5" />}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCopy}>
            <Copy />
            {t("actions.copy")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onShare}>
            <Share2 />
            {t("actions.share")}
          </Button>
        </div>
      </div>
    </article>
  );
}
