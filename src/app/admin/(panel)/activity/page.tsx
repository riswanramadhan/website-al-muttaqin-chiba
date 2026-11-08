import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/shell";
import { ActivityList } from "@/components/admin/activity-list";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext } from "@/components/admin/context.server";
import { listActivity } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("activity.title"), description: t("activity.subtitle") };
}

export default async function AdminActivityPage() {
  const ctx = await getPanelContext();
  const items = await listActivity(200);
  return (
    <>
      <AdminPageHeader title={ctx.t("activity.title")} description={ctx.t("activity.subtitle")} />
      <Card className="p-4 sm:p-6">
        <ActivityList items={items} showDetail />
      </Card>
    </>
  );
}
