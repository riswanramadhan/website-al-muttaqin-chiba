import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { formatAdminDateTime } from "@/components/admin/utils";
import { CmsItemForm } from "@/components/admin/cms/cms-form";
import { getItem } from "@/components/admin/cms/data.server";
import { findCollection } from "@/components/admin/cms/registry";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ collection: string; id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ collection }, { t }] = await Promise.all([params, getAdminT()]);
  const def = findCollection(collection);
  return def ? { title: t("content.editTitle", { entity: t(`cms.collections.${def.slug}.entity`) }) } : {};
}

export default async function EditCmsItemPage({ params }: PageProps) {
  const { collection, id } = await params;
  const def = findCollection(collection);
  if (!def) notFound();
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const item = await getItem(def, decodeURIComponent(id));
  if (!item) notFound();
  return (
    <>
      <AdminPageHeader
        title={t("content.editTitle", { entity: t(`cms.collections.${def.slug}.entity`) })}
        description={item.updatedAt ? t("content.lastUpdated", { date: formatAdminDateTime(item.updatedAt, lang) }) : t(`cms.collections.${def.slug}.subtitle`)}
      />
      <CmsItemForm key={item.id} slug={def.slug} item={item} guard={guardFor(ctx, def.roles)} />
    </>
  );
}
