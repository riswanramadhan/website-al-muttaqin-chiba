"use client";

import * as React from "react";
import { Check, HandCoins, Undo2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logDonationExport, setRecurringDonorActive, updateDonationStatus } from "@/actions/admin/donations";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { GuardedButton } from "@/components/admin/form-bar";
import { formatAdminDateTime } from "@/components/admin/utils";
import type { DonationConfirmationRecord, RecurringDonorRecord } from "@/components/admin/types";
import type { CsvCell } from "@/components/admin/utils";

type Guard = "demo" | "role" | undefined;

function money(amount: number, currency: string, lang: string): string {
  return new Intl.NumberFormat(lang === "ja" ? "ja-JP" : "id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

/**
 * Daftar konfirmasi donasi + donatur tetap. `canExport` dan data CSV sudah ditentukan
 * server (hanya super_admin / donation_admin); tanpa izin, tombol ekspor tidak dirender.
 */
export function DonationsView({ confirmations, recurring, guard, canExport, demo }: { confirmations: DonationConfirmationRecord[]; recurring: RecurringDonorRecord[]; guard: Guard; canExport: boolean; demo: boolean }) {
  const { t, lang } = useAdminT();
  const { run, pending } = useAdminAction();
  const [target, setTarget] = React.useState<{ row: DonationConfirmationRecord; status: DonationConfirmationRecord["status"] } | null>(null);
  const [note, setNote] = React.useState("");

  const open = (row: DonationConfirmationRecord, status: DonationConfirmationRecord["status"]) => {
    setNote(row.adminNote);
    setTarget({ row, status });
  };

  const confirm = () => {
    if (!target) return;
    void run(() => updateDonationStatus({ id: target.row.id, status: target.status, adminNote: note }), { success: t("common.updated"), onSuccess: () => setTarget(null) });
  };

  const columns: DataColumn<DonationConfirmationRecord>[] = [
    {
      key: "donor",
      header: t("donations.donor"),
      primary: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="font-semibold">{r.donorName || "-"}</p>
          <p className="truncate text-xs text-muted-foreground">{r.donorContact}</p>
          {r.onBehalfOf && <p className="text-xs text-muted-foreground">{t("donations.onBehalfOf")}: {r.onBehalfOf}</p>}
        </div>
      ),
    },
    {
      key: "amount",
      header: t("donations.amount"),
      className: "whitespace-nowrap",
      render: (r) => (
        <div>
          <p className="tabular font-semibold">{money(r.amount, r.currency, lang)}</p>
          {r.uniqueCode !== null && <p className="text-xs text-muted-foreground">{t("donations.uniqueCode")}: {r.uniqueCode}</p>}
        </div>
      ),
    },
    { key: "program", header: t("donations.program"), render: (r) => <span className="text-muted-foreground">{r.programSlug} · {r.accountId}</span> },
    { key: "date", header: t("donations.transferredAt"), className: "whitespace-nowrap", render: (r) => <span className="tabular">{r.transferredAt}</span> },
    {
      key: "status",
      header: t("common.status"),
      render: (r) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={r.status} />
          {r.adminNote && <p className="max-w-56 text-xs text-muted-foreground">{r.adminNote}</p>}
        </div>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.status === "pending" ? (
            <>
              <GuardedButton size="sm" variant="soft" reason={guard} onClick={() => open(r, "matched")}>
                <Check />
                {t("donations.markMatched")}
              </GuardedButton>
              <GuardedButton size="iconSm" variant="ghost" reason={guard} aria-label={t("donations.markRejected")} onClick={() => open(r, "rejected")}>
                <X />
              </GuardedButton>
            </>
          ) : (
            <GuardedButton size="sm" variant="ghost" reason={guard} onClick={() => open(r, "pending")}>
              <Undo2 />
              {t("donations.reopen")}
            </GuardedButton>
          )}
        </div>
      ),
    },
  ];

  const recurringColumns: DataColumn<RecurringDonorRecord>[] = [
    { key: "name", header: t("common.name"), primary: true, render: (r) => <div><p className="font-semibold">{r.fullName}</p><p className="text-xs text-muted-foreground">{r.contact}</p></div> },
    { key: "amount", header: t("donations.monthlyAmount"), render: (r) => <span className="tabular font-semibold">{money(r.monthlyAmount, r.currency, lang)}</span> },
    { key: "day", header: t("donations.paymentDay"), render: (r) => <span className="tabular">{r.paymentDay}</span> },
    { key: "method", header: t("donations.method"), render: (r) => <span>{r.method}</span> },
    { key: "publish", header: t("donations.publishName"), render: (r) => <Badge variant="outline">{r.publishName ? t("common.yes") : t("common.no")}</Badge> },
    { key: "status", header: t("common.status"), render: (r) => <StatusBadge status={r.active ? "active" : "inactive"} /> },
    {
      key: "actions",
      header: t("common.actions"),
      render: (r) => (
        <GuardedButton size="sm" variant="ghost" reason={guard} pending={pending} onClick={() => run(() => setRecurringDonorActive({ id: r.id, active: !r.active }), { success: t("common.updated") })}>
          {r.active ? t("donations.setInactive") : t("donations.setActive")}
        </GuardedButton>
      ),
    },
  ];

  const confirmationCsv: CsvCell[][] = confirmations.map((r) => [r.createdAt, r.transferredAt, r.programSlug, r.accountId, r.currency, r.amount, r.uniqueCode, r.donorName, r.donorContact, r.onBehalfOf, r.message, r.status, r.adminNote, r.matchedAt, r.locale]);
  const recurringCsv: CsvCell[][] = recurring.map((r) => [r.createdAt, r.fullName, r.contact, r.monthlyAmount, r.currency, r.paymentDay, r.method, r.publishName, r.active, r.locale]);
  const logExport = (kind: "confirmations" | "recurring") => (count: number) => {
    if (!demo) void logDonationExport({ kind, count });
  };

  return (
    <>
      {demo && <p className="mb-4 text-sm text-muted-foreground">{t("donations.demoNote")}</p>}
      {!canExport && <p className="mb-4 rounded-xl bg-surface px-4 py-3 text-sm text-muted-foreground">{t("donations.noAccess")}</p>}
      <Tabs defaultValue="confirmations">
        <TabsList className="max-w-full overflow-x-auto scrollbar-none">
          <TabsTrigger value="confirmations">{t("donations.confirmations")}</TabsTrigger>
          <TabsTrigger value="recurring">{t("donations.recurring")}</TabsTrigger>
        </TabsList>
        <TabsContent value="confirmations">
          <DataTable
            rows={confirmations}
            columns={columns}
            rowKey={(r) => r.id}
            searchText={(r) => `${r.donorName} ${r.donorContact} ${r.onBehalfOf} ${r.programSlug} ${r.amount} ${r.uniqueCode ?? ""}`}
            filters={[{ key: "status", label: t("content.filterStatus"), options: (["pending", "matched", "rejected"] as const).map((s) => ({ value: s, label: t(`status.${s}`) })), predicate: (r, v) => r.status === v }]}
            emptyIcon={<HandCoins />}
            toolbar={
              canExport ? (
                <CsvExportButton
                  filename={t("donations.exportFile")}
                  headers={["created_at", "transferred_at", "program", "account", "currency", "amount", "unique_code", "donor_name", "donor_contact", "on_behalf_of", "message", "status", "admin_note", "matched_at", "locale"]}
                  rows={confirmationCsv}
                  onExported={logExport("confirmations")}
                />
              ) : undefined
            }
          />
        </TabsContent>
        <TabsContent value="recurring">
          <DataTable
            rows={recurring}
            columns={recurringColumns}
            rowKey={(r) => r.id}
            searchText={(r) => `${r.fullName} ${r.contact} ${r.method}`}
            emptyIcon={<HandCoins />}
            toolbar={
              canExport ? (
                <CsvExportButton
                  filename={t("donations.exportRecurringFile")}
                  headers={["created_at", "full_name", "contact", "monthly_amount", "currency", "payment_day", "method", "publish_name", "active", "locale"]}
                  rows={recurringCsv}
                  onExported={logExport("recurring")}
                />
              ) : undefined
            }
          />
        </TabsContent>
      </Tabs>

      <Dialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent closeLabel={t("common.close")}>
          <DialogHeader>
            <DialogTitle>{target ? (target.status === "matched" ? t("donations.markMatched") : target.status === "rejected" ? t("donations.markRejected") : t("donations.reopen")) : ""}</DialogTitle>
            {target && (
              <DialogDescription>
                {target.row.donorName || "-"} · {money(target.row.amount, target.row.currency, lang)} · {formatAdminDateTime(target.row.createdAt, lang, false)}
              </DialogDescription>
            )}
          </DialogHeader>
          <Field label={t("donations.adminNote")} htmlFor="donation-note" optionalLabel={t("common.optional")}>
            <Textarea id="donation-note" value={note} maxLength={500} placeholder={t("donations.notePlaceholder")} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              {t("common.cancel")}
            </Button>
            <GuardedButton reason={guard} pending={pending} variant={target?.status === "rejected" ? "destructive" : "primary"} onClick={confirm}>
              {t("common.save")}
            </GuardedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
