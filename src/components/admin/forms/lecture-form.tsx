"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveLecture } from "@/actions/admin/content";
import { Field, Input, Select } from "@/components/ui/input";
import { useAdminT } from "@/components/admin/i18n-context";
import { lectureSchema, type LectureInput } from "@/components/admin/schemas";
import type { LectureRecord } from "@/components/admin/types";
import { emptyText, isoToJstLocal, jstLocalToIso, slugify, textOrEmpty } from "@/components/admin/utils";
import { useFieldError } from "@/components/admin/use-admin-action";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { FormSection } from "@/components/admin/form-bar";
import { ContentFormActions, useContentSave, type Guard } from "@/components/admin/content-form-shared";

const LANGUAGES = ["id", "ja", "en", "ar"] as const;

export function LectureForm({ initial, guard }: { initial: LectureRecord | null; guard: Guard }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const { save, remove, pending } = useContentSave("lectures", saveLecture);
  const disabled = Boolean(guard);

  const form = useForm<LectureInput>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      id: initial?.id,
      slug: initial?.slug ?? "",
      title: initial?.title ?? emptyText(),
      speaker: initial?.speaker ?? "",
      youtubeId: initial?.youtubeId ?? "",
      publishedAt: initial?.publishedAt ?? "",
      durationMinutes: initial ? String(initial.durationMinutes) : "",
      series: textOrEmpty(initial?.series),
      description: initial?.description ?? emptyText(),
      language: initial?.language ?? "id",
      tags: initial?.tags.join(", ") ?? "",
      status: initial?.status ?? "draft",
    },
  });
  const { register, control, handleSubmit, setValue, getFieldState, formState: { errors } } = form;
  const status = useWatch({ control, name: "status" });
  const youtubeId = useWatch({ control, name: "youtubeId" });

  const submitWith = (next: LectureInput["status"]) => handleSubmit((values) => save(values, next))();

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
        <Controller control={control} name="description" render={({ field }) => <LocalizedTextarea label={t("fields.description")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="series" render={({ field }) => <LocalizedInput label={t("fields.series")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
      </FormSection>

      <FormSection title={t("lectures.title")}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("fields.youtubeId")} htmlFor="youtubeId" required error={fieldError(errors.youtubeId?.message)}>
            <Input id="youtubeId" disabled={disabled} placeholder="dQw4w9WgXcQ" aria-invalid={Boolean(errors.youtubeId) || undefined} {...register("youtubeId")} />
          </Field>
          <Field label={t("fields.speaker")} htmlFor="speaker" required error={fieldError(errors.speaker?.message)}>
            <Input id="speaker" disabled={disabled} aria-invalid={Boolean(errors.speaker) || undefined} {...register("speaker")} />
          </Field>
          <Field label={t("fields.durationMinutes")} htmlFor="durationMinutes">
            <Input id="durationMinutes" type="number" min={0} disabled={disabled} {...register("durationMinutes")} />
          </Field>
          <Field label={t("fields.language")} htmlFor="language">
            <Select id="language" disabled={disabled} {...register("language")}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {t(`lectures.languages.${l}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("fields.tags")} htmlFor="tags" hint={t("fields.tagsHint")}>
            <Input id="tags" disabled={disabled} {...register("tags")} />
          </Field>
          <Controller
            control={control}
            name="publishedAt"
            render={({ field }) => (
              <Field label={t("fields.publishedAt")} htmlFor="publishedAt" hint={t("fields.timeHint")} error={fieldError(errors.publishedAt?.message)}>
                <Input id="publishedAt" type="datetime-local" disabled={disabled} value={isoToJstLocal(field.value)} onChange={(e) => field.onChange(jstLocalToIso(e.target.value))} />
              </Field>
            )}
          />
        </div>
        {/^[A-Za-z0-9_-]{11}$/.test(youtubeId) && (
          <div className="aspect-video w-full max-w-md overflow-hidden rounded-xl bg-surface">
            <iframe title={initial?.title.id || youtubeId} src={`https://www.youtube-nocookie.com/embed/${youtubeId}`} className="size-full" loading="lazy" allowFullScreen />
          </div>
        )}
      </FormSection>

      <ContentFormActions entity="lectures" id={initial?.id} status={status} guard={guard} pending={pending} onSave={submitWith} onDelete={initial ? () => remove(initial.id) : undefined} />
    </form>
  );
}
