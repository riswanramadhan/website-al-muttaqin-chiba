"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Field, Input } from "@/components/ui/input";
import { SwitchRow } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { deleteItem, saveItem, saveSetting } from "@/actions/admin/cms";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { FormBar, FormSection, GuardedButton } from "@/components/admin/form-bar";
import { FieldGrid, type CmsErrors } from "@/components/admin/cms/cms-fields";
import { buildSchema, cleanValue, displayText, hydrate, itemKeySchema, toItemKey, type CmsData, type FieldDef } from "@/components/admin/cms/fields";
import { findCollection, findSetting } from "@/components/admin/cms/registry";
import type { CmsItem } from "@/components/admin/cms/data.server";

export type Guard = "demo" | "role" | undefined;

/** Validasi di browser dengan skema yang sama seperti server; hasilnya peta jalur -> pesan. */
function validate(fields: FieldDef[], data: CmsData): CmsErrors {
  const parsed = buildSchema(fields).safeParse(cleanValue(fields, data));
  if (parsed.success) return {};
  const errors: CmsErrors = {};
  for (const issue of parsed.error.issues) {
    const path = ["data", ...issue.path].join(".");
    if (!errors[path]) errors[path] = issue.message;
  }
  return errors;
}

function useUnsavedWarning(dirty: boolean) {
  React.useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/** Formulir buat/ubah satu item koleksi CMS. */
export function CmsItemForm({ slug, item, guard }: { slug: string; item: CmsItem | null; guard: Guard }) {
  const { t } = useAdminT();
  const toast = useToast();
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const def = findCollection(slug);
  const fields = React.useMemo(() => def?.fields ?? [], [def]);
  const disabled = Boolean(guard);

  const [data, setData] = React.useState<CmsData>(() => hydrate(fields, item?.data));
  const [published, setPublished] = React.useState(item?.published ?? true);
  const [key, setKey] = React.useState(item?.key ?? "");
  const [keyTouched, setKeyTouched] = React.useState(false);
  const [errors, setErrors] = React.useState<CmsErrors>({});
  const [dirty, setDirty] = React.useState(false);
  useUnsavedWarning(dirty && !disabled);

  if (!def) return null;
  const keySource = def.keyFrom ?? def.titleField;
  // Kunci item baru mengikuti judul/slug sampai admin mengetiknya sendiri.
  const effectiveKey = item ? item.key : keyTouched ? key : toItemKey(displayText(data[keySource]));

  const change = (next: CmsData) => {
    setData(next);
    setDirty(true);
  };

  const submit = () => {
    const nextErrors = validate(fields, data);
    const finalKey = effectiveKey || `${def.slug}-${Date.now().toString(36)}`;
    if (!item && !itemKeySchema.safeParse(finalKey).success) nextErrors.key = "errors.slug";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast({ title: t("errors.validation"), tone: "error" });
      return;
    }
    void run(() => saveItem({ collection: def.name, id: item?.id, key: finalKey, published, data }), {
      success: t("common.saved"),
      onSuccess: ({ id }) => {
        setDirty(false);
        if (!item) router.replace(`/admin/cms/${def.slug}/${id}`);
      },
      onError: (result) => {
        if (result.fieldErrors) setErrors(result.fieldErrors);
      },
    });
  };

  const remove = () => {
    if (!item || !window.confirm(t("content.deleteConfirm", { entity: t(`cms.collections.${def.slug}.entity`) }))) return;
    void run(() => deleteItem({ collection: def.name, id: item.id }), {
      success: t("common.deleted"),
      refresh: false,
      onSuccess: () => {
        setDirty(false);
        router.replace(`/admin/cms/${def.slug}`);
      },
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-6" noValidate>
      <FormSection title={t(`cms.collections.${def.slug}.title`)} description={t(`cms.collections.${def.slug}.subtitle`)}>
        <FieldGrid fields={fields} value={data} onChange={change} errors={errors} path="data" disabled={disabled} />
      </FormSection>

      <FormSection title={t("cms.visibility")}>
        <div className="rounded-xl border border-border px-4">
          <SwitchRow id="cms-published" label={t("fields.published")} description={t("cms.publishedHint")} checked={published} disabled={disabled} onCheckedChange={(checked) => { setPublished(checked); setDirty(true); }} />
        </div>
        <Field label={t("cms.itemKey")} htmlFor="cms-key" hint={item ? t("cms.itemKeyLocked") : t("cms.itemKeyHint")} error={errors.key ? t(errors.key) : undefined}>
          <Input
            id="cms-key"
            value={effectiveKey}
            disabled={disabled || Boolean(item)}
            aria-invalid={Boolean(errors.key) || undefined}
            onChange={(e) => {
              setKeyTouched(true);
              setKey(e.target.value);
            }}
          />
        </Field>
      </FormSection>

      <FormBar backHref={`/admin/cms/${def.slug}`} onDelete={item ? remove : undefined} deleteReason={guard} pending={pending}>
        <GuardedButton type="submit" variant="primary" size="sm" reason={guard} pending={pending}>
          <Save />
          {t("cms.saveAndRefresh")}
        </GuardedButton>
      </FormBar>
    </form>
  );
}

/** Formulir pengaturan tunggal (profil, video unggulan, pop-up promo). */
export function CmsSettingForm({ slug, initial, guard }: { slug: string; initial: CmsData; guard: Guard }) {
  const { t } = useAdminT();
  const toast = useToast();
  const { run, pending } = useAdminAction();
  const def = findSetting(slug);
  const fields = React.useMemo(() => def?.fields ?? [], [def]);
  const disabled = Boolean(guard);

  const [data, setData] = React.useState<CmsData>(() => hydrate(fields, initial));
  const [errors, setErrors] = React.useState<CmsErrors>({});
  const [dirty, setDirty] = React.useState(false);
  useUnsavedWarning(dirty && !disabled);

  if (!def) return null;

  const submit = () => {
    const nextErrors = validate(fields, data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast({ title: t("errors.validation"), tone: "error" });
      return;
    }
    void run(() => saveSetting({ key: def.key, data }), {
      success: t("common.saved"),
      onSuccess: () => setDirty(false),
      onError: (result) => {
        if (result.fieldErrors) setErrors(result.fieldErrors);
      },
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-6" noValidate>
      <FormSection title={t(`cms.settings.${def.slug}.title`)} description={t(`cms.settings.${def.slug}.help`)}>
        <FieldGrid fields={fields} value={data} onChange={(next) => { setData(next); setDirty(true); }} errors={errors} path="data" disabled={disabled} />
      </FormSection>
      <FormBar backHref="/admin" pending={pending}>
        <GuardedButton type="submit" variant="primary" size="sm" reason={guard} pending={pending}>
          <Save />
          {t("cms.saveAndRefresh")}
        </GuardedButton>
      </FormBar>
    </form>
  );
}
