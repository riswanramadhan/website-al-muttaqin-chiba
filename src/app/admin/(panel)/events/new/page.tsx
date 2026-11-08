import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { EventForm } from "@/components/admin/forms/event-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("content.newTitle", { entity: t("events.entity") }) };
}

export default async function NewEventFormPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  return (
    <>
      <AdminPageHeader title={t("content.newTitle", { entity: t("events.entity") })} description={t("events.subtitle")} />
      <EventForm initial={null} guard={guardFor(ctx, ["content_admin"])} />
    </>
  );
}
