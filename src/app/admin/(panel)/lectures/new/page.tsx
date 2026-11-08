import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { LectureForm } from "@/components/admin/forms/lecture-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.newTitle", { entity: t("lectures.entity") }) };
}

export default async function NewLectureFormPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  return (
    <>
      <AdminPageHeader title={t("content.newTitle", { entity: t("lectures.entity") })} description={t("lectures.subtitle")} />
      <LectureForm initial={null} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
