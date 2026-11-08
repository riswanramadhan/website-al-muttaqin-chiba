"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { inviteAdmin, updateAdmin } from "@/actions/admin/admins";
import type { AdminRole } from "@/lib/supabase/admin";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction, useFieldError } from "@/components/admin/use-admin-action";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { GuardedButton } from "@/components/admin/form-bar";
import { adminInviteSchema, type AdminInviteInput } from "@/components/admin/schemas";
import { formatAdminDateTime } from "@/components/admin/utils";
import type { AdminRecord } from "@/components/admin/types";

const ROLES: AdminRole[] = ["super_admin", "content_admin", "donation_admin", "viewer"];

/** Kelola admin & peran (super_admin): undang, ubah peran, aktif/nonaktif. */
export function AdminsView({ admins, selfId, guard, serviceReady }: { admins: AdminRecord[]; selfId: string | null; guard: "demo" | "role" | undefined; serviceReady: boolean }) {
  const { t, lang } = useAdminT();
  const fieldError = useFieldError();
  const { run, pending } = useAdminAction();
  const form = useForm<AdminInviteInput>({ resolver: zodResolver(adminInviteSchema), defaultValues: { email: "", fullName: "", role: "content_admin" } });
  const { register, handleSubmit, reset, formState: { errors } } = form;
  const inviteGuard = guard ?? (serviceReady ? undefined : "role");

  const onInvite = handleSubmit((values) => run(() => inviteAdmin(values), { success: t("admins.invited"), onSuccess: () => reset() }));

  const columns: DataColumn<AdminRecord>[] = [
    {
      key: "name",
      header: t("common.name"),
      primary: true,
      render: (a) => (
        <div className="min-w-0">
          <p className="font-semibold">
            {a.fullName} {a.id === selfId && <Badge variant="soft">{t("admins.self")}</Badge>}
          </p>
          <p className="truncate text-xs text-muted-foreground">{a.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: t("fields.role"),
      render: (a) => (
        <Select
          value={a.role}
          disabled={Boolean(guard) || pending || a.id === selfId}
          aria-label={t("admins.changeRole")}
          className="h-9 min-w-40 text-xs"
          onChange={(e) => run(() => updateAdmin({ id: a.id, role: e.target.value }), { success: t("common.updated") })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`roles.${r}`)}
            </option>
          ))}
        </Select>
      ),
    },
    { key: "status", header: t("common.status"), render: (a) => <StatusBadge status={a.active ? "active" : "inactive"} /> },
    { key: "created", header: t("common.createdAt"), className: "whitespace-nowrap", render: (a) => <span className="tabular text-xs text-muted-foreground">{formatAdminDateTime(a.createdAt, lang, false)}</span> },
    {
      key: "actions",
      header: t("common.actions"),
      render: (a) =>
        a.id === selfId ? null : (
          <GuardedButton size="sm" variant="ghost" reason={guard} pending={pending} onClick={() => run(() => updateAdmin({ id: a.id, active: !a.active }), { success: t("common.updated") })}>
            {a.active ? t("admins.deactivate") : t("admins.activate")}
          </GuardedButton>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DataTable rows={admins} columns={columns} rowKey={(a) => a.id} searchText={(a) => `${a.fullName} ${a.email} ${a.role}`} emptyIcon={<Users />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>{t("admins.add")}</CardTitle>
          <CardDescription className="mt-1.5">{t("admins.inviteHint")}</CardDescription>
          {!guard && !serviceReady && <p className="mt-4 rounded-xl bg-warning/10 px-4 py-3 text-sm">{t("admins.needService")}</p>}
          <form onSubmit={onInvite} className="mt-5 flex flex-col gap-4">
            <Field label={t("fields.fullName")} htmlFor="invite-name" required error={fieldError(errors.fullName?.message)}>
              <Input id="invite-name" disabled={Boolean(inviteGuard)} {...register("fullName")} />
            </Field>
            <Field label={t("fields.email")} htmlFor="invite-email" required error={fieldError(errors.email?.message)}>
              <Input id="invite-email" type="email" disabled={Boolean(inviteGuard)} {...register("email")} />
            </Field>
            <Field label={t("fields.role")} htmlFor="invite-role">
              <Select id="invite-role" disabled={Boolean(inviteGuard)} {...register("role")}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t(`roles.${r}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end">
              <GuardedButton type="submit" reason={inviteGuard} pending={pending}>
                <UserPlus />
                {t("admins.add")}
              </GuardedButton>
            </div>
          </form>
        </Card>
        <Card variant="muted">
          <CardTitle>{t("fields.role")}</CardTitle>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            {ROLES.map((r) => (
              <div key={r}>
                <dt className="font-semibold">{t(`roles.${r}`)}</dt>
                <dd className="text-muted-foreground">{t(`admins.roleDescriptions.${r}`)}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
