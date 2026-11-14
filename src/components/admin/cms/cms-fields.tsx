"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import type { Locale, LocalizedBlocks, LocalizedText } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Label, Select, Textarea } from "@/components/ui/input";
import { SwitchRow } from "@/components/ui/switch";
import { useAdminT } from "@/components/admin/i18n-context";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { LocalizedBlockEditor } from "@/components/admin/block-editor";
import { LOCALES, emptyText, isoToJstLocal, jstLocalToIso } from "@/components/admin/utils";
import { ImageUpload } from "@/components/admin/cms/image-upload";
import { defaultValue, displayText, type CmsData, type FieldDef } from "@/components/admin/cms/fields";

/** Kesalahan validasi per jalur ("data.question.id", "data.income.0.amount"). */
export type CmsErrors = Record<string, string>;

type GridProps = {
  fields: FieldDef[];
  value: CmsData;
  onChange: (next: CmsData) => void;
  errors: CmsErrors;
  /** Jalur objek ini di dalam hasil validasi (mis. "data" atau "data.coordinates"). */
  path: string;
  disabled?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: unknown): LocalizedText {
  return isRecord(value) ? { ja: String(value.ja ?? ""), en: String(value.en ?? ""), id: String(value.id ?? "") } : emptyText();
}

/** Render daftar kolom dalam grid dua kolom; kolom `wide`, grup, dan daftar memakai lebar penuh. */
export function FieldGrid({ fields, value, onChange, errors, path, disabled }: GridProps) {
  const { t } = useAdminT();
  const reactId = React.useId();
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  const errorAt = (suffix: string): string | undefined => {
    const message = errors[`${path}.${suffix}`];
    return message ? (message.includes(".") ? t(message) : message) : undefined;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `${reactId}-${f.key}`;
        const label = t(f.label);
        const hint = f.hint ? t(f.hint) : undefined;
        const v = value[f.key];
        const full = f.wide || f.type === "group" || f.type === "list" || f.type === "ltextList" || f.type === "lblocks" || f.type === "image";
        const wrap = cn(full && "sm:col-span-2");

        switch (f.type) {
          case "text":
            return (
              <Field key={f.key} className={wrap} label={label} htmlFor={id} hint={hint} error={errorAt(f.key)} required={f.required} optionalLabel={f.required ? undefined : t("common.optional")}>
                <Input id={id} value={typeof v === "string" ? v : ""} disabled={disabled} placeholder={f.placeholder} aria-invalid={Boolean(errorAt(f.key)) || undefined} onChange={(e) => set(f.key, e.target.value)} />
              </Field>
            );
          case "textarea":
            return (
              <Field key={f.key} className={wrap} label={label} htmlFor={id} hint={hint} error={errorAt(f.key)} required={f.required}>
                <Textarea id={id} value={typeof v === "string" ? v : ""} disabled={disabled} aria-invalid={Boolean(errorAt(f.key)) || undefined} onChange={(e) => set(f.key, e.target.value)} />
              </Field>
            );
          case "number":
            return (
              <Field key={f.key} className={wrap} label={label} htmlFor={id} hint={hint} error={errorAt(f.key)} required={f.required} optionalLabel={f.required ? undefined : t("common.optional")}>
                <Input
                  id={id}
                  type="number"
                  inputMode={f.integer ? "numeric" : "decimal"}
                  step={f.integer ? 1 : "any"}
                  min={f.min}
                  max={f.max}
                  value={typeof v === "number" ? v : ""}
                  disabled={disabled}
                  aria-invalid={Boolean(errorAt(f.key)) || undefined}
                  onChange={(e) => set(f.key, e.target.value === "" ? undefined : Number(e.target.value))}
                />
              </Field>
            );
          case "money": {
            const amount = isRecord(v) && typeof v.amount === "number" ? v.amount : "";
            return (
              <Field key={f.key} className={wrap} label={`${label} (${f.currency})`} htmlFor={id} hint={hint} error={errorAt(f.key) ?? errorAt(`${f.key}.amount`)} optionalLabel={t("common.optional")}>
                <Input
                  id={id}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={amount}
                  disabled={disabled}
                  onChange={(e) => set(f.key, e.target.value === "" ? undefined : { amount: Number(e.target.value), currency: f.currency })}
                />
              </Field>
            );
          }
          case "boolean":
            return (
              <div key={f.key} className={cn("rounded-xl border border-border px-4", wrap)}>
                <SwitchRow id={id} label={label} description={hint} checked={v === true} disabled={disabled} onCheckedChange={(checked) => set(f.key, checked)} />
              </div>
            );
          case "select":
            return (
              <Field key={f.key} className={wrap} label={label} htmlFor={id} hint={hint} error={errorAt(f.key)} required={f.required}>
                <Select id={id} value={typeof v === "string" ? v : ""} disabled={disabled} aria-invalid={Boolean(errorAt(f.key)) || undefined} onChange={(e) => set(f.key, e.target.value)}>
                  {!f.required && <option value="">-</option>}
                  {f.options.map((option) => (
                    <option key={option} value={option}>
                      {t(`${f.optionLabel}.${option}`)}
                    </option>
                  ))}
                </Select>
              </Field>
            );
          case "date":
          case "month":
            return (
              <Field key={f.key} className={wrap} label={label} htmlFor={id} hint={hint} error={errorAt(f.key)} required={f.required} optionalLabel={f.required ? undefined : t("common.optional")}>
                <Input id={id} type={f.type} value={typeof v === "string" ? v : ""} disabled={disabled} aria-invalid={Boolean(errorAt(f.key)) || undefined} onChange={(e) => set(f.key, e.target.value)} />
              </Field>
            );
          case "datetime":
            return (
              <Field key={f.key} className={wrap} label={label} htmlFor={id} hint={hint} error={errorAt(f.key)} required={f.required}>
                <Input id={id} type="datetime-local" value={isoToJstLocal(typeof v === "string" ? v : "")} disabled={disabled} onChange={(e) => set(f.key, jstLocalToIso(e.target.value))} />
              </Field>
            );
          case "ltext": {
            const props = {
              id,
              label,
              hint,
              required: f.required,
              disabled,
              value: asText(v),
              errors: { id: errors[`${path}.${f.key}.id`] ?? errors[`${path}.${f.key}`], ja: errors[`${path}.${f.key}.ja`], en: errors[`${path}.${f.key}.en`] },
              onChange: (next: LocalizedText) => set(f.key, next),
              className: wrap,
            };
            return f.multiline ? <LocalizedTextarea key={f.key} {...props} /> : <LocalizedInput key={f.key} {...props} />;
          }
          case "lblocks":
            return (
              <div key={f.key} className={wrap}>
                <LocalizedBlockEditor label={label} hint={hint} disabled={disabled} value={(isRecord(v) ? v : { ja: [], en: [], id: [] }) as unknown as LocalizedBlocks} onChange={(next) => set(f.key, next)} />
              </div>
            );
          case "image": {
            const src = f.shape === "object" ? (isRecord(v) && typeof v.src === "string" ? v.src : "") : typeof v === "string" ? v : "";
            return (
              <ImageUpload
                key={f.key}
                id={id}
                className={wrap}
                label={label}
                hint={hint}
                error={errorAt(f.key) ?? errorAt(`${f.key}.src`)}
                required={f.required}
                value={src}
                folder={f.folder}
                preset={f.preset}
                allowPdf={f.allowPdf}
                disabled={disabled}
                onChange={(nextSrc, image) => {
                  if (f.shape === "object") {
                    const previous = isRecord(v) ? v : {};
                    set(f.key, nextSrc ? { src: nextSrc, width: image?.width ?? (Number(previous.width) || 0), height: image?.height ?? (Number(previous.height) || 0) } : undefined);
                    return;
                  }
                  const next: CmsData = { ...value, [f.key]: nextSrc };
                  if (image && f.dims) {
                    next[f.dims[0]] = image.width;
                    next[f.dims[1]] = image.height;
                  }
                  onChange(next);
                }}
              />
            );
          }
          case "locales": {
            const selected = Array.isArray(v) ? (v as Locale[]) : [];
            return (
              <fieldset key={f.key} className={cn("flex flex-col gap-2", wrap)}>
                <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
                <div className="flex flex-wrap gap-4">
                  {LOCALES.map((locale) => (
                    <label key={locale} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected.includes(locale)}
                        disabled={disabled}
                        onChange={(e) => set(f.key, e.target.checked ? [...selected, locale] : selected.filter((l) => l !== locale))}
                      />
                      {t(`content.localeNames.${locale}`)}
                    </label>
                  ))}
                </div>
                {errorAt(f.key) && <p className="text-xs text-destructive" role="alert">{errorAt(f.key)}</p>}
              </fieldset>
            );
          }
          case "group":
            return (
              <fieldset key={f.key} className={cn("rounded-xl border border-border p-4", wrap)}>
                <legend className="px-1.5 text-sm font-semibold">{label}</legend>
                {hint && <p className="mb-4 text-xs text-muted-foreground">{hint}</p>}
                <FieldGrid fields={f.fields} value={isRecord(v) ? v : {}} onChange={(next) => set(f.key, next)} errors={errors} path={`${path}.${f.key}`} disabled={disabled} />
              </fieldset>
            );
          case "list": {
            const items = Array.isArray(v) ? (v as CmsData[]) : [];
            const update = (next: CmsData[]) => set(f.key, next);
            const swap = (a: number, b: number) => {
              const next = [...items];
              [next[a], next[b]] = [next[b], next[a]];
              update(next);
            };
            return (
              <div key={f.key} className={cn("flex flex-col gap-3", wrap)}>
                <div className="flex items-center justify-between gap-3">
                  <Label>{label}</Label>
                  <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => update([...items, defaultValue(f.fields)])}>
                    <Plus />
                    {t("common.add")}
                  </Button>
                </div>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                {errorAt(f.key) && <p className="text-xs text-destructive" role="alert">{errorAt(f.key)}</p>}
                {items.length === 0 && <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted-foreground">{t("cms.listEmpty")}</p>}
                {items.map((item, index) => (
                  <div key={index} className="rounded-xl border border-border p-4">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold">
                        <span className="tabular text-muted-foreground">{index + 1}.</span> {f.titleKey ? displayText(item[f.titleKey]) : ""}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button type="button" variant="ghost" size="iconSm" aria-label={t("common.moveUp")} disabled={disabled || index === 0} onClick={() => swap(index, index - 1)}>
                          <ArrowUp />
                        </Button>
                        <Button type="button" variant="ghost" size="iconSm" aria-label={t("common.moveDown")} disabled={disabled || index === items.length - 1} onClick={() => swap(index, index + 1)}>
                          <ArrowDown />
                        </Button>
                        <Button type="button" variant="ghost" size="iconSm" className="text-destructive" aria-label={t("common.remove")} disabled={disabled} onClick={() => update(items.filter((_, i) => i !== index))}>
                          <Trash />
                        </Button>
                      </div>
                    </div>
                    <FieldGrid
                      fields={f.fields}
                      value={item}
                      onChange={(next) => update(items.map((entry, i) => (i === index ? next : entry)))}
                      errors={errors}
                      path={`${path}.${f.key}.${index}`}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            );
          }
          case "ltextList": {
            const items = Array.isArray(v) ? v.map(asText) : [];
            const update = (next: LocalizedText[]) => set(f.key, next);
            return (
              <div key={f.key} className={cn("flex flex-col gap-3", wrap)}>
                <div className="flex items-center justify-between gap-3">
                  <Label>{label}</Label>
                  <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => update([...items, emptyText()])}>
                    <Plus />
                    {t("common.add")}
                  </Button>
                </div>
                {items.length === 0 && <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted-foreground">{t("cms.listEmpty")}</p>}
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <LocalizedInput className="min-w-0 flex-1" label={`${label} ${index + 1}`} disabled={disabled} value={item} onChange={(next) => update(items.map((entry, i) => (i === index ? next : entry)))} />
                    <Button type="button" variant="ghost" size="iconSm" className="mt-7 text-destructive" aria-label={t("common.remove")} disabled={disabled} onClick={() => update(items.filter((_, i) => i !== index))}>
                      <Trash />
                    </Button>
                  </div>
                ))}
              </div>
            );
          }
        }
      })}
    </div>
  );
}
