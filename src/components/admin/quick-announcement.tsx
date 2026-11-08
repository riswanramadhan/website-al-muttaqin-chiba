"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rocket } from "lucide-react";
import { publishQuickAnnouncement } from "@/actions/admin/content";
import { Checkbox, Field, Select } from "@/components/ui/input";
import { useAdminT } from "@/components/admin/i18n-context";
import { quickAnnouncementSchema, type QuickAnnouncementInput } from "@/components/admin/schemas";
import { emptyText } from "@/components/admin/utils";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { GuardedButton } from "@/components/admin/form-bar";

const CATEGORIES = ["general", "prayer", "event", "donation", "urgent"] as const;

/** Formulir cepat dasbor: pengumuman 3 bahasa terbit dalam < 3 menit (PRD §2). */
export function QuickAnnouncement({ guard }: { guard: "demo" | "role" | undefined }) {
  const { t } = useAdminT();
  const { run, pending } = useAdminAction();
  const disabled = Boolean(guard);
  const form = useForm<QuickAnnouncementInput>({
    resolver: zodResolver(quickAnnouncementSchema),
    defaultValues: { title: emptyText(), body: emptyText(), category: "general", pinned: false },
  });
  const { control, register, handleSubmit, reset, formState: { errors } } = form;

  const onSubmit = handleSubmit((values) =>
    run(() => publishQuickAnnouncement(values), { success: t("dashboard.quick.success"), onSuccess: () => reset() }),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Controller control={control} name="title" render={({ field }) => <LocalizedInput label={t("dashboard.quick.titleLabel")} required disabled={disabled} value={field.value} onChange={field.onChange} errors={{ id: errors.title?.id?.message }} />} />
      <Controller control={control} name="body" render={({ field }) => <LocalizedTextarea label={t("dashboard.quick.bodyLabel")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("dashboard.quick.category")} htmlFor="quick-category">
          <Select id="quick-category" disabled={disabled} {...register("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`announcements.categories.${c}`)}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-3 self-end pb-3 text-sm">
          <Checkbox disabled={disabled} {...register("pinned")} />
          {t("dashboard.quick.pinned")}
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/announcements/new" className="text-sm font-semibold text-brand hover:underline">
          {t("dashboard.quick.openFull")}
        </Link>
        <GuardedButton type="submit" reason={guard} pending={pending}>
          <Rocket />
          {t("dashboard.quick.submit")}
        </GuardedButton>
      </div>
    </form>
  );
}
