"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CalendarPlus, CircleCheck, LoaderCircle, Repeat } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/input";
import { IconCircle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { registerRecurringDonor } from "@/actions/donations";
import { recurringDonorSchema, type RecurringDonorInput, type RecurringDonorValues } from "@/components/donate/schemas";
import { buildRecurringCalendarUrl } from "@/components/donate/calendar-link";

type Outcome = { kind: "saved" } | { kind: "whatsapp"; url: string };
const METHODS = ["bank", "qris", "ewallet"] as const;

/** Pendaftaran donatur tetap (PRD-05 §6) + tautan pengingat Google Calendar bulanan. */
export function RecurringDonorForm({ locale, siteUrl }: { locale: Locale; siteUrl: string }) {
  const t = useTranslations("donate.recurring");
  const tc = useTranslations("common");
  const tAll = useTranslations();
  const toast = useToast();
  const id = React.useId();
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RecurringDonorInput, unknown, RecurringDonorValues>({
    resolver: zodResolver(recurringDonorSchema),
    defaultValues: {
      fullName: "",
      contact: "",
      currency: locale === "id" ? "IDR" : "JPY",
      paymentDay: 5,
      method: "bank",
      publishName: false,
      honeypot: "",
      locale,
    },
  });

  const msg = (key?: string) => (key ? (tAll.has(key) ? tAll(key) : key) : undefined);

  const [monthlyAmount, watchedCurrency, watchedDay] = useWatch({ control, name: ["monthlyAmount", "currency", "paymentDay"] });
  const currency = watchedCurrency ?? "JPY";
  const paymentDay = watchedDay ?? 5;
  const amountLabel = typeof monthlyAmount === "number" && Number.isFinite(monthlyAmount) && monthlyAmount > 0 ? formatCurrency(monthlyAmount, currency, locale) : "-";
  const calendarUrl = buildRecurringCalendarUrl({
    title: t("calendarTitle"),
    details: t("calendarDetails", { amount: amountLabel, url: `${siteUrl.replace(/\/$/, "")}/${locale}/donate` }),
    day: Number.isFinite(paymentDay) ? paymentDay : 5,
  });

  async function onSubmit(values: RecurringDonorValues) {
    const res = await registerRecurringDonor({ ...values, locale });
    if (!res.ok) {
      if (res.error === "validation" && res.fieldErrors) {
        for (const [path, key] of Object.entries(res.fieldErrors)) {
          setError(path as keyof RecurringDonorInput, { message: key });
        }
      }
      toast({ title: res.error === "rate_limit" ? tc("errors.tooMany") : tc("errors.generic"), tone: "error" });
      return;
    }
    const data = res.data;
    setOutcome(!data || data.fallback === null ? { kind: "saved" } : { kind: "whatsapp", url: data.url });
    toast({ title: t("success.title"), tone: "success" });
  }

  if (outcome) {
    return (
      <div className="card-surface flex flex-col items-center gap-4 p-6 text-center" role="status">
        <IconCircle tone="soft" size="lg">
          <CircleCheck />
        </IconCircle>
        <h3 className="text-xl font-bold">{t("success.title")}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{outcome.kind === "saved" ? t("success.saved") : t("success.fallback")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {outcome.kind === "whatsapp" && (
            <a href={outcome.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
              <WhatsAppIcon />
              {t("success.whatsapp")}
            </a>
          )}
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
            <CalendarPlus />
            {t("calendar")}
          </a>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              setOutcome(null);
            }}
          >
            {tc("actions.reset")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-surface space-y-5 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("fields.name")} htmlFor={`${id}-name`} error={msg(errors.fullName?.message)} required>
          <Input id={`${id}-name`} autoComplete="name" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
        </Field>
        <Field label={t("fields.contact")} htmlFor={`${id}-contact`} hint={t("fields.contactHint")} error={msg(errors.contact?.message)} required>
          <Input id={`${id}-contact`} autoComplete="tel" aria-invalid={Boolean(errors.contact)} {...register("contact")} />
        </Field>
        <Field label={t("fields.currency")} htmlFor={`${id}-currency`} required>
          <Select id={`${id}-currency`} {...register("currency")}>
            <option value="JPY">JPY</option>
            <option value="IDR">IDR</option>
          </Select>
        </Field>
        <Field label={t("fields.amount")} htmlFor={`${id}-amount`} error={msg(errors.monthlyAmount?.message)} required>
          <Input id={`${id}-amount`} type="number" inputMode="numeric" min={1} step={1} className="tabular" aria-invalid={Boolean(errors.monthlyAmount)} {...register("monthlyAmount", { valueAsNumber: true })} />
        </Field>
        <Field label={t("fields.day")} htmlFor={`${id}-day`} hint={t("fields.dayHint")} error={msg(errors.paymentDay?.message)} required>
          <Input id={`${id}-day`} type="number" inputMode="numeric" min={1} max={28} step={1} className="tabular" aria-invalid={Boolean(errors.paymentDay)} {...register("paymentDay", { valueAsNumber: true })} />
        </Field>
        <Field label={t("fields.method")} htmlFor={`${id}-method`} required>
          <Select id={`${id}-method`} {...register("method")}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {t(`fields.methods.${m}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <input type="text" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden {...register("honeypot")} />

      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <Checkbox {...register("publishName")} />
        <span>{t("fields.publishName")}</span>
      </label>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <Checkbox aria-invalid={Boolean(errors.consent)} {...register("consent")} />
          <span>
            {tc("consent.privacy")}{" "}
            <Link href="/privacy" className="text-brand underline underline-offset-4">
              {tc("consent.privacyLink")}
            </Link>
          </span>
        </label>
        {errors.consent?.message && (
          <p className="text-xs text-destructive" role="alert">
            {msg(errors.consent.message)}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Repeat />}
          {isSubmitting ? tc("actions.sending") : t("submit")}
        </Button>
        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
          <CalendarPlus />
          {t("calendar")}
        </a>
      </div>
    </form>
  );
}
