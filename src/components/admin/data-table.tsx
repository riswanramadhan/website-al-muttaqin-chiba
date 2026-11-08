"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { useAdminT } from "@/components/admin/i18n-context";

export type DataColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  /** Kolom utama: tampil sebagai judul kartu di mobile. */
  primary?: boolean;
  /** Sembunyikan di kartu mobile. */
  hideOnMobile?: boolean;
};

export type DataFilter<T> = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  predicate: (row: T, value: string) => boolean;
};

/**
 * Tabel data responsif: <table> di layar >= md, kartu di mobile. Pencarian dan filter
 * dilakukan di client (data admin kecil). Aksi per baris lewat kolom `render`.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  filters = [],
  emptyTitle,
  emptyIcon,
  toolbar,
  className,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  /** Teks yang dicari per baris; tanpa ini kotak pencarian disembunyikan. */
  searchText?: (row: T) => string;
  filters?: DataFilter<T>[];
  emptyTitle?: string;
  emptyIcon?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
}) {
  const { t } = useAdminT();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState<Record<string, string>>({});

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && searchText && !searchText(row).toLowerCase().includes(q)) return false;
      for (const f of filters) {
        const v = active[f.key];
        if (v && v !== "all" && !f.predicate(row, v)) return false;
      }
      return true;
    });
  }, [rows, query, active, filters, searchText]);

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(searchText || filters.length > 0 || toolbar) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {searchText && (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("content.searchPlaceholder")} className="pl-11" aria-label={t("common.search")} />
            </div>
          )}
          {filters.map((f) => (
            <div key={f.key} className="md:w-48">
              <Select value={active[f.key] ?? "all"} onChange={(e) => setActive((prev) => ({ ...prev, [f.key]: e.target.value }))} aria-label={f.label}>
                <option value="all">{f.label}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
          {toolbar && <div className="flex flex-wrap items-center gap-2 md:ml-auto">{toolbar}</div>}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("content.listCount", { count: visible.length, total: rows.length })}</p>

      {visible.length === 0 ? (
        <EmptyState icon={emptyIcon} title={rows.length === 0 ? (emptyTitle ?? t("common.noData")) : t("common.noResults")} />
      ) : (
        <>
          {/* Desktop: tabel */}
          <div className="card-surface hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <tr>
                    {columns.map((c) => (
                      <th key={c.key} scope="col" className={cn("px-4 py-3 font-semibold", c.className)}>
                        {c.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visible.map((row) => (
                    <tr key={rowKey(row)} className="align-top transition-colors hover:bg-surface/60">
                      {columns.map((c) => (
                        <td key={c.key} className={cn("px-4 py-3", c.className)}>
                          {c.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: kartu */}
          <ul className="flex flex-col gap-3 md:hidden">
            {visible.map((row) => (
              <li key={rowKey(row)} className="card-surface p-4">
                <div className="text-sm font-semibold">{primary.render(row)}</div>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                  {rest.map((c) => (
                    <React.Fragment key={c.key}>
                      <dt className="text-xs font-medium text-muted-foreground">{c.header}</dt>
                      <dd className="min-w-0">{c.render(row)}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
