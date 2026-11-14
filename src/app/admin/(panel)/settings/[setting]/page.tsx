import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { formatAdminDateTime } from "@/components/admin/utils";
import { CmsSettingForm } from "@/components/admin/cms/cms-form";
import { getSettingValue } from "@/components/admin/cms/data.server";
import { findSetting } from "@/components/admin/cms/registry";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ setting: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ setting }, { t }] = await Promise.all([params, getAdminT()]);
  const def = findSetting(setting);
  return def ? { title: t(`cms.settings.${def.slug}.title`), description: t(`cms.settings.${def.slug}.subtitle`) } : {};
}

/** Pengaturan tunggal situs: profil & kontak, video unggulan, pop-up promo. */
export default async function SettingPage({ params }: PageProps) {
  const { setting } = await params;
  const def = findSetting(setting);
  if (!def) notFound();
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const stored = await getSettingValue(def);
  return (
    <>
      <AdminPageHeader
        title={t(`cms.settings.${def.slug}.title`)}
        description={stored.updatedAt ? t("content.lastUpdated", { date: formatAdminDateTime(stored.updatedAt, lang) }) : t(`cms.settings.${def.slug}.subtitle`)}
        action={
          <a href={`/id${def.publicPath}`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink />
            {t("content.openPublic")}
          </a>
        }
      />
      <CmsSettingForm key={stored.updatedAt ?? "seed"} slug={def.slug} initial={stored.data} guard={guardFor(ctx, def.roles)} />
    </>
  );
}
