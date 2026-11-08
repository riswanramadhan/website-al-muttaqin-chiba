import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { ContentList, type ContentListRow } from "@/components/admin/content-list";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { listJumuah } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("jumuah.title"), description: t("jumuah.subtitle") };
}

export default async function JumuahListPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  const records = await listJumuah();
  const rows: ContentListRow[] = records.map((r) => ({ id: r.id, title: { ja: r.topic?.ja || r.khatib, en: r.topic?.en || r.khatib, id: `${r.khatib}${r.topic?.id ? ` - ${r.topic.id}` : ""}` }, slug: `${r.time} · ${t("fields.imam")}: ${r.imam}`, status: r.published ? "published" : "draft", date: r.date, meta: t(`jumuah.languages.${r.language}`) }));
  return (
    <>
      <AdminPageHeader title={t("jumuah.title")} description={t("jumuah.subtitle")} />
      <ContentList entity="jumuah" rows={rows} guard={guardFor(ctx, ["content_admin"])} dateOnly />
    </>
  );
}
