"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import type { ObligatoryPrayer, PrayerConfig, PrayerName } from "@/lib/types";
import { savePrayerConfig } from "@/actions/admin/prayer";
import { Field, Input, Select } from "@/components/ui/input";
import { useAdminT } from "@/components/admin/i18n-context";
import { prayerConfigSchema, type PrayerConfigInput } from "@/components/admin/schemas";
import { textOrEmpty } from "@/components/admin/utils";
import { useAdminAction, useFieldError } from "@/components/admin/use-admin-action";
import { LocalizedTextarea } from "@/components/admin/localized-input";
import { FormBar, FormSection, GuardedButton } from "@/components/admin/form-bar";

const METHODS = ["MuslimWorldLeague", "Egyptian", "Karachi", "UmmAlQura", "Dubai", "MoonsightingCommittee", "NorthAmerica", "Kuwait", "Qatar", "Singapore", "Turkey", "Tehran"] as const;
const HIGH_LAT = ["MiddleOfTheNight", "SeventhOfTheNight", "TwilightAngle"] as const;
const ALL_PRAYERS: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
const OBLIGATORY: ObligatoryPrayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function toInput(c: PrayerConfig): PrayerConfigInput {
  const rule = (p: ObligatoryPrayer) => {
    const r = c.iqamah[p];
    return r.type === "fixed" ? { type: "fixed" as const, minutes: 10, time: r.time } : { type: "offset" as const, minutes: r.minutes, time: "" };
  };
  return {
    method: c.method,
    madhab: c.madhab,
    highLatitudeRule: c.highLatitudeRule,
    adjustments: { ...c.adjustments },
    iqamah: { fajr: rule("fajr"), dhuhr: rule("dhuhr"), asr: rule("asr"), maghrib: rule("maghrib"), isha: rule("isha") },
    hijriAdjustment: c.hijriAdjustment,
    jumuahTime: c.jumuah.time,
    jumuahSecondTime: c.jumuah.secondTime ?? "",
    jumuahNote: textOrEmpty(c.jumuah.note),
    ramadanStart: c.ramadan?.start ?? "",
    ramadanEnd: c.ramadan?.end ?? "",
  };
}

/** Formulir prayer_config: koreksi menit, iqamah, Jumat, Hijriah, Ramadan. */
export function PrayerForm({ config, guard }: { config: PrayerConfig; guard: "demo" | "role" | undefined }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const { run, pending } = useAdminAction();
  const disabled = Boolean(guard);
  const form = useForm<PrayerConfigInput>({ resolver: zodResolver(prayerConfigSchema), defaultValues: toInput(config) });
  const { register, control, handleSubmit, formState: { errors } } = form;
  const iqamah = useWatch({ control, name: "iqamah" });

  const onSubmit = handleSubmit((values) => run(() => savePrayerConfig(values), { success: t("prayer.saved") }));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FormSection title={t("prayer.method")}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label={t("prayer.method")} htmlFor="method">
            <Select id="method" disabled={disabled} {...register("method")}>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("prayer.madhab")} htmlFor="madhab">
            <Select id="madhab" disabled={disabled} {...register("madhab")}>
              <option value="shafi">{t("prayer.madhabs.shafi")}</option>
              <option value="hanafi">{t("prayer.madhabs.hanafi")}</option>
            </Select>
          </Field>
          <Field label={t("prayer.highLatitude")} htmlFor="highLatitudeRule">
            <Select id="highLatitudeRule" disabled={disabled} {...register("highLatitudeRule")}>
              {HIGH_LAT.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("prayer.adjustments")} description={t("prayer.adjustmentsHint")}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ALL_PRAYERS.map((p) => (
            <Field key={p} label={t(`prayer.prayers.${p}`)} htmlFor={`adj-${p}`} error={fieldError(errors.adjustments?.[p]?.message)}>
              <Input id={`adj-${p}`} type="number" min={-60} max={60} step={1} disabled={disabled} className="tabular" {...register(`adjustments.${p}`, { valueAsNumber: true })} />
            </Field>
          ))}
        </div>
      </FormSection>

      <FormSection title={t("prayer.iqamah")} description={t("prayer.iqamahHint")}>
        <div className="flex flex-col divide-y divide-border">
          {OBLIGATORY.map((p) => {
            const type = iqamah[p].type;
            return (
              <div key={p} className="grid grid-cols-2 items-end gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr_1fr]">
                <p className="col-span-2 font-semibold sm:col-span-1 sm:pb-3">{t(`prayer.prayers.${p}`)}</p>
                <Field label={t("prayer.iqamahType")} htmlFor={`iq-type-${p}`}>
                  <Select id={`iq-type-${p}`} disabled={disabled} {...register(`iqamah.${p}.type`)}>
                    <option value="offset">{t("prayer.offset")}</option>
                    <option value="fixed">{t("prayer.fixed")}</option>
                  </Select>
                </Field>
                {type === "fixed" ? (
                  <Field label={t("prayer.fixed")} htmlFor={`iq-time-${p}`}>
                    <Input id={`iq-time-${p}`} type="time" disabled={disabled} {...register(`iqamah.${p}.time`)} />
                  </Field>
                ) : (
                  <Field label={t("prayer.minutes")} htmlFor={`iq-min-${p}`} error={fieldError(errors.iqamah?.[p]?.minutes?.message)}>
                    <Input id={`iq-min-${p}`} type="number" min={0} max={120} disabled={disabled} className="tabular" {...register(`iqamah.${p}.minutes`, { valueAsNumber: true })} />
                  </Field>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>

      <FormSection title={t("prayer.jumuahSection")}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("prayer.jumuahTime")} htmlFor="jumuahTime" required error={fieldError(errors.jumuahTime?.message)}>
            <Input id="jumuahTime" type="time" disabled={disabled} {...register("jumuahTime")} />
          </Field>
          <Field label={t("prayer.jumuahSecondTime")} htmlFor="jumuahSecondTime" optionalLabel={t("common.optional")}>
            <Input id="jumuahSecondTime" type="time" disabled={disabled} {...register("jumuahSecondTime")} />
          </Field>
        </div>
        <Controller control={control} name="jumuahNote" render={({ field }) => <LocalizedTextarea label={t("prayer.jumuahNote")} disabled={disabled} value={field.value} onChange={field.onChange} />} />
      </FormSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection title={t("prayer.hijri")} description={t("prayer.hijriHint")}>
          <Field label={t("prayer.hijri")} htmlFor="hijriAdjustment">
            <Select id="hijriAdjustment" disabled={disabled} {...register("hijriAdjustment", { valueAsNumber: true })}>
              <option value={-1}>-1</option>
              <option value={0}>0</option>
              <option value={1}>+1</option>
            </Select>
          </Field>
        </FormSection>
        <FormSection title={t("prayer.ramadan")} description={t("prayer.ramadanHint")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("prayer.ramadanStart")} htmlFor="ramadanStart">
              <Input id="ramadanStart" type="date" disabled={disabled} {...register("ramadanStart")} />
            </Field>
            <Field label={t("prayer.ramadanEnd")} htmlFor="ramadanEnd">
              <Input id="ramadanEnd" type="date" disabled={disabled} {...register("ramadanEnd")} />
            </Field>
          </div>
        </FormSection>
      </div>

      <FormBar backHref="/admin" pending={pending}>
        <GuardedButton type="submit" reason={guard} pending={pending} size="sm">
          <Save />
          {t("common.save")}
        </GuardedButton>
      </FormBar>
    </form>
  );
}
