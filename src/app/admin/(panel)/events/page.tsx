import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { ContentList, type ContentListRow } from "@/components/admin/content-list";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { listEvents } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("events.title"), description: t("events.subtitle") };
}

export default async function EventListPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  const records = await listEvents();
  const rows: ContentListRow[] = records.map((r) => ({ id: r.id, title: r.title, slug: r.slug, status: r.status, date: r.startsAt, meta: t(`events.categories.${r.category}`), category: r.category }));
  return (
    <>
      <AdminPageHeader title={t("events.title")} description={t("events.subtitle")} />
      <ContentList entity="events" rows={rows} guard={guardFor(ctx, ["content_admin"])} categories={(["kajian", "tpa", "muallaf", "community", "culture", "ramadan", "eid", "class", "open-mosque"] as const).map((c) => ({ value: c, label: t(`events.categories.${c}`) }))} />
    </>
  );
}
