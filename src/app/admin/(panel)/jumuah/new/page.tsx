import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { JumuahForm } from "@/components/admin/forms/jumuah-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.newTitle", { entity: t("jumuah.entity") }) };
}

export default async function NewJumuahFormPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  return (
    <>
      <AdminPageHeader title={t("content.newTitle", { entity: t("jumuah.entity") })} description={t("jumuah.subtitle")} />
      <JumuahForm initial={null} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
