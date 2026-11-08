"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BookOpen, ChevronRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale, QuranSurahMeta } from "@/lib/types";
import { formatNumber } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, IconCircle } from "@/components/ui/primitives";
import { useStoredJson } from "./storage";
import { normalizeSearch } from "./utils";
import { surahLocalName } from "./utils";

export type LastRead = { surah: number; ayah: number };
export const LAST_READ_KEY = "acc-quran-last";
const NO_LAST_READ: LastRead | null = null;

type Filter = "all" | "Meccan" | "Medinan";

export function SurahList({ surahs, locale }: { surahs: QuranSurahMeta[]; locale: Locale }) {
  const t = useTranslations("quran");
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [lastRead] = useStoredJson<LastRead | null>(LAST_READ_KEY, NO_LAST_READ);

  const q = normalizeSearch(query.trim());
  const list = surahs.filter((s) => {
    if (filter !== "all" && s.revelationType !== filter) return false;
    if (!q) return true;
    if (String(s.number) === q) return true;
    const hay = normalizeSearch([s.transliteration, s.englishName, s.japaneseName, s.indonesianName, s.name].join(" "));
    return hay.includes(q);
  });

  const continueSurah = lastRead && Number.isInteger(lastRead.surah) ? surahs.find((s) => s.number === lastRead.surah) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {continueSurah && lastRead && (
        <Link href={`/app/quran/${continueSurah.number}#ayah-${lastRead.ayah}`} className="card-surface lift flex items-center gap-3 bg-primary p-4 text-primary-foreground">
          <IconCircle tone="inverse" size="sm">
            <BookOpen />
          </IconCircle>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold opacity-80">{t("continue.title")}</span>
            <span className="block truncate font-bold">{t("continue.body", { surah: continueSurah.transliteration, ayah: formatNumber(lastRead.ayah, locale) })}</span>
          </span>
          <ChevronRight className="size-5 shrink-0" />
        </Link>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search.placeholder")} aria-label={t("search.label")} className="pl-10" />
      </div>

      <div className="flex gap-2" role="group" aria-label={t("filter.label")}>
        {(["all", "Meccan", "Medinan"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "primary" : "outline"} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? t("filter.all") : f === "Meccan" ? t("filter.meccan") : t("filter.medinan")}
          </Button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Search />} title={t("search.empty")} />
      ) : (
        <ol className="flex flex-col gap-2">
          {list.map((s) => (
            <li key={s.number}>
              <Link href={`/app/quran/${s.number}`} className="card-surface lift flex items-center gap-3 p-3">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-sm font-bold tabular")}>{s.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{s.transliteration}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {surahLocalName(s, locale)} · {t("ayahs", { count: s.numberOfAyahs })}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span lang="ar" dir="rtl" className="font-arabic text-xl leading-none">
                    {s.name}
                  </span>
                  <Badge variant="outline" className="px-2 py-0 text-[10px]">
                    {t(`revelation.${s.revelationType}`)}
                  </Badge>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export { surahLocalName };
