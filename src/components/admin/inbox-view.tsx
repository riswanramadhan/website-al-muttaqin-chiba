"use client";

import * as React from "react";
import { Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { logInboxExport, updateInboxStatus } from "@/actions/admin/inbox";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { formatAdminDateTime } from "@/components/admin/utils";
import { INBOX_STATUSES, type InboxKind, type InboxRecord } from "@/components/admin/types";

const KINDS: InboxKind[] = ["events", "programs", "bookings", "suggestions", "contact"];

/** Kotak masuk formulir publik: lima tab, ubah status, ekspor CSV per tab. */
export function InboxView({ data, initialTab, guard, demo }: { data: Record<InboxKind, InboxRecord[]>; initialTab: InboxKind; guard: "demo" | "role" | undefined; demo: boolean }) {
  const { t, lang } = useAdminT();
  const { run, pending } = useAdminAction();

  const subjectLabel = (kind: InboxKind) =>
    kind === "events" ? t("inbox.event") : kind === "programs" ? t("inbox.program") : kind === "bookings" ? t("inbox.room") : kind === "suggestions" ? t("inbox.kind") : t("inbox.subject");

  const subjectText = (r: InboxRecord) => {
    if (r.kind !== "suggestions") return r.subject;
    const v = t(`inbox.kinds.${r.subject}`);
    return v === `inbox.kinds.${r.subject}` ? r.subject : v;
  };

  const statusControl = (r: InboxRecord) => {
    const select = (
      <Select
        value={r.status}
        disabled={Boolean(guard) || pending}
        aria-label={t("inbox.changeStatus")}
        className="h-9 min-w-36 text-xs"
        onChange={(e) => run(() => updateInboxStatus({ kind: r.kind, id: r.id, status: e.target.value }), { success: t("common.updated") })}
      >
        {INBOX_STATUSES[r.kind].map((s) => (
          <option key={s} value={s}>
            {t(`status.${s}`)}
          </option>
        ))}
      </Select>
    );
    if (!guard) return select;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{select}</span>
        </TooltipTrigger>
        <TooltipContent>{guard === "demo" ? t("common.demoDisabled") : t("common.readOnlyRole")}</TooltipContent>
      </Tooltip>
    );
  };

  const columnsFor = (kind: InboxKind): DataColumn<InboxRecord>[] => [
    {
      key: "name",
      header: kind === "suggestions" ? t("inbox.sender") : t("common.name"),
      primary: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold">{r.name || t("common.unknown")}</p>
          {r.contact && <p className="truncate text-xs text-muted-foreground">{r.contact}</p>}
        </div>
      ),
    },
    { key: "subject", header: subjectLabel(kind), render: (r) => <span>{subjectText(r)}</span> },
    {
      key: "message",
      header: t("common.message"),
      render: (r) => (
        <div className="max-w-80 text-muted-foreground">
          {r.count !== null && <p className="text-xs">{kind === "bookings" ? t("inbox.attendees") : t("inbox.participants")}: {r.count}</p>}
          {r.startsAt && (
            <p className="text-xs">
              {formatAdminDateTime(r.startsAt, lang)} - {r.endsAt ? formatAdminDateTime(r.endsAt, lang) : ""}
            </p>
          )}
          {r.message && <p className="line-clamp-3 whitespace-pre-line">{r.message}</p>}
        </div>
      ),
    },
    { key: "date", header: t("common.createdAt"), className: "whitespace-nowrap", render: (r) => <span className="tabular text-xs text-muted-foreground">{formatAdminDateTime(r.createdAt, lang)}</span> },
    {
      key: "status",
      header: t("common.status"),
      render: (r) => (
        <div className="flex flex-col items-start gap-1.5">
          <StatusBadge status={r.status} />
          {statusControl(r)}
        </div>
      ),
    },
  ];

  return (
    <>
      {demo && <p className="mb-4 text-sm text-muted-foreground">{t("inbox.demoNote")}</p>}
      <Tabs defaultValue={initialTab}>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          <TabsList>
            {KINDS.map((k) => (
              <TabsTrigger key={k} value={k}>
                {t(`inbox.tabs.${k}`)}
                <span className="tabular rounded-full bg-surface px-1.5 text-xs">{data[k].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {KINDS.map((k) => (
          <TabsContent key={k} value={k}>
            <DataTable
              rows={data[k]}
              columns={columnsFor(k)}
              rowKey={(r) => r.id}
              searchText={(r) => `${r.name} ${r.contact} ${r.subject} ${r.message}`}
              filters={[{ key: "status", label: t("content.filterStatus"), options: INBOX_STATUSES[k].map((s) => ({ value: s, label: t(`status.${s}`) })), predicate: (r, v) => r.status === v }]}
              emptyIcon={<Inbox />}
              toolbar={
                <CsvExportButton
                  filename={`${t("inbox.exportFile")}-${k}`}
                  headers={["created_at", "name", "contact", "subject", "message", "count", "starts_at", "ends_at", "status", "locale"]}
                  rows={data[k].map((r) => [r.createdAt, r.name, r.contact, r.subject, r.message, r.count, r.startsAt, r.endsAt, r.status, r.locale])}
                  onExported={(count) => {
                    if (!demo) void logInboxExport({ kind: k, count });
                  }}
                />
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
