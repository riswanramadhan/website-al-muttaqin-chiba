"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, Mail, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { sendContactMessage, type ContactMessageResult } from "@/actions/contact";
import { contactFormSchema, CONTACT_SUBJECTS, type ContactFormValues, type ContactSubject } from "@/components/about/contact-schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { IconCircle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WhatsAppIcon } from "@/components/site/social-icons";

type FormValues = ContactFormValues;

/**
 * Formulir kontak (PRD-03a): react-hook-form + zod, honeypot, persetujuan privasi.
 * Bila Supabase belum aktif, tampilkan tombol WhatsApp dan email berisi pesan yang sama.
 */
export function ContactForm({ defaultSubject = "general" }: { defaultSubject?: ContactSubject }) {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const tv = useTranslations();
  const locale = useLocale() as Locale;
  const toast = useToast();
  const [result, setResult] = React.useState<ContactMessageResult | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: defaultSubject, message: "", consent: false, honeypot: "", locale },
  });
  const { register, handleSubmit, setError, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  const msg = (key?: string) => (key ? tv(key) : undefined);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const res = await sendContactMessage({ ...values, locale });
    if (!res.ok) {
      if (res.error === "validation" && res.fieldErrors) {
        for (const [path, message] of Object.entries(res.fieldErrors)) {
          if (path in values) setError(path as keyof FormValues, { message });
        }
        setServerError(tc("errors.validation"));
      } else if (res.error === "rate_limit") {
        setServerError(tc("errors.tooMany"));
      } else if (res.error === "turnstile") {
        setServerError(t("form.errors.turnstile"));
      } else {
        setServerError(tc("errors.generic"));
      }
      return;
    }
    // Honeypot terisi: createAction mengembalikan data undefined; perlakukan seperti sukses.
    const data = res.data ?? { fallback: "none" as const, id: "" };
    setResult(data);
    toast({ title: data.fallback === "none" ? t("form.success.title") : t("form.success.fallbackTitle"), tone: "success" });
    if (data.fallback === "none") reset({ name: "", email: "", subject: defaultSubject, message: "", consent: false, honeypot: "", locale });
  }

  if (result) {
    const fallback = result.fallback === "whatsapp";
    return (
      <div className="card-muted flex flex-col items-start gap-4 p-6 sm:p-8" role="status">
        <IconCircle tone="brand">
          <CircleCheck />
        </IconCircle>
        <div>
          <p className="text-lg font-bold">{fallback ? t("form.success.fallbackTitle") : t("form.success.title")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fallback ? t("form.success.fallbackBody") : t("form.success.body")}</p>
        </div>
        {fallback && (
          <div className="flex flex-wrap gap-2">
            <a href={result.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "primary" })}>
              <WhatsAppIcon className="size-4" />
              {t("form.success.whatsapp")}
            </a>
            <a href={result.mailto} className={buttonVariants({ variant: "outline" })}>
              <Mail />
              {t("form.success.email")}
            </a>
          </div>
        )}
        <Button variant="link" onClick={() => setResult(null)}>
          {t("form.success.again")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-surface relative space-y-5 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("form.name")} htmlFor="contact-name" required error={msg(errors.name?.message)}>
          <Input id="contact-name" autoComplete="name" aria-invalid={Boolean(errors.name)} placeholder={t("form.placeholders.name")} {...register("name")} />
        </Field>
        <Field label={t("form.email")} htmlFor="contact-email" required error={msg(errors.email?.message)}>
          <Input id="contact-email" type="email" autoComplete="email" inputMode="email" aria-invalid={Boolean(errors.email)} placeholder={t("form.placeholders.email")} {...register("email")} />
        </Field>
      </div>

      <Field label={t("form.subject")} htmlFor="contact-subject" required error={msg(errors.subject?.message)}>
        <Select id="contact-subject" aria-invalid={Boolean(errors.subject)} {...register("subject")}>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {t(`form.subjects.${s}`)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("form.message")} htmlFor="contact-message" required hint={t("form.messageHint")} error={msg(errors.message?.message)}>
        <Textarea id="contact-message" rows={6} aria-invalid={Boolean(errors.message)} placeholder={t("form.placeholders.message")} {...register("message")} />
      </Field>

      {/* Honeypot: tersembunyi dari manusia, diisi bot. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
          <Checkbox aria-invalid={Boolean(errors.consent)} {...register("consent")} />
          <span>
            {tc("consent.privacy")}{" "}
            <Link href="/privacy" className="font-semibold text-brand underline-offset-4 hover:underline">
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

      {serverError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{t("form.note")}</p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          <Send />
          {isSubmitting ? tc("actions.sending") : t("form.submit")}
        </Button>
      </div>
    </form>
  );
}
