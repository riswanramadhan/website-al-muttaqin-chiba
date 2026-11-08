import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { ContentList, type ContentListRow } from "@/components/admin/content-list";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { listLectures } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("lectures.title"), description: t("lectures.subtitle") };
}

export default async function LectureListPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  const records = await listLectures();
  const rows: ContentListRow[] = records.map((r) => ({ id: r.id, title: r.title, slug: r.slug, status: r.status, date: r.publishedAt, meta: `${r.speaker} · ${t(`lectures.languages.${r.language}`)}`, category: r.language }));
  return (
    <>
      <AdminPageHeader title={t("lectures.title")} description={t("lectures.subtitle")} />
      <ContentList entity="lectures" rows={rows} guard={guardFor(ctx, ["content_admin"])} categories={(["id", "ja", "en", "ar"] as const).map((c) => ({ value: c, label: t(`lectures.languages.${c}`) }))} />
    </>
  );
}
