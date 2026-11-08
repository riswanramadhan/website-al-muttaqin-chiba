import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { PrayerForm } from "@/components/admin/forms/prayer-form";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getAdminPrayerConfig } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("prayer.title"), description: t("prayer.subtitle") };
}

export default async function AdminPrayerPage() {
  const ctx = await getPanelContext();
  const config = await getAdminPrayerConfig();
  return (
    <>
      <AdminPageHeader title={ctx.t("prayer.title")} description={ctx.t("prayer.subtitle")} />
      <PrayerForm config={config} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
