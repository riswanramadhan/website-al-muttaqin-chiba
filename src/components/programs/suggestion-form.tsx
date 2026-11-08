"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { LoaderCircle, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { sendSuggestion } from "@/actions/suggestions";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  FACILITY_LOCATIONS,
  SUGGESTION_KINDS,
  suggestionSchema,
  type SuggestionInput,
  type SuggestionKind,
  type SuggestionValues,
  type SubmitOutcome,
} from "@/components/programs/schemas";
import { FormOutcome, HoneypotField, useFieldErrorText } from "@/components/programs/form-outcome";

/**
 * Formulir saran/pertanyaan/laporan fasilitas (PRD-08b). Nama & kontak opsional (anonim).
 * `kind: facility` menampilkan pilihan lokasi (toilet, AC, karpet, lampu, lainnya).
 */
export function SuggestionForm({ locale, defaultKind = "suggestion", onDone }: { locale: Locale; defaultKind?: SuggestionKind; onDone?: () => void }) {
  const t = useTranslations("help");
  const tc = useTranslations("common");
  const toast = useToast();
  const errorText = useFieldErrorText();
  const [outcome, setOutcome] = React.useState<SubmitOutcome | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<SuggestionInput, unknown, SuggestionValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      kind: defaultKind,
      location: undefined,
      message: "",
      senderName: "",
      senderContact: "",
      consent: false,
      honeypot: "",
      locale,
    },
  });
  const { register, handleSubmit, formState, setError, reset, control } = form;
  const errors = formState.errors;
  const kind = useWatch({ control, name: "kind" });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const res = await sendSuggestion({ ...values, locale });
      if (res.ok) {
        setOutcome(res.data ?? { fallback: null });
        toast({ title: tc("actions.sent"), tone: "success" });
        return;
      }
      if (res.error === "validation" && res.fieldErrors) {
        for (const [path, message] of Object.entries(res.fieldErrors)) {
          setError(path as keyof SuggestionInput, { message });
        }
        toast({ title: tc("errors.validation"), tone: "error" });
        return;
      }
      toast({ title: res.error === "rate_limit" ? tc("errors.tooMany") : tc("errors.generic"), tone: "error" });
    });
  });

  if (outcome) {
    return (
      <FormOutcome
        outcome={outcome}
        successTitle={t("form.success.title")}
        successBody={t("form.success.body")}
        fallbackTitle={t("form.fallback.title")}
        fallbackBody={t("form.fallback.body")}
        onReset={() => {
          if (onDone) onDone();
          else {
            reset();
            setOutcome(null);
          }
        }}
        resetLabel={onDone ? tc("actions.close") : t("form.another")}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-4">
      <HoneypotField {...register("honeypot")} />

      <Field label={t("form.kind")} htmlFor="sg-kind" required error={errorText(errors.kind?.message)}>
        <Select id="sg-kind" aria-invalid={Boolean(errors.kind)} {...register("kind")}>
          {SUGGESTION_KINDS.map((k) => (
            <option key={k} value={k}>
              {t(`form.kinds.${k}`)}
            </option>
          ))}
        </Select>
      </Field>

      {kind === "facility" && (
        <Field label={t("form.location")} htmlFor="sg-location" required error={errorText(errors.location?.message)}>
          <Select id="sg-location" defaultValue="" aria-invalid={Boolean(errors.location)} {...register("location", { setValueAs: (v: string) => (v === "" ? undefined : v) })}>
            <option value="" disabled>
              {t("form.locationPlaceholder")}
            </option>
            {FACILITY_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {t(`form.locations.${loc}`)}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label={t("form.message")} htmlFor="sg-message" required error={errorText(errors.message?.message)}>
        <Textarea id="sg-message" placeholder={t(`form.placeholders.${kind}`)} aria-invalid={Boolean(errors.message)} {...register("message")} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("form.name")} htmlFor="sg-name" optionalLabel={tc("labels.optional")} error={errorText(errors.senderName?.message)}>
          <Input id="sg-name" autoComplete="name" placeholder={t("form.anonymous")} {...register("senderName")} />
        </Field>
        <Field label={t("form.contact")} htmlFor="sg-contact" optionalLabel={tc("labels.optional")} error={errorText(errors.senderContact?.message)}>
          <Input id="sg-contact" autoComplete="tel" {...register("senderContact")} />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">{t("form.anonymousHint")}</p>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <Checkbox aria-invalid={Boolean(errors.consent)} {...register("consent")} />
          <span>
            {tc("consent.privacy")}{" "}
            <Link href="/privacy" className="font-semibold text-brand underline-offset-4 hover:underline">
              {tc("consent.privacyLink")}
            </Link>
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-destructive" role="alert">
            {errorText(errors.consent.message)}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
        {pending ? tc("actions.sending") : t("form.submit")}
      </Button>
    </form>
  );
}
