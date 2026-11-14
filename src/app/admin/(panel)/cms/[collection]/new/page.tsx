import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { CmsItemForm } from "@/components/admin/cms/cms-form";
import { findCollection } from "@/components/admin/cms/registry";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ collection }, { t }] = await Promise.all([params, getAdminT()]);
  const def = findCollection(collection);
  return def ? { title: t("content.newTitle", { entity: t(`cms.collections.${def.slug}.entity`) }) } : {};
}

export default async function NewCmsItemPage({ params }: PageProps) {
  const { collection } = await params;
  const def = findCollection(collection);
  if (!def) notFound();
  const ctx = await getPanelContext();
  const { t } = ctx;
  return (
    <>
      <AdminPageHeader title={t("content.newTitle", { entity: t(`cms.collections.${def.slug}.entity`) })} description={t(`cms.collections.${def.slug}.subtitle`)} />
      <CmsItemForm slug={def.slug} item={null} guard={guardFor(ctx, def.roles)} />
    </>
  );
}
