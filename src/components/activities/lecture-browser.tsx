"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Lecture, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { LectureCard } from "@/components/activities/lecture-card";

const LANGUAGES: Lecture["language"][] = ["id", "ja", "en", "ar"];

/** Filter bahasa, seri, dan pencarian judul/pemateri/tag di klien dari daftar yang dirender server. */
export function LectureBrowser({ lectures, locale }: { lectures: Lecture[]; locale: Locale }) {
  const t = useTranslations("lectures");
  const [query, setQuery] = React.useState("");
  const [language, setLanguage] = React.useState<"all" | Lecture["language"]>("all");
  const [series, setSeries] = React.useState("all");

  const seriesOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lectures) {
      if (l.series) map.set(l.series.en, pick(l.series, locale));
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [lectures, locale]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return lectures.filter((l) => {
      if (language !== "all" && l.language !== language) return false;
      if (series !== "all" && l.series?.en !== series) return false;
      if (!q) return true;
      const haystack = [l.title.ja, l.title.en, l.title.id, l.speaker, ...l.tags, l.series ? pick(l.series, locale) : ""].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [lectures, query, language, series, locale]);

  const active = query !== "" || language !== "all" || series !== "all";

  function clear() {
    setQuery("");
    setLanguage("all");
    setSeries("all");
  }

  return (
    <div>
      <div className="card-muted grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end sm:p-5">
        <Field label={t("filters.search")} htmlFor="lecture-search">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="lecture-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("filters.searchPlaceholder")} className="pl-10" />
          </div>
        </Field>
        <Field label={t("filters.language")} htmlFor="lecture-language">
          <Select id="lecture-language" value={language} onChange={(e) => setLanguage(e.target.value as "all" | Lecture["language"])} className="sm:w-44">
            <option value="all">{t("filters.allLanguages")}</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {t(`languages.${lang}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("filters.series")} htmlFor="lecture-series">
          <Select id="lecture-series" value={series} onChange={(e) => setSeries(e.target.value)} className="sm:w-52">
            <option value="all">{t("filters.allSeries")}</option>
            {seriesOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p aria-live="polite">{t("filters.results", { count: filtered.length })}</p>
        {active && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <X />
            {t("filters.clear")}
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="mt-4" icon={<Search />} title={t("filters.empty")} action={active ? <Button variant="outline" size="sm" onClick={clear}>{t("filters.clear")}</Button> : undefined} />
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <li key={l.id}>
              <LectureCard lecture={l} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
