import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/shell";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext } from "@/components/admin/context.server";
import { AccountForm } from "@/components/admin/account-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("account.title"), description: t("account.subtitle") };
}

/** Akun admin yang sedang masuk: nama tampilan dan ganti kata sandi. */
export default async function AccountPage() {
  const ctx = await getPanelContext();
  const { t } = ctx;
  const admin = ctx.session?.admin ?? null;
  return (
    <>
      <AdminPageHeader title={t("account.title")} description={t("account.subtitle")} />
      <AccountForm email={admin?.email ?? ""} fullName={admin?.full_name ?? ""} role={admin?.role ?? null} guard={ctx.demo ? "demo" : undefined} />
    </>
  );
}
