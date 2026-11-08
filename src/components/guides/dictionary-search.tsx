"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, Search, Volume2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { DictionaryEntry, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";
import { filterDictionary, type DictionaryFilter } from "./search";

const CATEGORIES: DictionaryFilter[] = ["all", "worship", "food", "daily", "emergency", "phrases"];
const COMPACT_LIMIT = 6;

const noop = () => () => {};
/** speechSynthesis hanya ada di browser; dibaca lewat useSyncExternalStore agar SSR dan klien cocok. */
function useCanSpeak(): boolean {
  return React.useSyncExternalStore(
    noop,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );
}

function speakJapanese(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

function isCategory(value: string): value is DictionaryFilter {
  return (CATEGORIES as string[]).includes(value);
}

/**
 * Kamus dakwah: cari (Jepang/bacaan/arti), tab kategori, kartu entri, dialog "Tunjukkan"
 * layar penuh dengan teks Jepang sangat besar, salin, dan pengucapan speechSynthesis.
 * `compact`: tanpa hero, kotak cari di atas, maksimal 6 hasil + tautan ke /dictionary.
 */
export function DictionarySearch({ entries, locale, compact = false }: { entries: DictionaryEntry[]; locale: Locale; compact?: boolean }) {
  const t = useTranslations("dictionary");
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<DictionaryFilter>("all");
  const [shownId, setShownId] = React.useState<string | null>(null);
  const [speakingId, setSpeakingId] = React.useState<string | null>(null);
  const canSpeak = useCanSpeak();
  const inputId = React.useId();

  const results = React.useMemo(() => filterDictionary(entries, query, category, locale), [entries, query, category, locale]);
  const visible = compact ? results.slice(0, COMPACT_LIMIT) : results;
  const shownIndex = shownId ? visible.findIndex((e) => e.id === shownId) : -1;
  const shown = shownIndex >= 0 ? visible[shownIndex] : null;

  function speak(entry: DictionaryEntry) {
    const text = entry.example?.ja ?? entry.japanese;
    setSpeakingId(entry.id);
    speakJapanese(text, () => setSpeakingId(null));
  }

  function step(delta: number) {
    if (shownIndex < 0 || visible.length === 0) return;
    const next = (shownIndex + delta + visible.length) % visible.length;
    setShownId(visible[next].id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <label htmlFor={inputId} className="sr-only">
          {t("search.label")}
        </label>
        <Input id={inputId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search.placeholder")} className="pl-11" autoComplete="off" />
      </div>

      <Tabs value={category} onValueChange={(v) => isCategory(v) && setCategory(v)}>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
          <TabsList aria-label={t("categories.all")} className="w-max">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className={cn(compact && "px-3")}>
                {t(`categories.${c}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {compact && results.length > COMPACT_LIMIT ? t("search.showingLimited", { count: COMPACT_LIMIT }) : t("search.count", { count: results.length })}
      </p>

      {visible.length === 0 ? (
        <EmptyState icon={<Search />} title={t("search.empty")} />
      ) : (
        <ul className={cn("grid grid-cols-1 gap-4", !compact && "md:grid-cols-2")}>
          {visible.map((entry) => (
            <li key={entry.id} id={entry.id} className="card-surface flex scroll-mt-28 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="soft">{t(`categories.${entry.category}`)}</Badge>
                {canSpeak && (
                  <Button variant="ghost" size="sm" className="-mt-1 -mr-2" onClick={() => speak(entry)} aria-label={t("entry.speak")} aria-pressed={speakingId === entry.id}>
                    <Volume2 className={cn(speakingId === entry.id && "text-brand")} />
                    <span className="sr-only sm:not-sr-only">{speakingId === entry.id ? t("entry.speaking") : t("entry.speak")}</span>
                  </Button>
                )}
              </div>
              <div>
                <p lang="ja" className={cn("headline leading-tight", compact ? "text-2xl" : "text-3xl sm:text-4xl")}>
                  {entry.japanese}
                </p>
                <p className="mt-1 text-sm text-muted-foreground" lang="ja">
                  {entry.reading}
                </p>
                <p className="mt-1 font-semibold">{pick(entry.meaning, locale)}</p>
              </div>
              {entry.example && (
                <div className="card-muted p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("entry.example")}</p>
                  <p lang="ja" className={cn("mt-1 leading-relaxed font-semibold", compact ? "text-base" : "text-lg")}>
                    {entry.example.ja}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{pick(entry.example.translation, locale)}</p>
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setShownId(entry.id)}>
                  <Maximize2 />
                  {t("entry.show")}
                </Button>
                <CopyButton value={entry.example?.ja ?? entry.japanese} label={t("entry.copy")} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {compact && results.length > COMPACT_LIMIT && (
        <Link href="/dictionary" className={cn(buttonVariants({ variant: "outline" }), "self-start")}>
          {t("search.seeAll")}
          <ArrowRight />
        </Link>
      )}

      <Dialog open={shown !== null} onOpenChange={(open) => !open && setShownId(null)}>
        {shown && (
          <DialogContent
            closeLabel={t("show.close")}
            className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-6 rounded-none border-0 bg-background px-6 py-10 text-center max-h-none"
          >
            <DialogTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("show.title")}</DialogTitle>
            <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6">
              <p lang="ja" className="headline text-4xl leading-snug sm:text-6xl lg:text-7xl">
                {shown.example?.ja ?? shown.japanese}
              </p>
              {shown.example && (
                <p lang="ja" className="text-xl font-semibold text-muted-foreground sm:text-2xl">
                  {shown.japanese}
                  <span className="ml-2 text-base font-normal sm:text-lg">{shown.reading}</span>
                </p>
              )}
              <DialogDescription className="max-w-2xl text-base sm:text-lg">{shown.example ? pick(shown.example.translation, locale) : pick(shown.meaning, locale)}</DialogDescription>
            </div>
            <p className="text-xs text-muted-foreground">{t("show.hint")}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {visible.length > 1 && (
                <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label={t("show.previous")}>
                  <ChevronLeft />
                </Button>
              )}
              {canSpeak && (
                <Button variant="soft" onClick={() => speak(shown)}>
                  <Volume2 />
                  {speakingId === shown.id ? t("entry.speaking") : t("entry.speak")}
                </Button>
              )}
              <CopyButton value={shown.example?.ja ?? shown.japanese} label={t("entry.copy")} size="md" />
              <DialogClose className={buttonVariants({ variant: "primary" })}>{t("show.close")}</DialogClose>
              {visible.length > 1 && (
                <Button variant="outline" size="icon" onClick={() => step(1)} aria-label={t("show.next")}>
                  <ChevronRight />
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
