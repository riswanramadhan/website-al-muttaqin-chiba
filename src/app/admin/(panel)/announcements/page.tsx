import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { ContentList, type ContentListRow } from "@/components/admin/content-list";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { listAnnouncements } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("announcements.title"), description: t("announcements.subtitle") };
}

export default async function AnnouncementListPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  const records = await listAnnouncements();
  const rows: ContentListRow[] = records.map((r) => ({ id: r.id, title: r.title, slug: r.slug, status: r.status, date: r.publishedAt, meta: t(`announcements.categories.${r.category}`) + (r.pinned ? ` · ${t("fields.pinned")}` : ""), category: r.category }));
  return (
    <>
      <AdminPageHeader title={t("announcements.title")} description={t("announcements.subtitle")} />
      <ContentList entity="announcements" rows={rows} guard={guardFor(ctx, ["content_admin"])} categories={(["general", "prayer", "event", "donation", "urgent"] as const).map((c) => ({ value: c, label: t(`announcements.categories.${c}`) }))} />
    </>
  );
}
