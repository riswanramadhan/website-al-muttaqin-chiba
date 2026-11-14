"use client";

import { RefreshCw } from "lucide-react";
import { refreshSite } from "@/actions/admin/cms";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { GuardedButton } from "@/components/admin/form-bar";

/** Tombol dasbor untuk membuang cache data situs publik (dipakai setelah mengubah data langsung di Supabase). */
export function RefreshSiteButton({ guard }: { guard: "demo" | "role" | undefined }) {
  const { t } = useAdminT();
  const { run, pending } = useAdminAction();
  return (
    <GuardedButton type="button" variant="secondary" size="sm" reason={guard} pending={pending} onClick={() => void run(() => refreshSite(), { success: t("dashboard.refresh.done") })}>
      {!pending && <RefreshCw />}
      {t("dashboard.refresh.button")}
    </GuardedButton>
  );
}
