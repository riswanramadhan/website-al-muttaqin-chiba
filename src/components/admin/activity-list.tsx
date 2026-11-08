"use client";

import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/ui/primitives";
import { useAdminT } from "@/components/admin/i18n-context";
import { formatAdminDateTime } from "@/components/admin/utils";
import type { ActivityRecord } from "@/components/admin/types";

function label(t: (k: string) => string, prefix: string, key: string): string {
  const v = t(`${prefix}.${key}`);
  return v === `${prefix}.${key}` ? key : v;
}

/** Daftar aktivitas ringkas (dasbor) atau lengkap (log aktivitas). */
export function ActivityList({ items, showDetail = false }: { items: ActivityRecord[]; showDetail?: boolean }) {
  const { t, lang } = useAdminT();
  if (items.length === 0) return <EmptyState icon={<ScrollText />} title={t("activity.empty")} />;
  return (
    <ol className="flex flex-col divide-y divide-border">
      {items.map((a) => (
        <li key={a.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
          <time dateTime={a.createdAt} className="tabular shrink-0 text-xs text-muted-foreground sm:w-36 sm:pt-0.5">
            {formatAdminDateTime(a.createdAt, lang)}
          </time>
          <div className="min-w-0 flex-1 text-sm">
            <p>
              <span className="font-semibold">{a.adminName || t("common.unknown")}</span>{" "}
              <span className="text-muted-foreground">{label(t, "activity.actions", a.action)}</span>{" "}
              <span className="font-medium">{label(t, "activity.entities", a.entity)}</span>
              {a.entityId && <span className="text-muted-foreground"> #{a.entityId.slice(0, 8)}</span>}
            </p>
            {showDetail && a.detail && (
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={JSON.stringify(a.detail)}>
                {JSON.stringify(a.detail)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
