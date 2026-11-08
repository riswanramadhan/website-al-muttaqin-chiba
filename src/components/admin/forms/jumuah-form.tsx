"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { saveJumuah } from "@/actions/admin/content";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { useAdminT } from "@/components/admin/i18n-context";
import { jumuahSchema, type JumuahInput } from "@/components/admin/schemas";
import type { JumuahRecord } from "@/components/admin/types";
import { textOrEmpty } from "@/components/admin/utils";
import { useFieldError } from "@/components/admin/use-admin-action";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { FormBar, FormSection, GuardedButton } from "@/components/admin/form-bar";
import { useContentSave, type Guard } from "@/components/admin/content-form-shared";

const LANGUAGES = ["id", "ja", "en", "ar", "mixed"] as const;

export function JumuahForm({ initial, guard }: { initial: JumuahRecord | null; guard: Guard }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const { save, remove, pending } = useContentSave("jumuah", saveJumuah);
  const disabled = Boolean(guard);

  const form = useForm<JumuahInput>({
    resolver: zodResolver(jumuahSchema),
    defaultValues: {
      id: initial?.id,
      date: initial?.date ?? "",
      khatib: initial?.khatib ?? "",
      imam: initial?.imam ?? "",
      time: initial?.time ?? "12:30",
      language: initial?.language ?? "id",
      topic: textOrEmpty(initial?.topic),
      note: textOrEmpty(initial?.note),
      published: initial?.published ?? true,
    },
  });
  const { register, control, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit((values) => save(values, null))} className="flex flex-col gap-6">
      <FormSection title={t("jumuah.title")}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("fields.date")} htmlFor="date" required error={fieldError(errors.date?.message)}>
            <Input id="date" type="date" disabled={disabled} aria-invalid={Boolean(errors.date) || undefined} {...register("date")} />
          </Field>
          <Field label={t("fields.time")} htmlFor="time" required hint={t("fields.timeHint")} error={fieldError(errors.time?.message)}>
            <Input id="time" type="time" disabled={disabled} aria-invalid={Boolean(errors.time) || undefined} {...register("time")} />
          </Field>
          <Field label={t("fields.khatib")} htmlFor="khatib" required error={fieldError(errors.khatib?.message)}>
            <Input id="khatib" disabled={disabled} aria-invalid={Boolean(errors.khatib) || undefined} {...register("khatib")} />
          </Field>
          <Field label={t("fields.imam")} htmlFor="imam" required error={fieldError(errors.imam?.message)}>
            <Input id="imam" disabled={disabled} aria-invalid={Boolean(errors.imam) || undefined} {...register("imam")} />
          </Field>
          <Field label={t("fields.language")} htmlFor="language">
            <Select id="language" disabled={disabled} {...register("language")}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {t(`jumuah.languages.${l}`)}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex items-center gap-3 self-end pb-3 text-sm">
            <Checkbox disabled={disabled} {...register("published")} />
            {t("fields.published")}
          </label>
        </div>
        <Controller control={control} name="topic" render={({ field }) => <LocalizedInput label={t("fields.topic")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="note" render={({ field }) => <LocalizedTextarea label={t("fields.note")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
      </FormSection>

      <FormBar backHref="/admin/jumuah" onDelete={initial ? () => remove(initial.id) : undefined} deleteReason={guard} pending={pending}>
        <GuardedButton type="submit" variant="primary" size="sm" reason={guard} pending={pending}>
          <Save />
          {t("content.publishAndRevalidate")}
        </GuardedButton>
      </FormBar>
    </form>
  );
}
