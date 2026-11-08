import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { Link, getPathname } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, IconCircle } from "@/components/ui/primitives";
import { runSearch } from "@/components/search/run-search";
import { MAX_QUERY_LENGTH, groupResults } from "@/components/search/search";
import { SEARCH_TYPE_ICONS } from "@/components/search/type-icons";
import { inputClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[] }> };

function readQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const q = readQuery((await searchParams).q);
  const t = await getTranslations({ locale, namespace: "search" });
  return {
    title: q ? t("meta.titleWithQuery", { query: q }) : t("meta.title"),
    description: t("meta.description"),
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const q = readQuery((await searchParams).q);
  const [t, results] = await Promise.all([getTranslations({ locale, namespace: "search" }), runSearch(locale, q)]);
  const groups = groupResults(results);

  return (
    <div className="container-narrow py-12 lg:py-16">
      <SectionHeading as="h1" tag={t("page.tag")} title={t("page.title")} highlight={t("page.highlight")} description={t("page.description")} />

      <form action={getPathname({ href: "/search", locale })} method="get" role="search" className="mt-8 flex gap-2">
        <label htmlFor="search-page-q" className="sr-only">
          {t("title")}
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="search-page-q"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={MAX_QUERY_LENGTH}
            placeholder={t("placeholder")}
            autoComplete="off"
            enterKeyHint="search"
            className={cn(inputClassName, "h-12 rounded-full pl-12 md:text-base")}
          />
        </div>
        <Button type="submit" size="lg">
          {t("submit")}
        </Button>
      </form>

      <div className="mt-10" aria-live="polite">
        {!q ? (
          <EmptyState icon={<Search />} title={t("page.emptyTitle")} description={t("page.emptyBody")} />
        ) : results.length === 0 ? (
          <EmptyState icon={<SearchX />} title={t("noResults", { query: q })} description={t("page.noResultsHint")} />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t("results", { count: results.length })}</p>
            <div className="mt-6 space-y-10">
              {groups.map((g) => {
                const Icon = SEARCH_TYPE_ICONS[g.type];
                return (
                  <section key={g.type} aria-labelledby={`search-group-${g.type}`}>
                    <h2 id={`search-group-${g.type}`} className="flex items-center gap-2 text-lg font-bold">
                      {t(`types.${g.type}`)}
                      <Badge variant="outline">{g.items.length}</Badge>
                    </h2>
                    <ul className="mt-3 divide-y divide-border rounded-2xl border border-border">
                      {g.items.map((r) => (
                        <li key={r.id}>
                          <Link href={r.href} className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-surface/60 sm:px-5">
                            <IconCircle size="sm" tone="soft" shape="square">
                              <Icon />
                            </IconCircle>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold">{r.title}</span>
                              {r.excerpt && <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{r.excerpt}</span>}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
