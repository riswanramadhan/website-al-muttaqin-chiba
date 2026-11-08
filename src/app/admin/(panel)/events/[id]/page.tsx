import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getEvent } from "@/components/admin/data";
import { formatAdminDateTime } from "@/components/admin/utils";
import { EventForm } from "@/components/admin/forms/event-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.editTitle", { entity: t("events.entity") }) };
}

export default async function EditEventFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const record = await getEvent(decodeURIComponent(id));
  if (!record) notFound();
  return (
    <>
      <AdminPageHeader
        title={t("content.editTitle", { entity: t("events.entity") })}
        description={record.updatedAt ? t("content.lastUpdated", { date: formatAdminDateTime(record.updatedAt, lang) }) : t("events.subtitle")}
      />
      <EventForm initial={record} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
