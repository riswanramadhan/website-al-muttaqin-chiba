import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/primitives";
import { AdminPageHeader } from "@/components/admin/shell";
import { AdminsView } from "@/components/admin/admins-view";
import { getAdminT } from "@/components/admin/lang.server";
import { canView, getPanelContext, guardFor } from "@/components/admin/context.server";
import { listAdmins } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("admins.title"), description: t("admins.subtitle") };
}

export default async function AdminAdminsPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  if (!canView(ctx, ["super_admin"])) {
    return (
      <>
        <AdminPageHeader title={t("admins.title")} description={t("admins.subtitle")} />
        <EmptyState title={t("errors.forbidden")} description={t("admins.superOnly")} />
      </>
    );
  }
  const admins = await listAdmins();
  return (
    <>
      <AdminPageHeader title={t("admins.title")} description={t("admins.subtitle")} />
      <AdminsView admins={admins} selfId={ctx.session?.admin.id ?? null} guard={guardFor(ctx, ["super_admin"])} serviceReady={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)} />
    </>
  );
}
