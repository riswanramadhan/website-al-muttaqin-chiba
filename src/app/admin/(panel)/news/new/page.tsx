import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { NewsForm } from "@/components/admin/forms/news-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.newTitle", { entity: t("news.entity") }) };
}

export default async function NewNewsFormPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  return (
    <>
      <AdminPageHeader title={t("content.newTitle", { entity: t("news.entity") })} description={t("news.subtitle")} />
      <NewsForm initial={null} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
