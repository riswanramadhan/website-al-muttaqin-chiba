"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Archive, Rocket, Save } from "lucide-react";
import type { AdminActionResult } from "@/actions/admin/shared";
import { deleteContent } from "@/actions/admin/content";
import { useAdminT } from "@/components/admin/i18n-context";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { FormBar, GuardedButton } from "@/components/admin/form-bar";
import type { ContentEntity, ContentStatus } from "@/components/admin/types";

export type Guard = "demo" | "role" | undefined;

/** Simpan konten lewat Server Action; data baru diarahkan ke halaman ubah setelah tersimpan. */
export function useContentSave<T extends { id?: string }>(entity: ContentEntity, action: (raw: T) => Promise<AdminActionResult<{ id: string }>>) {
  const { t } = useAdminT();
  const router = useRouter();
  const { run, pending } = useAdminAction();

  const save = React.useCallback(
    (values: T, status: ContentStatus | null) =>
      run(() => action(status ? { ...values, status } : values), {
        success: status === "published" ? t("common.published") : t("common.saved"),
        onSuccess: ({ id }) => {
          if (!values.id) router.replace(`/admin/${entity}/${id}`);
        },
      }),
    [action, entity, router, run, t],
  );

  const remove = React.useCallback(
    (id: string) => {
      if (!window.confirm(t("content.deleteConfirm", { entity: t(`${entity}.entity`) }))) return;
      void run(() => deleteContent({ entity, id }), { success: t("common.deleted"), refresh: false, onSuccess: () => router.replace(`/admin/${entity}`) });
    },
    [entity, router, run, t],
  );

  return { save, remove, pending };
}

/** Aksi standar formulir konten: simpan draf, terbitkan, arsipkan, hapus. */
export function ContentFormActions({
  entity,
  id,
  status,
  guard,
  pending,
  onSave,
  onDelete,
  publishedLabel,
}: {
  entity: ContentEntity;
  id?: string;
  status: ContentStatus;
  guard: Guard;
  pending: boolean;
  onSave: (status: ContentStatus) => void;
  onDelete?: () => void;
  publishedLabel?: string;
}) {
  const { t } = useAdminT();
  return (
    <FormBar backHref={`/admin/${entity}`} onDelete={id && onDelete ? onDelete : undefined} deleteReason={guard} pending={pending}>
      {status === "published" && (
        <GuardedButton type="button" variant="outline" size="sm" reason={guard} pending={pending} onClick={() => onSave("archived")}>
          <Archive />
          {t("common.archive")}
        </GuardedButton>
      )}
      <GuardedButton type="button" variant="secondary" size="sm" reason={guard} pending={pending} onClick={() => onSave("draft")}>
        <Save />
        {status === "published" ? t("common.unpublish") : t("common.saveDraft")}
      </GuardedButton>
      <GuardedButton type="button" variant="primary" size="sm" reason={guard} pending={pending} onClick={() => onSave("published")}>
        <Rocket />
        {status === "published" ? (publishedLabel ?? t("common.save")) : t("content.publishAndRevalidate")}
      </GuardedButton>
    </FormBar>
  );
}
