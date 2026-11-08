import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getNewsPost } from "@/components/admin/data";
import { formatAdminDateTime } from "@/components/admin/utils";
import { NewsForm } from "@/components/admin/forms/news-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.editTitle", { entity: t("news.entity") }) };
}

export default async function EditNewsFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const record = await getNewsPost(decodeURIComponent(id));
  if (!record) notFound();
  return (
    <>
      <AdminPageHeader
        title={t("content.editTitle", { entity: t("news.entity") })}
        description={record.updatedAt ? t("content.lastUpdated", { date: formatAdminDateTime(record.updatedAt, lang) }) : t("news.subtitle")}
      />
      <NewsForm initial={record} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
