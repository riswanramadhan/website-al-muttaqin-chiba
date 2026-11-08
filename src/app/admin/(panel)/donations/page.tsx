import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/primitives";
import { AdminPageHeader } from "@/components/admin/shell";
import { DonationsView } from "@/components/admin/donations-view";
import { getAdminT } from "@/components/admin/lang.server";
import { canView, getPanelContext, guardFor } from "@/components/admin/context.server";
import { listDonationConfirmations, listRecurringDonors } from "@/components/admin/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("donations.title"), description: t("donations.subtitle") };
}

export default async function AdminDonationsPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  // Data donatur bersifat pribadi: hanya super_admin & donation_admin (juga sesuai RLS).
  if (!canView(ctx, ["donation_admin"])) {
    return (
      <>
        <AdminPageHeader title={t("donations.title")} description={t("donations.subtitle")} />
        <EmptyState title={t("errors.forbidden")} description={t("donations.noAccess")} />
      </>
    );
  }
  const [confirmations, recurring] = await Promise.all([listDonationConfirmations(), listRecurringDonors()]);
  // Peran dicek di server sebelum data apa pun dikirim ke client (ekspor CSV memakai data yang sama).
  const canExport = ctx.demo || canView(ctx, ["donation_admin"]);
  return (
    <>
      <AdminPageHeader title={t("donations.title")} description={t("donations.subtitle")} />
      <DonationsView confirmations={confirmations} recurring={recurring} guard={guardFor(ctx, ["donation_admin"])} canExport={canExport} demo={ctx.demo} />
    </>
  );
}
