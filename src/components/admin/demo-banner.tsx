"use client";

import { Database } from "lucide-react";
import { useAdminT } from "@/components/admin/i18n-context";

/** Spanduk "Mode demo: hubungkan Supabase" di atas semua halaman admin tanpa env. */
export function DemoBanner() {
  const { t } = useAdminT();
  return (
    <div role="status" className="border-b border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-3">
        <Database className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{t("demo.title")}</p>
          <p className="mt-0.5 text-muted-foreground">{t("demo.body")}</p>
        </div>
      </div>
    </div>
  );
}
