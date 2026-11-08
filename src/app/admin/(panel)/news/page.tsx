import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { ContentList, type ContentListRow } from "@/components/admin/content-list";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { listNews } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("news.title"), description: t("news.subtitle") };
}

export default async function NewsListPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  const records = await listNews();
  const rows: ContentListRow[] = records.map((r) => ({ id: r.id, title: r.title, slug: r.slug, status: r.status, date: r.publishedAt, meta: t(`news.categories.${r.category}`), category: r.category }));
  return (
    <>
      <AdminPageHeader title={t("news.title")} description={t("news.subtitle")} />
      <ContentList entity="news" rows={rows} guard={guardFor(ctx, ["content_admin"])} categories={(["news", "report", "article", "press"] as const).map((c) => ({ value: c, label: t(`news.categories.${c}`) }))} />
    </>
  );
}
