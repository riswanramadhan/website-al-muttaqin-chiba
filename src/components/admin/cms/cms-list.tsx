"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, FileText, Pencil, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteItem, moveItem, setItemPublished } from "@/actions/admin/cms";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { formatAdminDateTime } from "@/components/admin/utils";
import { displayText, getAtPath } from "@/components/admin/cms/fields";
import { findCollection } from "@/components/admin/cms/registry";
import type { CmsItem } from "@/components/admin/cms/data.server";

type Guard = "demo" | "role" | undefined;

/** Tabel item sebuah koleksi CMS: pratinjau, judul, status tampil, urutan, dan aksi cepat. */
export function CmsList({ slug, items, guard }: { slug: string; items: CmsItem[]; guard: Guard }) {
  const { t, lang } = useAdminT();
  const { run, pending } = useAdminAction();
  const def = findCollection(slug);
  if (!def) return null;

  const blocked = Boolean(guard) || pending;
  const guardTip = guard === "demo" ? t("common.demoDisabled") : guard === "role" ? t("common.readOnlyRole") : null;
  const metaDef = def.metaField ? def.fields.find((f) => f.key === def.metaField) : undefined;

  const title = (item: CmsItem) => displayText(getAtPath(item.data, def.titleField)) || item.key;
  const meta = (item: CmsItem) => {
    if (!def.metaField) return "";
    const value = getAtPath(item.data, def.metaField);
    if (metaDef?.type === "select" && typeof value === "string") return t(`${metaDef.optionLabel}.${value}`);
    return displayText(value);
  };
  const thumb = (item: CmsItem) => {
    const value = def.imageField ? getAtPath(item.data, def.imageField) : undefined;
    return typeof value === "string" && value && !/\.pdf(\?.*)?$/i.test(value) ? value : null;
  };

  const action = (label: string, icon: React.ReactNode, onClick: () => void, options: { disabled?: boolean; danger?: boolean } = {}) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button variant="ghost" size="iconSm" aria-label={label} className={cn(options.danger && "text-destructive")} disabled={blocked || options.disabled} onClick={onClick}>
            {icon}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{guardTip ?? label}</TooltipContent>
    </Tooltip>
  );

  const remove = (item: CmsItem) => {
    if (!window.confirm(t("content.deleteConfirm", { entity: t(`cms.collections.${def.slug}.entity`) }))) return;
    void run(() => deleteItem({ collection: def.name, id: item.id }), { success: t("common.deleted") });
  };

  const columns: DataColumn<CmsItem>[] = [
    {
      key: "title",
      header: t("common.title"),
      primary: true,
      render: (item) => {
        const src = thumb(item);
        return (
          <div className="flex min-w-0 items-center gap-3">
            {def.imageField && (
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                {src ? <Image src={src} alt="" width={96} height={96} unoptimized className="size-full object-cover" /> : <FileText className="size-4 text-muted-foreground" aria-hidden />}
              </span>
            )}
            <div className="min-w-0">
              <Link href={`/admin/cms/${def.slug}/${item.id}`} className="line-clamp-2 font-semibold hover:text-brand">
                {title(item)}
              </Link>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.key}</p>
            </div>
          </div>
        );
      },
    },
    ...(def.metaField ? [{ key: "meta", header: metaDef ? t(metaDef.label) : "", render: (item: CmsItem) => <span className="text-muted-foreground">{meta(item)}</span> }] : []),
    {
      key: "status",
      header: t("common.status"),
      render: (item) => <Badge variant={item.published ? "success" : "outline"}>{item.published ? t("cms.shown") : t("cms.hidden")}</Badge>,
    },
    {
      key: "updated",
      header: t("common.updatedAt"),
      className: "whitespace-nowrap",
      hideOnMobile: true,
      render: (item) => <span className="tabular text-muted-foreground">{formatAdminDateTime(item.updatedAt, lang)}</span>,
    },
    {
      key: "actions",
      header: t("common.actions"),
      className: "text-right",
      render: (item) => {
        const index = items.findIndex((entry) => entry.id === item.id);
        return (
          <div className="flex flex-wrap items-center gap-1 md:justify-end">
            {action(t("common.moveUp"), <ArrowUp />, () => void run(() => moveItem({ collection: def.name, id: item.id, direction: "up" })), { disabled: index <= 0 })}
            {action(t("common.moveDown"), <ArrowDown />, () => void run(() => moveItem({ collection: def.name, id: item.id, direction: "down" })), { disabled: index === items.length - 1 })}
            {action(
              item.published ? t("cms.hide") : t("cms.show"),
              item.published ? <EyeOff /> : <Eye />,
              () => void run(() => setItemPublished({ collection: def.name, id: item.id, published: !item.published }), { success: t("common.updated") }),
            )}
            <Link href={`/admin/cms/${def.slug}/${item.id}`} className={cn(buttonVariants({ variant: "ghost", size: "iconSm" }))} aria-label={t("common.edit")}>
              <Pencil />
            </Link>
            {action(t("common.delete"), <Trash />, () => remove(item), { danger: true })}
          </div>
        );
      },
    },
  ];

  const toolbar = guard ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={0}>
          <Button variant="primary" size="sm" disabled>
            <Plus />
            {t("common.create")}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{guardTip}</TooltipContent>
    </Tooltip>
  ) : (
    <Link href={`/admin/cms/${def.slug}/new`} className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
      <Plus />
      {t("common.create")}
    </Link>
  );

  return (
    <DataTable
      rows={items}
      columns={columns}
      rowKey={(item) => item.id}
      searchText={(item) => `${title(item)} ${item.key} ${meta(item)} ${JSON.stringify(item.data)}`}
      filters={[
        {
          key: "status",
          label: t("content.filterStatus"),
          options: [
            { value: "shown", label: t("cms.shown") },
            { value: "hidden", label: t("cms.hidden") },
          ],
          predicate: (item, value) => (value === "shown" ? item.published : !item.published),
        },
        ...(metaDef?.type === "select"
          ? [
              {
                key: "meta",
                label: t(metaDef.label),
                options: metaDef.options.map((option) => ({ value: option, label: t(`${metaDef.optionLabel}.${option}`) })),
                predicate: (item: CmsItem, value: string) => getAtPath(item.data, metaDef.key) === value,
              },
            ]
          : []),
      ]}
      emptyIcon={<FileText />}
      toolbar={toolbar}
    />
  );
}
