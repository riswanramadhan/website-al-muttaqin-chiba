import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { CmsList } from "@/components/admin/cms/cms-list";
import { listItems } from "@/components/admin/cms/data.server";
import { findCollection } from "@/components/admin/cms/registry";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ collection }, { t }] = await Promise.all([params, getAdminT()]);
  const def = findCollection(collection);
  return def ? { title: t(`cms.collections.${def.slug}.title`), description: t(`cms.collections.${def.slug}.subtitle`) } : {};
}

/** Daftar item satu koleksi CMS (FAQ, galeri, rekening donasi, program, dan lainnya). */
export default async function CmsCollectionPage({ params }: PageProps) {
  const { collection } = await params;
  const def = findCollection(collection);
  if (!def) notFound();
  const ctx = await getPanelContext();
  const { t } = ctx;
  const items = await listItems(def);
  return (
    <>
      <AdminPageHeader
        title={t(`cms.collections.${def.slug}.title`)}
        description={t(`cms.collections.${def.slug}.subtitle`)}
        action={
          <a href={`/id${def.publicPath}`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink />
            {t("content.openPublic")}
          </a>
        }
      />
      <CmsList slug={def.slug} items={items} guard={guardFor(ctx, def.roles)} />
    </>
  );
}
