"use client";

import * as React from "react";
import { ArrowRight, Clock, CornerDownLeft, LoaderCircle, Search, SearchX, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { MAX_QUERY_LENGTH, groupResults, type SearchApiResponse, type SearchResult } from "./search";
import { addSearchHistory, useSearchHistory } from "./search-history";
import { SEARCH_TYPE_ICONS } from "./type-icons";

type FetchState = { query: string; results: SearchResult[]; status: "done" | "error" };

const POPULAR: { key: string; href: string }[] = [
  { key: "prayerTimes", href: "/prayer-times" },
  { key: "jumuah", href: "/jumuah" },
  { key: "events", href: "/events" },
  { key: "halal", href: "/halal" },
  { key: "donate", href: "/donate" },
];

type Option =
  | { kind: "result"; id: string; result: SearchResult }
  | { kind: "history"; id: string; query: string }
  | { kind: "popular"; id: string; href: string; label: string };

/**
 * Dialog pencarian global (Ctrl/Cmd+K): debounce 200 ms ke /api/search, hasil per tipe,
 * navigasi panah atas/bawah + Enter, riwayat 5 pencarian terakhir di localStorage.
 */
export function SearchDialog({ open, onOpenChange, shortcutLabel }: { open: boolean; onOpenChange: (open: boolean) => void; shortcutLabel?: string }) {
  const t = useTranslations("search");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { history, remove, clear } = useSearchHistory();
  const [query, setQuery] = React.useState("");
  const [fetched, setFetched] = React.useState<FetchState | null>(null);
  const [active, setActive] = React.useState(0);
  const listId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  React.useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/search?locale=${encodeURIComponent(locale)}&q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => (res.ok ? (res.json() as Promise<SearchApiResponse>) : Promise.reject(new Error(String(res.status)))))
        .then((data) => {
          if (!controller.signal.aborted) setFetched({ query: trimmed, results: data.results, status: "done" });
        })
        .catch(() => {
          if (!controller.signal.aborted) setFetched({ query: trimmed, results: [], status: "error" });
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, locale]);

  const current = fetched && fetched.query === trimmed ? fetched : null;
  const loading = Boolean(trimmed) && !current;
  const groups = React.useMemo(() => (current ? groupResults(current.results) : []), [current]);

  const options: Option[] = React.useMemo(() => {
    if (trimmed) return groups.flatMap((g) => g.items.map((r): Option => ({ kind: "result", id: r.id, result: r })));
    return [
      ...history.map((q): Option => ({ kind: "history", id: `h-${q}`, query: q })),
      ...POPULAR.map((p): Option => ({ kind: "popular", id: `p-${p.key}`, href: p.href, label: tn(p.key) })),
    ];
  }, [trimmed, groups, history, tn]);

  const activeIndex = options.length === 0 ? -1 : Math.min(active, options.length - 1);
  const optionDomId = (i: number) => `${listId}-opt-${i}`;

  const close = () => onOpenChange(false);

  const goTo = (href: string, saveQuery?: string) => {
    if (saveQuery) addSearchHistory(saveQuery);
    close();
    router.push(href);
  };

  const choose = (opt: Option) => {
    if (opt.kind === "result") goTo(opt.result.href, trimmed);
    else if (opt.kind === "popular") goTo(opt.href);
    else {
      setQuery(opt.query);
      setActive(0);
    }
  };

  const seeAll = () => {
    if (!trimmed) return;
    addSearchHistory(trimmed);
    close();
    router.push({ pathname: "/search", query: { q: trimmed } });
  };

  const moveActive = (delta: number) => {
    if (options.length === 0) return;
    const next = (activeIndex + delta + options.length) % options.length;
    setActive(next);
    const el = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionDomId(next))}`);
    el?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // IME Jepang: Enter untuk konversi kana.
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = activeIndex >= 0 ? options[activeIndex] : undefined;
      if (opt) choose(opt);
      else seeAll();
    }
  };

  const onOpenChangeInternal = (next: boolean) => {
    if (!next) {
      setQuery("");
      setActive(0);
    }
    onOpenChange(next);
  };

  const indexById = new Map(options.map((o, i) => [o.id, i] as const));
  const renderOption = (opt: Option, content: React.ReactNode, extra?: React.ReactNode) => {
    const index = indexById.get(opt.id) ?? -1;
    const selected = index === activeIndex;
    return (
      <div key={opt.id} className="group relative">
        <div
          id={optionDomId(index)}
          role="option"
          aria-selected={selected}
          tabIndex={-1}
          onMouseMove={() => {
            if (activeIndex !== index) setActive(index);
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => choose(opt)}
          className={cn("flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors", selected ? "bg-surface text-foreground" : "text-foreground/90")}
        >
          {content}
          {selected && <CornerDownLeft className="ml-auto size-4 shrink-0 text-muted-foreground" aria-hidden />}
        </div>
        {extra}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeInternal}>
      <DialogContent
        closeLabel={tc("actions.close")}
        className="top-[8dvh] max-h-[84dvh] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("dialogDescription")}</DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4 pr-12">
          {loading ? <LoaderCircle className="size-5 shrink-0 animate-spin text-muted-foreground" aria-hidden /> : <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />}
          <input
            type="search"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? optionDomId(activeIndex) : undefined}
            aria-label={t("title")}
            value={query}
            maxLength={MAX_QUERY_LENGTH}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("placeholder")}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label={t("title")} className="max-h-[60dvh] overflow-y-auto p-2" aria-busy={loading}>
          {trimmed ? (
            <>
              {current?.status === "error" && <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t("error")}</p>}
              {current?.status === "done" && current.results.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-3 py-10 text-center text-sm text-muted-foreground">
                  <SearchX className="size-6" aria-hidden />
                  <p>{t("noResults", { query: trimmed })}</p>
                </div>
              )}
              {loading && <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t("searching")}</p>}
              {groups.map((g) => (
                <div key={g.type} role="group" aria-label={t(`types.${g.type}`)} className="mb-1">
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t(`types.${g.type}`)}</p>
                  {g.items.map((r) => {
                    const Icon = SEARCH_TYPE_ICONS[r.type];
                    return renderOption(
                      { kind: "result", id: r.id, result: r },
                      <>
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground [&_svg]:size-4 [&_svg]:stroke-[1.5]">
                          <Icon aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{r.title}</span>
                          {r.excerpt && <span className="block truncate text-xs text-muted-foreground">{r.excerpt}</span>}
                        </span>
                      </>,
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            <>
              {history.length > 0 && (
                <div role="group" aria-label={t("recent")} className="mb-1">
                  <div className="flex items-center justify-between px-3 pt-2 pb-1">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("recent")}</p>
                    <button type="button" onClick={clear} className="text-xs font-semibold text-brand hover:underline">
                      {t("clear")}
                    </button>
                  </div>
                  {history.map((q) =>
                    renderOption(
                      { kind: "history", id: `h-${q}`, query: q },
                      <>
                        <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="min-w-0 flex-1 truncate pr-8">{q}</span>
                      </>,
                      <button
                        type="button"
                        aria-label={t("removeRecent", { query: q })}
                        onClick={() => remove(q)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground opacity-70 hover:bg-background hover:text-foreground hover:opacity-100"
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>,
                    ),
                  )}
                </div>
              )}
              <div role="group" aria-label={t("popular")}>
                <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("popular")}</p>
                {POPULAR.map((p) =>
                  renderOption(
                    { kind: "popular", id: `p-${p.key}`, href: p.href, label: tn(p.key) },
                    <>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{tn(p.key)}</span>
                    </>,
                  ),
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/60 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="hidden items-center gap-3 sm:flex">
            <span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans">↑</kbd> <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans">↓</kbd> {t("keys.navigate")}
            </span>
            <span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans">Enter</kbd> {t("keys.open")}
            </span>
            {shortcutLabel && <span>{t("hint", { shortcut: shortcutLabel })}</span>}
          </span>
          {trimmed ? (
            <Link
              href={{ pathname: "/search", query: { q: trimmed } }}
              onClick={() => {
                addSearchHistory(trimmed);
                close();
              }}
              className="ml-auto inline-flex items-center gap-1 font-semibold text-brand hover:underline"
            >
              {t("seeAll")}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : (
            <span className="ml-auto">{t("empty")}</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
