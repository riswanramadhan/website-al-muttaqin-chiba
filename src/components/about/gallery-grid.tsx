"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Expand, Images } from "lucide-react";
import type { GalleryItem, Locale } from "@/lib/types";
import { formatDate, pick } from "@/lib/utils/i18n";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";

type Category = GalleryItem["category"];
const CATEGORIES: Category[] = ["building", "activity", "community", "ramadan", "eid"];

const SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

function isSvg(src: string) {
  return /\.svg($|\?)/i.test(src);
}

/**
 * Galeri foto (PRD-03a): grid masonry responsif, filter kategori, dan lightbox `Dialog`
 * dengan navigasi tombol serta panah keyboard. `limit` menampilkan N item pertama tanpa filter.
 */
export function GalleryGrid({ items, locale, limit, className }: { items: GalleryItem[]; locale: Locale; limit?: number; className?: string }) {
  const t = useTranslations("gallery");
  const tc = useTranslations("common");
  const [category, setCategory] = React.useState<Category | "all">("all");
  const [active, setActive] = React.useState<number | null>(null);

  const compact = typeof limit === "number";
  const available = CATEGORIES.filter((c) => items.some((i) => i.category === c));
  const visible = (compact ? items.slice(0, limit) : items).filter((i) => category === "all" || i.category === category);
  const current = active === null ? null : visible[active];

  const total = visible.length;
  function go(delta: number) {
    setActive((prev) => {
      if (prev === null || total === 0) return prev;
      return (prev + delta + total) % total;
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {!compact && available.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("filters.label")}>
          {(["all", ...available] as const).map((c) => (
            <Button
              key={c}
              type="button"
              size="sm"
              variant={category === c ? "primary" : "outline"}
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setActive(null);
              }}
            >
              {c === "all" ? t("filters.all") : t(`categories.${c}`)}
            </Button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState icon={<Images />} title={t("empty.title")} description={t("empty.body")} />
      ) : (
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
          {visible.map((item, index) => {
            const alt = pick(item.alt, locale);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-surface text-left focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                  aria-label={`${t("lightbox.open")}: ${alt}`}
                >
                  <Image
                    src={item.src}
                    alt={alt}
                    width={item.width}
                    height={item.height}
                    sizes={SIZES}
                    loading="lazy"
                    unoptimized={isSvg(item.src)}
                    className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-hero/80 to-transparent p-4 text-hero-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="text-sm font-semibold leading-snug">{alt}</span>
                    <Expand className="size-4 shrink-0" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={current !== null} onOpenChange={(o) => !o && setActive(null)}>
        {current && active !== null && (
          <DialogContent
            closeLabel={tc("actions.close")}
            onKeyDown={onKeyDown}
            className="max-w-5xl gap-3 bg-hero p-3 text-hero-foreground sm:p-4"
          >
            <div className="relative overflow-hidden rounded-xl bg-hero-foreground/5">
              <Image
                key={current.id}
                src={current.src}
                alt={pick(current.alt, locale)}
                width={current.width}
                height={current.height}
                sizes="(min-width: 1024px) 64rem, 100vw"
                unoptimized={isSvg(current.src)}
                priority
                className="mx-auto h-auto max-h-[70dvh] w-auto max-w-full object-contain"
              />
              {visible.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="inverse"
                    size="icon"
                    onClick={() => go(-1)}
                    aria-label={t("lightbox.previous")}
                    className="absolute top-1/2 left-2 -translate-y-1/2 opacity-90"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="inverse"
                    size="icon"
                    onClick={() => go(1)}
                    aria-label={t("lightbox.next")}
                    className="absolute top-1/2 right-2 -translate-y-1/2 opacity-90"
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1 px-1 pr-8 sm:flex-row sm:items-baseline sm:justify-between">
              <DialogTitle className="text-base font-semibold text-hero-foreground">{pick(current.alt, locale)}</DialogTitle>
              <DialogDescription className="text-xs text-hero-muted tabular">
                {t(`categories.${current.category}`)}
                {current.takenAt ? ` · ${formatDate(current.takenAt, locale, { year: "numeric", month: "short" })}` : ""}
                {" · "}
                {t("lightbox.counter", { current: active + 1, total: visible.length })}
              </DialogDescription>
            </div>
            <p className="sr-only">{t("lightbox.keyboardHint")}</p>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
