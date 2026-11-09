"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { registerForEvent } from "@/actions/registrations";
import { registrationSchema, type RegistrationInput, type RegistrationOutput, type RegistrationResult } from "@/components/activities/registration-schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { IconCircle } from "@/components/ui/primitives";

type Outcome = { kind: "success"; name: string; participants: number; result: RegistrationResult } | { kind: "error"; message: string };

/**
 * Formulir pendaftaran agenda (react-hook-form + zod). Sukses menampilkan ringkasan;
 * bila Supabase belum aktif, tampilkan tombol WhatsApp berisi pesan yang sama.
 */
export function EventRegistrationForm({ eventSlug, eventTitle, locale, full, closed }: { eventSlug: string; eventTitle: string; locale: Locale; full: boolean; closed: boolean }) {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const tv = useTranslations();
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<RegistrationInput, unknown, RegistrationOutput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { eventSlug, fullName: "", contact: "", participants: 1, notes: "", consent: false, honeypot: "", locale },
  });
  const { register, handleSubmit, setError, formState } = form;

  const translateError = (message?: string) => (message ? tv(message) : undefined);

  function onSubmit(values: RegistrationOutput) {
    setOutcome(null);
    startTransition(async () => {
      const res = await registerForEvent(values);
      if (res.ok) {
        if (!res.data) {
          setOutcome({ kind: "success", name: values.fullName, participants: values.participants, result: { status: "registered", fallback: null } });
          return;
        }
        setOutcome({ kind: "success", name: values.fullName, participants: values.participants, result: res.data });
        return;
      }
      if (res.error === "validation" && res.fieldErrors) {
        for (const [field, message] of Object.entries(res.fieldErrors)) {
          setError(field as keyof RegistrationInput, { message });
        }
        setOutcome({ kind: "error", message: tc("errors.validation") });
      } else if (res.error === "rate_limit") {
        setOutcome({ kind: "error", message: t("form.rateLimit") });
      } else {
        setOutcome({ kind: "error", message: tc("errors.generic") });
      }
    });
  }

  if (closed) return null;

  if (outcome?.kind === "success") {
    const { result } = outcome;
    const waitlist = result.status === "waitlist";
    return (
      <div className="card-surface p-6" role="status" aria-live="polite">
        <div className="flex items-start gap-4">
          <IconCircle tone="soft">
            {result.fallback === "whatsapp" ? <WhatsAppIcon /> : <CircleCheck />}
          </IconCircle>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold">{result.fallback === "whatsapp" ? t("form.fallbackTitle") : t("form.successTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.fallback === "whatsapp"
                ? t("form.fallbackBody")
                : t(waitlist ? "form.successWaitlist" : "form.successRegistered", { name: outcome.name, participants: outcome.participants })}
            </p>
            {result.fallback === "whatsapp" && (
              <a href={result.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "md", className: "mt-4" })}>
                <WhatsAppIcon />
                {t("form.whatsapp")}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label={eventTitle} className="card-surface p-5 sm:p-6">
      <h3 className="text-lg font-bold">{t("form.title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("form.description")}</p>
      {full && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          {t("form.fullNotice")}
        </p>
      )}

      <input type="hidden" {...register("eventSlug")} />
      <input type="hidden" {...register("locale")} />
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("form.name")} htmlFor="reg-name" required error={translateError(formState.errors.fullName?.message)}>
          <Input id="reg-name" autoComplete="name" placeholder={t("form.namePlaceholder")} aria-invalid={Boolean(formState.errors.fullName)} {...register("fullName")} />
        </Field>
        <Field label={t("form.contact")} htmlFor="reg-contact" required error={translateError(formState.errors.contact?.message)}>
          <Input id="reg-contact" autoComplete="tel" inputMode="email" placeholder={t("form.contactPlaceholder")} aria-invalid={Boolean(formState.errors.contact)} {...register("contact")} />
        </Field>
        <Field label={t("form.participants")} htmlFor="reg-participants" required hint={t("form.participantsHint")} error={translateError(formState.errors.participants?.message)}>
          <Input id="reg-participants" type="number" min={1} max={10} step={1} inputMode="numeric" aria-invalid={Boolean(formState.errors.participants)} {...register("participants", { valueAsNumber: true })} />
        </Field>
        <Field label={t("form.notes")} htmlFor="reg-notes" optionalLabel={tc("labels.optional")} error={translateError(formState.errors.notes?.message)} className="sm:col-span-2">
          <Textarea id="reg-notes" rows={3} placeholder={t("form.notesPlaceholder")} {...register("notes")} />
        </Field>
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm">
        <Checkbox aria-invalid={Boolean(formState.errors.consent)} {...register("consent")} />
        <span>
          {tc("consent.privacy")}{" "}
          <Link href="/privacy" className="font-semibold text-brand underline-offset-4 hover:underline">
            {tc("consent.privacyLink")}
          </Link>
        </span>
      </label>
      {formState.errors.consent?.message && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {translateError(formState.errors.consent.message)}
        </p>
      )}

      {outcome?.kind === "error" && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <span>
            <span className="font-semibold">{t("form.errorTitle")}</span>
            <br />
            {outcome.message}
          </span>
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="mt-6 w-full sm:w-auto">
        {pending ? <LoaderCircle className="animate-spin" /> : null}
        {pending ? t("form.submitting") : full ? t("form.submitWaitlist") : t("form.submit")}
      </Button>
    </form>
  );
}
