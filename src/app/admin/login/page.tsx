import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext } from "@/components/admin/context.server";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("login.title"), description: t("login.subtitle") };
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [ctx, params] = await Promise.all([getPanelContext(), searchParams]);
  if (ctx.session) redirect("/admin");
  return <LoginForm demo={ctx.demo} linkError={params.error === "link"} />;
}
