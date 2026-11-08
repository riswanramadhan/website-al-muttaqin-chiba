"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveNews } from "@/actions/admin/content";
import { Field, Input, Select } from "@/components/ui/input";
import { useAdminT } from "@/components/admin/i18n-context";
import { newsSchema, type NewsInput } from "@/components/admin/schemas";
import type { NewsRecord } from "@/components/admin/types";
import { emptyBlocks, emptyText, isoToJstLocal, jstLocalToIso, slugify } from "@/components/admin/utils";
import { useFieldError } from "@/components/admin/use-admin-action";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { LocalizedBlockEditor } from "@/components/admin/block-editor";
import { FormSection } from "@/components/admin/form-bar";
import { ContentFormActions, useContentSave, type Guard } from "@/components/admin/content-form-shared";

const CATEGORIES = ["news", "report", "article", "press"] as const;

export function NewsForm({ initial, guard }: { initial: NewsRecord | null; guard: Guard }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const { save, remove, pending } = useContentSave("news", saveNews);
  const disabled = Boolean(guard);

  const form = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      id: initial?.id,
      slug: initial?.slug ?? "",
      title: initial?.title ?? emptyText(),
      excerpt: initial?.excerpt ?? emptyText(),
      body: initial?.body ?? emptyBlocks(),
      category: initial?.category ?? "news",
      author: initial?.author ?? "",
      coverImage: initial?.coverImage ?? "",
      tags: initial?.tags.join(", ") ?? "",
      status: initial?.status ?? "draft",
      publishedAt: initial?.publishedAt ?? "",
    },
  });
  const { register, control, handleSubmit, setValue, getFieldState, formState: { errors } } = form;
  const status = useWatch({ control, name: "status" });

  const submitWith = (next: NewsInput["status"]) => handleSubmit((values) => save(values, next))();

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
                  {t(`news.categories.${c}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("fields.author")} htmlFor="author" optionalLabel={t("common.optional")}>
            <Input id="author" disabled={disabled} {...register("author")} />
          </Field>
          <Field label={t("fields.coverImage")} htmlFor="coverImage" optionalLabel={t("common.optional")}>
            <Input id="coverImage" disabled={disabled} placeholder="/images/..." {...register("coverImage")} />
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
      </FormSection>

      <ContentFormActions entity="news" id={initial?.id} status={status} guard={guard} pending={pending} onSave={submitWith} onDelete={initial ? () => remove(initial.id) : undefined} />
    </form>
  );
}
