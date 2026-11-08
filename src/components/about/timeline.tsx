import * as React from "react";
import type { Locale, TimelineItem } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";

/** Garis waktu vertikal sejarah masjid (PRD-03a). */
export function Timeline({ items, locale }: { items: TimelineItem[]; locale: Locale }) {
  return (
    <ol className="relative space-y-8 border-l border-border pl-8 sm:pl-10">
      {items.map((item, i) => (
        <li key={`${item.year}-${i}`} className="relative">
          <span className="absolute top-1.5 -left-8 flex size-4 items-center justify-center sm:-left-10" aria-hidden>
            <span className="size-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary ring-1 ring-border" />
          </span>
          <p className="text-sm font-bold text-brand tabular">{item.year}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">{pick(item.title, locale)}</h3>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">{pick(item.description, locale)}</p>
        </li>
      ))}
    </ol>
  );
}
