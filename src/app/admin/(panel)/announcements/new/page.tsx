import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { AnnouncementForm } from "@/components/admin/forms/announcement-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.newTitle", { entity: t("announcements.entity") }) };
}

export default async function NewAnnouncementFormPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  return (
    <>
      <AdminPageHeader title={t("content.newTitle", { entity: t("announcements.entity") })} description={t("announcements.subtitle")} />
      <AnnouncementForm initial={null} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
