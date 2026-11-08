"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert, CircleCheck, KeyRound, LoaderCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/primitives";
import { LogoMark } from "@/components/site/logo";
import { signInWithPassword, sendMagicLink, setAdminLang } from "@/actions/admin/auth";
import { loginSchema, type LoginInput } from "@/components/admin/schemas";
import { useAdminT } from "@/components/admin/i18n-context";
import { useFieldError } from "@/components/admin/use-admin-action";
import { ADMIN_LANGS } from "@/components/admin/i18n";

type Notice = { tone: "error" | "success"; text: string } | null;

/** Halaman masuk: email + kata sandi, atau magic link. Mode demo: tombol masuk demo. */
export function LoginForm({ demo, linkError }: { demo: boolean; linkError: boolean }) {
  const { t, lang } = useAdminT();
  const fieldError = useFieldError();
  const [notice, setNotice] = React.useState<Notice>(linkError ? { tone: "error", text: t("errors.unauthorized") } : null);
  const [mode, setMode] = React.useState<"password" | "magic">("password");
  const [pending, startTransition] = React.useTransition();

  // Mode magic link hanya memvalidasi kolom email lewat trigger("email").
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const { register, handleSubmit, getValues, trigger, formState: { errors } } = form;

  const onPassword = handleSubmit((values) => {
    setNotice(null);
    startTransition(async () => {
      const result = await signInWithPassword(values);
      // Berhasil -> redirect di server; di sini hanya kegagalan.
      if (result && !result.ok) setNotice({ tone: "error", text: t(result.message ?? `errors.${result.error}`) });
    });
  });

  const onMagic = async () => {
    setNotice(null);
    if (!(await trigger("email"))) return;
    startTransition(async () => {
      const result = await sendMagicLink({ email: getValues("email") });
      setNotice(result.ok ? { tone: "success", text: t("login.magicLinkSent") } : { tone: "error", text: t(`errors.${result.error}`) });
    });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/id" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            {t("login.backToSite")}
          </Link>
          <div className="inline-flex items-center gap-1 rounded-full bg-background p-1" role="group" aria-label={t("common.language")}>
            {ADMIN_LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => startTransition(() => setAdminLang(l))}
                aria-pressed={lang === l}
                className={cn("h-7 rounded-full px-2.5 text-xs font-semibold uppercase", lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="card-surface p-6 sm:p-8">
          <LogoMark className="size-12" />
          <h1 className="headline mt-5 text-2xl">{t("login.title")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("login.subtitle")}</p>

          {notice && (
            <div role="alert" className={cn("mt-5 flex items-start gap-2 rounded-xl px-4 py-3 text-sm", notice.tone === "error" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>
              {notice.tone === "error" ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
              <span>{notice.text}</span>
            </div>
          )}

          {demo ? (
            <div className="mt-6 flex flex-col gap-4">
              <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-foreground">{t("login.demoHint")}</p>
              <Link href="/admin" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}>
                {t("login.enterDemo")}
              </Link>
            </div>
          ) : (
            <form onSubmit={mode === "password" ? onPassword : (e) => { e.preventDefault(); void onMagic(); }} className="mt-6 flex flex-col gap-4" noValidate>
              <Field label={t("login.email")} htmlFor="email" required error={fieldError(errors.email?.message)}>
                <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email) || undefined} {...register("email")} />
              </Field>
              {mode === "password" ? (
                <>
                  <Field label={t("login.password")} htmlFor="password" required error={fieldError(errors.password?.message)}>
                    <Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password) || undefined} {...register("password")} />
                  </Field>
                  <Button type="submit" size="lg" disabled={pending} className="w-full">
                    {pending ? <LoaderCircle className="animate-spin" /> : <KeyRound />}
                    {t("login.signIn")}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{t("login.magicLinkHint")}</p>
                  <Button type="submit" size="lg" disabled={pending} className="w-full">
                    {pending ? <LoaderCircle className="animate-spin" /> : <Mail />}
                    {t("login.sendMagicLink")}
                  </Button>
                </>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Separator className="flex-1" />
                {t("login.or")}
                <Separator className="flex-1" />
              </div>
              <Button type="button" variant="outline" onClick={() => { setNotice(null); setMode(mode === "password" ? "magic" : "password"); }}>
                {mode === "password" ? <Mail /> : <KeyRound />}
                {mode === "password" ? t("login.magicLink") : t("login.signIn")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
