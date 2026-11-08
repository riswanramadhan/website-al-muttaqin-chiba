"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveEvent } from "@/actions/admin/content";
import { Checkbox, Field, Input, Label, Select } from "@/components/ui/input";
import { useAdminT } from "@/components/admin/i18n-context";
import { eventSchema, type EventInput } from "@/components/admin/schemas";
import type { EventRecord } from "@/components/admin/types";
import { LOCALES, emptyBlocks, emptyText, isoToJstLocal, jstLocalToIso, slugify, textOrEmpty } from "@/components/admin/utils";
import { useFieldError } from "@/components/admin/use-admin-action";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { LocalizedBlockEditor } from "@/components/admin/block-editor";
import { FormSection } from "@/components/admin/form-bar";
import { ContentFormActions, useContentSave, type Guard } from "@/components/admin/content-form-shared";

const CATEGORIES = ["kajian", "tpa", "muallaf", "community", "culture", "ramadan", "eid", "class", "open-mosque"] as const;

export function EventForm({ initial, guard }: { initial: EventRecord | null; guard: Guard }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const { save, remove, pending } = useContentSave("events", saveEvent);
  const disabled = Boolean(guard);

  const form = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: initial?.id,
      slug: initial?.slug ?? "",
      title: initial?.title ?? emptyText(),
      excerpt: initial?.excerpt ?? emptyText(),
      description: initial?.description ?? emptyBlocks(),
      category: initial?.category ?? "kajian",
      startsAt: initial?.startsAt ?? "",
      endsAt: initial?.endsAt ?? "",
      location: initial?.location ?? emptyText(),
      speaker: initial?.speaker ?? "",
      languages: initial?.languages ?? ["id"],
      coverImage: initial?.coverImage ?? "",
      registrationRequired: initial?.registration.required ?? false,
      quota: initial?.registration.quota ? String(initial.registration.quota) : "",
      deadline: initial?.registration.deadline ?? "",
      feeAmount: initial?.registration.fee ? String(initial.registration.fee.amount) : "",
      recurring: textOrEmpty(initial?.recurring),
      featured: initial?.featured ?? false,
      status: initial?.status ?? "draft",
    },
  });
  const { register, control, handleSubmit, setValue, getFieldState, formState: { errors } } = form;
  const status = useWatch({ control, name: "status" });
  const registrationRequired = useWatch({ control, name: "registrationRequired" });

  const submitWith = (next: EventInput["status"]) => handleSubmit((values) => save(values, next))();

  const dateField = (name: "startsAt" | "endsAt" | "deadline", label: string, required?: boolean) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field label={label} htmlFor={name} hint={t("fields.timeHint")} required={required} error={fieldError(errors[name]?.message)}>
          <Input id={name} type="datetime-local" disabled={disabled} aria-invalid={Boolean(errors[name]) || undefined} value={isoToJstLocal(field.value)} onChange={(e) => field.onChange(jstLocalToIso(e.target.value))} />
        </Field>
      )}
    />
  );

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
        <Controller control={control} name="description" render={({ field }) => <LocalizedBlockEditor label={t("fields.description")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
      </FormSection>

      <FormSection title={t("fields.startsAt")}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {dateField("startsAt", t("fields.startsAt"), true)}
          {dateField("endsAt", t("fields.endsAt"), true)}
          <Field label={t("fields.category")} htmlFor="category">
            <Select id="category" disabled={disabled} {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`events.categories.${c}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("fields.speaker")} htmlFor="speaker" optionalLabel={t("common.optional")}>
            <Input id="speaker" disabled={disabled} {...register("speaker")} />
          </Field>
        </div>
        <Controller control={control} name="location" render={({ field }) => <LocalizedInput label={t("fields.location")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="recurring" render={({ field }) => <LocalizedInput label={t("fields.recurring")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>{t("fields.languages")}</Label>
            <div className="flex h-11 flex-wrap items-center gap-4 text-sm">
              {LOCALES.map((l) => (
                <label key={l} className="flex items-center gap-2">
                  <Checkbox value={l} disabled={disabled} {...register("languages")} />
                  {t(`content.localeNames.${l}`)}
                </label>
              ))}
            </div>
          </div>
          <Field label={t("fields.coverImage")} htmlFor="coverImage" optionalLabel={t("common.optional")}>
            <Input id="coverImage" disabled={disabled} placeholder="/images/..." {...register("coverImage")} />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox disabled={disabled} {...register("featured")} />
          {t("fields.featured")}
        </label>
      </FormSection>

      <FormSection title={t("fields.registrationRequired")}>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox disabled={disabled} {...register("registrationRequired")} />
          {t("fields.registrationRequired")}
        </label>
        {registrationRequired && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label={t("fields.quota")} htmlFor="quota" optionalLabel={t("common.optional")}>
              <Input id="quota" type="number" min={0} disabled={disabled} {...register("quota")} />
            </Field>
            {dateField("deadline", t("fields.deadline"))}
            <Field label={t("fields.feeAmount")} htmlFor="feeAmount" optionalLabel={t("common.optional")}>
              <Input id="feeAmount" type="number" min={0} disabled={disabled} {...register("feeAmount")} />
            </Field>
          </div>
        )}
      </FormSection>

      <ContentFormActions entity="events" id={initial?.id} status={status} guard={guard} pending={pending} onSave={submitWith} onDelete={initial ? () => remove(initial.id) : undefined} />
    </form>
  );
}
