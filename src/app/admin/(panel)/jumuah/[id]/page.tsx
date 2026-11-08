import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getJumuah } from "@/components/admin/data";
import { formatAdminDateTime } from "@/components/admin/utils";
import { JumuahForm } from "@/components/admin/forms/jumuah-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.editTitle", { entity: t("jumuah.entity") }) };
}

export default async function EditJumuahFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const record = await getJumuah(decodeURIComponent(id));
  if (!record) notFound();
  return (
    <>
      <AdminPageHeader
        title={t("content.editTitle", { entity: t("jumuah.entity") })}
        description={record.updatedAt ? t("content.lastUpdated", { date: formatAdminDateTime(record.updatedAt, lang) }) : t("jumuah.subtitle")}
      />
      <JumuahForm initial={record} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
