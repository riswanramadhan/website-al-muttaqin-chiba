"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAdminT } from "@/components/admin/i18n-context";
import type { AdminActionResult } from "@/actions/admin/shared";

/**
 * Jalankan Server Action admin dengan transisi + toast: sukses -> pesan sukses dan
 * router.refresh(); gagal -> pesan error terjemahan (errors.*) atau pesan server.
 */
export function useAdminAction() {
  const { t } = useAdminT();
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const run = React.useCallback(
    <T,>(
      action: () => Promise<AdminActionResult<T>>,
      options: { success?: string; onSuccess?: (data: T) => void; refresh?: boolean; onError?: (result: Extract<AdminActionResult<T>, { ok: false }>) => void } = {},
    ) =>
      new Promise<AdminActionResult<T>>((resolve) => {
        startTransition(async () => {
          const result = await action();
          if (result.ok) {
            if (options.success) toast({ title: options.success, tone: "success" });
            if (options.refresh !== false) router.refresh();
            options.onSuccess?.(result.data);
          } else {
            const key = result.message && result.message.includes(".") ? result.message : `errors.${result.error}`;
            const translated = t(key);
            toast({ title: translated === key ? t(`errors.${result.error}`) : translated, description: translated === key ? result.message : undefined, tone: "error" });
            options.onError?.(result);
          }
          resolve(result);
        });
      }),
    [router, t, toast],
  );

  return { run, pending };
}

/** Terjemahkan pesan kesalahan skema (kunci errors.*) atau tampilkan apa adanya. */
export function useFieldError() {
  const { t } = useAdminT();
  return React.useCallback((message?: string) => (message ? (message.startsWith("errors.") ? t(message) : message) : undefined), [t]);
}
