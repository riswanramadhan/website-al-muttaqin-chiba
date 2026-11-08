import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getAnnouncement } from "@/components/admin/data";
import { formatAdminDateTime } from "@/components/admin/utils";
import { AnnouncementForm } from "@/components/admin/forms/announcement-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.editTitle", { entity: t("announcements.entity") }) };
}

export default async function EditAnnouncementFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const record = await getAnnouncement(decodeURIComponent(id));
  if (!record) notFound();
  return (
    <>
      <AdminPageHeader
        title={t("content.editTitle", { entity: t("announcements.entity") })}
        description={record.updatedAt ? t("content.lastUpdated", { date: formatAdminDateTime(record.updatedAt, lang) }) : t("announcements.subtitle")}
      />
      <AnnouncementForm initial={record} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
