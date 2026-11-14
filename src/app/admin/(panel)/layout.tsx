import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { getPanelContext } from "@/components/admin/context.server";

export const dynamic = "force-dynamic";

/**
 * Proteksi semua halaman panel (kecuali /admin/login): Supabase aktif tanpa sesi admin
 * -> redirect ke /admin/login. Tanpa Supabase -> mode demo hanya-baca dengan banner.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPanelContext();
  if (!ctx.demo && !ctx.session) redirect("/admin/login");
  const user = ctx.session
    ? { name: ctx.session.admin.full_name, email: ctx.session.admin.email, role: ctx.session.admin.role, mustChangePassword: ctx.session.admin.must_change_password }
    : null;
  return (
    <AdminShell user={user} demo={ctx.demo}>
      {children}
    </AdminShell>
  );
}
