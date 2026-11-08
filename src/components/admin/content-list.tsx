"use client";

import * as React from "react";
import Link from "next/link";
import { Archive, FileText, Pencil, Plus, Rocket, Undo2 } from "lucide-react";
import type { LocalizedText } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { setContentStatus } from "@/actions/admin/content";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatAdminDateTime } from "@/components/admin/utils";
import type { ContentEntity, ContentStatus } from "@/components/admin/types";

export type ContentListRow = {
  id: string;
  title: LocalizedText;
  slug: string;
  status: ContentStatus;
  /** Tanggal utama (terbit / mulai / tanggal Jumat), ISO atau YYYY-MM-DD. */
  date: string | null;
  /** Kategori / bahasa / pembicara untuk kolom kedua. */
  meta: string;
  /** Kunci kategori untuk filter (opsional). */
  category?: string;
  /** Jalur publik tanpa prefix locale. */
  publicPath?: string;
};

/** Tabel konten generik (5 entitas): status, judul ID, tanggal, aksi cepat terbit/arsip. */
export function ContentList({
  entity,
  rows,
  guard,
  categories,
  dateOnly,
}: {
  entity: ContentEntity;
  rows: ContentListRow[];
  guard: "demo" | "role" | undefined;
  categories?: { value: string; label: string }[];
  dateOnly?: boolean;
}) {
  const { t, lang } = useAdminT();
  const { run, pending } = useAdminAction();

  const changeStatus = (row: ContentListRow, status: ContentStatus) =>
    run(() => setContentStatus({ entity, id: row.id, status }), { success: status === "published" ? t("common.published") : t("common.updated") });

  const quick = (row: ContentListRow) => {
    const next: ContentStatus = row.status === "published" ? (entity === "jumuah" ? "draft" : "archived") : "published";
    const Icon = next === "published" ? Rocket : entity === "jumuah" ? Undo2 : Archive;
    const label = next === "published" ? t("common.publish") : entity === "jumuah" ? t("common.unpublish") : t("common.archive");
    const button = (
      <Button variant="ghost" size="iconSm" aria-label={label} disabled={Boolean(guard) || pending} onClick={() => changeStatus(row, next)}>
        <Icon />
      </Button>
    );
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{button}</span>
        </TooltipTrigger>
        <TooltipContent>{guard === "demo" ? t("common.demoDisabled") : guard === "role" ? t("common.readOnlyRole") : label}</TooltipContent>
      </Tooltip>
    );
  };

  const columns: DataColumn<ContentListRow>[] = [
    {
      key: "title",
      header: t("common.title"),
      primary: true,
      render: (row) => (
        <div className="min-w-0">
          <Link href={`/admin/${entity}/${row.id}`} className="font-semibold hover:text-brand">
            {row.title.id || row.title.en || row.title.ja || row.slug}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.slug}</p>
        </div>
      ),
    },
    { key: "meta", header: t("fields.category"), render: (row) => <span className="text-muted-foreground">{row.meta}</span> },
    { key: "status", header: t("common.status"), render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "date",
      header: t("common.date"),
      className: "whitespace-nowrap",
      render: (row) => <span className="tabular text-muted-foreground">{row.date ? (dateOnly ? row.date : formatAdminDateTime(row.date, lang)) : "-"}</span>,
    },
    {
      key: "actions",
      header: t("common.actions"),
      className: "text-right",
      render: (row) => (
        <div className="flex items-center gap-1 md:justify-end">
          <Link href={`/admin/${entity}/${row.id}`} className={cn(buttonVariants({ variant: "ghost", size: "iconSm" }))} aria-label={t("common.edit")}>
            <Pencil />
          </Link>
          {quick(row)}
        </div>
      ),
    },
  ];

  const statusOptions = (entity === "jumuah" ? ["published", "draft"] : ["published", "draft", "archived"]).map((s) => ({ value: s, label: t(`status.${s}`) }));

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      searchText={(r) => `${r.title.id} ${r.title.en} ${r.title.ja} ${r.slug} ${r.meta}`}
      filters={[
        { key: "status", label: t("content.filterStatus"), options: statusOptions, predicate: (r, v) => r.status === v },
        ...(categories ? [{ key: "category", label: t("fields.category"), options: categories, predicate: (r: ContentListRow, v: string) => r.category === v }] : []),
      ]}
      emptyIcon={<FileText />}
      toolbar={
        <Link href={`/admin/${entity}/new`} className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
          <Plus />
          {t("common.create")}
        </Link>
      }
    />
  );
}
