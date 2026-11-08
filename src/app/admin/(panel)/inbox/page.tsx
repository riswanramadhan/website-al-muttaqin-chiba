import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/primitives";
import { AdminPageHeader } from "@/components/admin/shell";
import { InboxView } from "@/components/admin/inbox-view";
import { getAdminT } from "@/components/admin/lang.server";
import { canView, getPanelContext, guardFor } from "@/components/admin/context.server";
import { listInbox } from "@/components/admin/data";
import type { InboxKind, InboxRecord } from "@/components/admin/types";

export const dynamic = "force-dynamic";

const KINDS: InboxKind[] = ["events", "programs", "bookings", "suggestions", "contact"];

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("inbox.title"), description: t("inbox.subtitle") };
}

export default async function AdminInboxPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [ctx, params] = await Promise.all([getPanelContext(), searchParams]);
  const { t } = ctx;
  if (!canView(ctx, ["content_admin", "viewer"])) {
    return (
      <>
        <AdminPageHeader title={t("inbox.title")} description={t("inbox.subtitle")} />
        <EmptyState title={t("errors.forbidden")} />
      </>
    );
  }
  const lists = await Promise.all(KINDS.map((k) => listInbox(k)));
  const data = Object.fromEntries(KINDS.map((k, i) => [k, lists[i]])) as Record<InboxKind, InboxRecord[]>;
  const initialTab = KINDS.includes(params.tab as InboxKind) ? (params.tab as InboxKind) : "events";
  return (
    <>
      <AdminPageHeader title={t("inbox.title")} description={t("inbox.subtitle")} />
      <InboxView data={data} initialTab={initialTab} guard={guardFor(ctx, ["content_admin"])} demo={ctx.demo} />
    </>
  );
}
