import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getLecture } from "@/components/admin/data";
import { formatAdminDateTime } from "@/components/admin/utils";
import { LectureForm } from "@/components/admin/forms/lecture-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.editTitle", { entity: t("lectures.entity") }) };
}

export default async function EditLectureFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const record = await getLecture(decodeURIComponent(id));
  if (!record) notFound();
  return (
    <>
      <AdminPageHeader
        title={t("content.editTitle", { entity: t("lectures.entity") })}
        description={record.updatedAt ? t("content.lastUpdated", { date: formatAdminDateTime(record.updatedAt, lang) }) : t("lectures.subtitle")}
      />
      <LectureForm initial={record} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
