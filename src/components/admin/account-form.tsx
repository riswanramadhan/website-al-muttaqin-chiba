"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Save } from "lucide-react";
import type { AdminRole } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";
import { changeAccountPassword, updateAccountProfile } from "@/actions/admin/account";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction, useFieldError } from "@/components/admin/use-admin-action";
import { FormSection, GuardedButton } from "@/components/admin/form-bar";
import { accountPasswordSchema, accountProfileSchema, type AccountPasswordInput, type AccountProfileInput } from "@/components/admin/schemas";

/** Akun saya: ubah nama tampilan dan ganti kata sandi (wajib setelah login pertama). */
export function AccountForm({ email, fullName, role, guard }: { email: string; fullName: string; role: AdminRole | null; guard: "demo" | undefined }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const profileAction = useAdminAction();
  const passwordAction = useAdminAction();
  const disabled = Boolean(guard);

  const profile = useForm<AccountProfileInput>({ resolver: zodResolver(accountProfileSchema), defaultValues: { fullName } });
  const password = useForm<AccountPasswordInput>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const translate = (message?: string) => (message ? (message.startsWith("account.") ? t(message) : fieldError(message)) : undefined);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form onSubmit={profile.handleSubmit((values) => void profileAction.run(() => updateAccountProfile(values), { success: t("common.saved") }))} noValidate>
        <FormSection title={t("account.profile")} description={t("account.profileHint")}>
          <Field label={t("fields.email")} htmlFor="account-email">
            <Input id="account-email" value={email || "-"} disabled readOnly />
          </Field>
          <Field label={t("fields.fullName")} htmlFor="account-name" required error={translate(profile.formState.errors.fullName?.message)}>
            <Input id="account-name" autoComplete="name" disabled={disabled} aria-invalid={Boolean(profile.formState.errors.fullName) || undefined} {...profile.register("fullName")} />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="soft">{role ? t(`roles.${role}`) : t("common.demoUser")}</Badge>
            <GuardedButton type="submit" variant="secondary" size="sm" reason={guard} pending={profileAction.pending}>
              <Save />
              {t("common.save")}
            </GuardedButton>
          </div>
        </FormSection>
      </form>

      <form
        onSubmit={password.handleSubmit((values) =>
          void passwordAction.run(() => changeAccountPassword(values), { success: t("account.passwordChanged"), refresh: false, onSuccess: () => password.reset() }),
        )}
        noValidate
      >
        <FormSection title={t("account.password")} description={t("account.passwordHint")}>
          <Field label={t("account.currentPassword")} htmlFor="account-current" required error={translate(password.formState.errors.currentPassword?.message)}>
            <Input id="account-current" type="password" autoComplete="current-password" disabled={disabled} aria-invalid={Boolean(password.formState.errors.currentPassword) || undefined} {...password.register("currentPassword")} />
          </Field>
          <Field label={t("account.newPassword")} htmlFor="account-new" required error={translate(password.formState.errors.newPassword?.message)}>
            <Input id="account-new" type="password" autoComplete="new-password" disabled={disabled} aria-invalid={Boolean(password.formState.errors.newPassword) || undefined} {...password.register("newPassword")} />
          </Field>
          <Field label={t("account.confirmPassword")} htmlFor="account-confirm" required error={translate(password.formState.errors.confirmPassword?.message)}>
            <Input id="account-confirm" type="password" autoComplete="new-password" disabled={disabled} aria-invalid={Boolean(password.formState.errors.confirmPassword) || undefined} {...password.register("confirmPassword")} />
          </Field>
          <div className="flex justify-end">
            <GuardedButton type="submit" variant="primary" size="sm" reason={guard} pending={passwordAction.pending}>
              <KeyRound />
              {t("account.changePassword")}
            </GuardedButton>
          </div>
        </FormSection>
      </form>
    </div>
  );
}
