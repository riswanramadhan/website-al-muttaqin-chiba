"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveAnnouncement } from "@/actions/admin/content";
import { Checkbox, Field, Input, Label, Select } from "@/components/ui/input";
import { useAdminT } from "@/components/admin/i18n-context";
import { announcementSchema, type AnnouncementInput } from "@/components/admin/schemas";
import type { AnnouncementRecord } from "@/components/admin/types";
import { emptyBlocks, emptyText, isoToJstLocal, jstLocalToIso, slugify } from "@/components/admin/utils";
import { useFieldError } from "@/components/admin/use-admin-action";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { LocalizedBlockEditor } from "@/components/admin/block-editor";
import { FormSection } from "@/components/admin/form-bar";
import { ContentFormActions, useContentSave, type Guard } from "@/components/admin/content-form-shared";

const CATEGORIES = ["general", "prayer", "event", "donation", "urgent"] as const;

export function AnnouncementForm({ initial, guard }: { initial: AnnouncementRecord | null; guard: Guard }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const { save, remove, pending } = useContentSave("announcements", saveAnnouncement);
  const disabled = Boolean(guard);

  const form = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: initial?.id,
      slug: initial?.slug ?? "",
      title: initial?.title ?? emptyText(),
      excerpt: initial?.excerpt ?? emptyText(),
      body: initial?.body ?? emptyBlocks(),
      category: initial?.category ?? "general",
      pinned: initial?.pinned ?? false,
      status: initial?.status ?? "draft",
      publishedAt: initial?.publishedAt ?? "",
      expiresAt: initial?.expiresAt ?? "",
    },
  });
  const { register, control, handleSubmit, setValue, getFieldState, formState: { errors } } = form;
  const status = useWatch({ control, name: "status" });

  const submitWith = (next: AnnouncementInput["status"]) => handleSubmit((values) => save(values, next))();

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
      <FormSection title={t("fields.title")}>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <LocalizedInput
              label={t("fields.title")}
              required
              disabled={disabled}
              value={field.value}
              errors={{ id: errors.title?.id?.message }}
              onChange={(v) => {
                field.onChange(v);
                if (!initial && !getFieldState("slug").isDirty) setValue("slug", slugify(v.id));
              }}
            />
          )}
        />
        <Field label={t("fields.slug")} htmlFor="slug" hint={t("fields.slugHint")} error={fieldError(errors.slug?.message)} required>
          <Input id="slug" disabled={disabled} aria-invalid={Boolean(errors.slug) || undefined} {...register("slug")} />
        </Field>
        <Controller control={control} name="excerpt" render={({ field }) => <LocalizedTextarea label={t("fields.excerpt")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
      </FormSection>

      <FormSection title={t("fields.body")}>
        <Controller control={control} name="body" render={({ field }) => <LocalizedBlockEditor label={t("fields.body")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
      </FormSection>

      <FormSection title={t("fields.status")}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("fields.category")} htmlFor="category">
            <Select id="category" disabled={disabled} {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`announcements.categories.${c}`)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex flex-col gap-1.5">
            <Label>{t("fields.pinned")}</Label>
            <label className="flex h-11 items-center gap-3 text-sm">
              <Checkbox disabled={disabled} {...register("pinned")} />
              {t("dashboard.quick.pinned")}
            </label>
          </div>
          <Controller
            control={control}
            name="publishedAt"
            render={({ field }) => (
              <Field label={t("fields.publishedAt")} htmlFor="publishedAt" hint={t("fields.timeHint")} error={fieldError(errors.publishedAt?.message)}>
                <Input id="publishedAt" type="datetime-local" disabled={disabled} value={isoToJstLocal(field.value)} onChange={(e) => field.onChange(jstLocalToIso(e.target.value))} />
              </Field>
            )}
          />
          <Controller
            control={control}
            name="expiresAt"
            render={({ field }) => (
              <Field label={t("fields.expiresAt")} htmlFor="expiresAt" optionalLabel={t("common.optional")} error={fieldError(errors.expiresAt?.message)}>
                <Input id="expiresAt" type="datetime-local" disabled={disabled} value={isoToJstLocal(field.value)} onChange={(e) => field.onChange(jstLocalToIso(e.target.value))} />
              </Field>
            )}
          />
        </div>
      </FormSection>

      <ContentFormActions entity="announcements" id={initial?.id} status={status} guard={guard} pending={pending} onSave={submitWith} onDelete={initial ? () => remove(initial.id) : undefined} />
    </form>
  );
}
