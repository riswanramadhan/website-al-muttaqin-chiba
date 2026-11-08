"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { sendPushBroadcast } from "@/actions/admin/push";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAdminT } from "@/components/admin/i18n-context";
import { pushBroadcastSchema, type PushBroadcastInput } from "@/components/admin/schemas";
import { emptyText } from "@/components/admin/utils";
import { useAdminAction, useFieldError } from "@/components/admin/use-admin-action";
import { LocalizedInput, LocalizedTextarea } from "@/components/admin/localized-input";
import { GuardedButton } from "@/components/admin/form-bar";

/** Form broadcast push 3 bahasa -> Server Action -> POST /api/push/send (mode broadcast). */
export function PushForm({ guard }: { guard: "demo" | "role" | undefined }) {
  const { t } = useAdminT();
  const fieldError = useFieldError();
  const { run, pending } = useAdminAction();
  const toast = useToast();
  const disabled = Boolean(guard);
  const form = useForm<PushBroadcastInput>({ resolver: zodResolver(pushBroadcastSchema), defaultValues: { title: emptyText(), body: emptyText(), url: "/" } });
  const { control, register, handleSubmit, reset, formState: { errors } } = form;

  const onSubmit = handleSubmit((values) => {
    if (!window.confirm(t("push.confirm"))) return;
    return run(() => sendPushBroadcast(values), {
      refresh: false,
      onSuccess: ({ sent }) => {
        toast({ title: t("push.sent", { count: sent }), tone: "success" });
        reset();
      },
    }).then(() => undefined);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Controller control={control} name="title" render={({ field }) => <LocalizedInput label={t("push.titleLabel")} required disabled={disabled} value={field.value} onChange={field.onChange} errors={{ id: errors.title?.id?.message }} />} />
      <Controller control={control} name="body" render={({ field }) => <LocalizedTextarea label={t("push.bodyLabel")} required disabled={disabled} value={field.value} onChange={field.onChange} errors={{ id: errors.body?.id?.message }} />} />
      <Field label={t("push.url")} htmlFor="push-url" hint={t("push.urlHint")} error={fieldError(errors.url?.message)}>
        <Input id="push-url" disabled={disabled} placeholder="/news" {...register("url")} />
      </Field>
      <div className="flex justify-end">
        <GuardedButton type="submit" reason={guard} pending={pending}>
          <Send />
          {t("push.send")}
        </GuardedButton>
      </div>
    </form>
  );
}
