"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CircleCheck, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { tokyoDateKey } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { IconCircle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { confirmDonation } from "@/actions/donations";
import { confirmDonationSchema, type ConfirmDonationInput, type ConfirmDonationValues } from "@/components/donate/schemas";
import type { DonationCurrency } from "@/components/donate/unique-amount";

export type FormProgram = { slug: string; label: string };
export type FormAccount = { id: string; label: string; currency: DonationCurrency };

type Outcome = { kind: "saved" } | { kind: "whatsapp"; url: string };

/**
 * Formulir konfirmasi transfer (PRD-05 §5): react-hook-form + zod, prefill nominal unik,
 * honeypot, persetujuan privasi, dan fallback WhatsApp bila Supabase belum aktif.
 */
export function ConfirmationForm({
  locale,
  programs,
  accounts,
  prefillCurrency,
  prefillAmount,
  compact = false,
}: {
  locale: Locale;
  programs: FormProgram[];
  accounts: FormAccount[];
  prefillCurrency: DonationCurrency;
  prefillAmount: number | null;
  compact?: boolean;
}) {
  const t = useTranslations("donate.form");
  const tc = useTranslations("common");
  const tAll = useTranslations();
  const toast = useToast();
  const id = React.useId();
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);

  const firstAccount = accounts.find((a) => a.currency === prefillCurrency) ?? accounts[0];
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmDonationInput, unknown, ConfirmDonationValues>({
    resolver: zodResolver(confirmDonationSchema),
    defaultValues: {
      programSlug: programs[0]?.slug ?? "",
      accountId: firstAccount?.id ?? "",
      currency: prefillCurrency,
      amount: prefillAmount ?? undefined,
      transferredAt: tokyoDateKey(),
      donorName: "",
      donorContact: "",
      onBehalfOf: "",
      message: "",
      honeypot: "",
      locale,
    },
  });

  const currency = useWatch({ control, name: "currency" });
  const accountsForCurrency = accounts.filter((a) => a.currency === currency);

  // Nominal unik dari pemilih di atas ikut terisi (setValue bukan setState, aman di effect).
  React.useEffect(() => {
    setValue("currency", prefillCurrency);
    const current = getValues("accountId");
    if (!accounts.some((a) => a.id === current && a.currency === prefillCurrency)) {
      const first = accounts.find((a) => a.currency === prefillCurrency);
      if (first) setValue("accountId", first.id);
    }
    if (prefillAmount !== null) setValue("amount", prefillAmount, { shouldValidate: true, shouldDirty: true });
  }, [prefillCurrency, prefillAmount, accounts, setValue, getValues]);

  const msg = (key?: string) => (key ? (tAll.has(key) ? tAll(key) : key) : undefined);

  async function onSubmit(values: ConfirmDonationValues) {
    const res = await confirmDonation({ ...values, locale });
    if (!res.ok) {
      if (res.error === "validation" && res.fieldErrors) {
        for (const [path, key] of Object.entries(res.fieldErrors)) {
          setError(path as keyof ConfirmDonationInput, { message: key });
        }
      }
      toast({ title: res.error === "rate_limit" ? t("errors.rateLimit") : t("errors.generic"), tone: "error" });
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
              <MessageCircle />
              {t("success.whatsapp")}
            </a>
          )}
          <Button
            variant="outline"
            onClick={() => {
              reset();
              setOutcome(null);
            }}
          >
            {t("success.another")}
          </Button>
        </div>
      </div>
    );
  }

  const twoCols = compact ? "grid gap-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-surface space-y-5 p-5 sm:p-6">
      <div className={twoCols}>
        <Field label={t("fields.program")} htmlFor={`${id}-program`} error={msg(errors.programSlug?.message)} required>
          <Select id={`${id}-program`} {...register("programSlug")} aria-invalid={Boolean(errors.programSlug)}>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.currency")} htmlFor={`${id}-currency`} error={msg(errors.currency?.message)} required>
          <Select
            id={`${id}-currency`}
            {...register("currency", {
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                const next = e.target.value as DonationCurrency;
                const first = accounts.find((a) => a.currency === next);
                if (first) setValue("accountId", first.id);
              },
            })}
          >
            <option value="JPY">JPY</option>
            <option value="IDR">IDR</option>
          </Select>
        </Field>
        <Field label={t("fields.account")} htmlFor={`${id}-account`} error={msg(errors.accountId?.message)} required>
          <Select id={`${id}-account`} {...register("accountId")} aria-invalid={Boolean(errors.accountId)}>
            {accountsForCurrency.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.amount")} htmlFor={`${id}-amount`} hint={t("fields.amountHint")} error={msg(errors.amount?.message)} required>
          <Input
            id={`${id}-amount`}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className="tabular"
            aria-invalid={Boolean(errors.amount)}
            {...register("amount", { valueAsNumber: true })}
          />
        </Field>
        <Field label={t("fields.date")} htmlFor={`${id}-date`} error={msg(errors.transferredAt?.message)} required>
          <Input id={`${id}-date`} type="date" max={tokyoDateKey()} aria-invalid={Boolean(errors.transferredAt)} {...register("transferredAt")} />
        </Field>
        <Field label={t("fields.name")} htmlFor={`${id}-name`} hint={t("fields.nameHint")} error={msg(errors.donorName?.message)} optionalLabel={tc("labels.optional")}>
          <Input id={`${id}-name`} autoComplete="name" {...register("donorName")} />
        </Field>
        <Field label={t("fields.contact")} htmlFor={`${id}-contact`} hint={t("fields.contactHint")} error={msg(errors.donorContact?.message)} optionalLabel={tc("labels.optional")}>
          <Input id={`${id}-contact`} autoComplete="tel" {...register("donorContact")} />
        </Field>
        <Field label={t("fields.onBehalf")} htmlFor={`${id}-behalf`} hint={t("fields.onBehalfHint")} error={msg(errors.onBehalfOf?.message)} optionalLabel={tc("labels.optional")}>
          <Input id={`${id}-behalf`} {...register("onBehalfOf")} />
        </Field>
      </div>
      <Field label={t("fields.message")} htmlFor={`${id}-message`} error={msg(errors.message?.message)} optionalLabel={tc("labels.optional")}>
        <Textarea id={`${id}-message`} rows={3} {...register("message")} />
      </Field>

      <input type="text" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden {...register("honeypot")} />

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

      <Button type="submit" size="lg" disabled={isSubmitting} className={cn(compact && "w-full")}>
        {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />}
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
