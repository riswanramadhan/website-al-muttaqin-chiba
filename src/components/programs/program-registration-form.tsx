"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { LoaderCircle, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale, ProgramId } from "@/lib/types";
import { registerForProgram } from "@/actions/programs";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  programRegistrationSchema,
  type ProgramRegistrationInput,
  type ProgramRegistrationValues,
  type SubmitOutcome,
} from "@/components/programs/schemas";
import { FormOutcome, HoneypotField, useFieldErrorText } from "@/components/programs/form-outcome";

/** Formulir pendaftaran program: nama (orang tua/peserta), usia untuk TPA, kontak, catatan, persetujuan. */
export function ProgramRegistrationForm({ locale, programId, programTitle }: { locale: Locale; programId: ProgramId; programTitle: string }) {
  const t = useTranslations("programs");
  const tc = useTranslations("common");
  const toast = useToast();
  const errorText = useFieldErrorText();
  const [outcome, setOutcome] = React.useState<SubmitOutcome | null>(null);
  const [pending, startTransition] = React.useTransition();
  const isChildProgram = programId === "tpa";

  const form = useForm<ProgramRegistrationInput, unknown, ProgramRegistrationValues>({
    resolver: zodResolver(programRegistrationSchema),
    defaultValues: {
      programId,
      fullName: "",
      participantName: "",
      participantAge: "",
      contact: "",
      notes: "",
      consent: false,
      honeypot: "",
      locale,
    },
  });
  const { register, handleSubmit, formState, setError, reset } = form;
  const errors = formState.errors;

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const res = await registerForProgram({ ...values, locale });
      if (res.ok) {
        setOutcome(res.data ?? { fallback: null });
        toast({ title: tc("actions.sent"), tone: "success" });
        return;
      }
      if (res.error === "validation" && res.fieldErrors) {
        for (const [path, message] of Object.entries(res.fieldErrors)) {
          setError(path as keyof ProgramRegistrationInput, { message });
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
        successBody={t("form.success.body", { program: programTitle })}
        fallbackTitle={t("form.fallback.title")}
        fallbackBody={t("form.fallback.body")}
        onReset={() => {
          reset();
          setOutcome(null);
        }}
        resetLabel={t("form.another")}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <input type="hidden" {...register("programId")} />
      <HoneypotField {...register("honeypot")} />

      <Field label={isChildProgram ? t("form.parentName") : t("form.fullName")} htmlFor="reg-fullName" required error={errorText(errors.fullName?.message)}>
        <Input id="reg-fullName" autoComplete="name" aria-invalid={Boolean(errors.fullName)} {...register("fullName")} />
      </Field>

      {isChildProgram ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_8rem]">
          <Field label={t("form.participantName")} htmlFor="reg-participantName" required error={errorText(errors.participantName?.message)}>
            <Input id="reg-participantName" aria-invalid={Boolean(errors.participantName)} {...register("participantName")} />
          </Field>
          <Field label={t("form.participantAge")} htmlFor="reg-participantAge" required error={errorText(errors.participantAge?.message)}>
            <Input id="reg-participantAge" type="number" inputMode="numeric" min={1} max={120} aria-invalid={Boolean(errors.participantAge)} {...register("participantAge")} />
          </Field>
        </div>
      ) : (
        <Field label={t("form.participantName")} htmlFor="reg-participantName" optionalLabel={tc("labels.optional")} hint={t("form.participantHint")} error={errorText(errors.participantName?.message)}>
          <Input id="reg-participantName" {...register("participantName")} />
        </Field>
      )}

      <Field label={t("form.contact")} htmlFor="reg-contact" required hint={t("form.contactHint")} error={errorText(errors.contact?.message)}>
        <Input id="reg-contact" autoComplete="tel" aria-invalid={Boolean(errors.contact)} {...register("contact")} />
      </Field>

      <Field label={t("form.notes")} htmlFor="reg-notes" optionalLabel={tc("labels.optional")} error={errorText(errors.notes?.message)}>
        <Textarea id="reg-notes" placeholder={t("form.notesPlaceholder")} {...register("notes")} />
      </Field>

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

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
        {pending ? tc("actions.sending") : t("form.submit")}
      </Button>
    </form>
  );
}
