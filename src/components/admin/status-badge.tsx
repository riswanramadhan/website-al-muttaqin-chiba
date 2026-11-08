"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { useAdminT } from "@/components/admin/i18n-context";

const VARIANTS: Record<string, BadgeProps["variant"]> = {
  published: "success",
  matched: "success",
  done: "success",
  approved: "success",
  accepted: "success",
  attended: "success",
  active: "success",
  replied: "success",
  draft: "warning",
  pending: "warning",
  new: "warning",
  requested: "warning",
  in_progress: "soft",
  waitlist: "soft",
  registered: "soft",
  read: "soft",
  archived: "outline",
  inactive: "outline",
  cancelled: "outline",
  rejected: "destructive",
  spam: "destructive",
};

/** Lencana status konten/formulir dengan warna token dan label terjemahan. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { t } = useAdminT();
  const label = t(`status.${status}`);
  return (
    <Badge variant={VARIANTS[status] ?? "default"} className={className}>
      {label === `status.${status}` ? status : label}
    </Badge>
  );
}
