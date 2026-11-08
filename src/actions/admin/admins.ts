"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, logActivity } from "@/lib/supabase/admin";
import { getServiceClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";
import { runAdminAction, type AdminActionResult } from "@/actions/admin/shared";
import { adminInviteSchema, adminUpdateSchema } from "@/components/admin/schemas";

/**
 * Kelola admin (hanya super_admin). Mengundang admin baru perlu service role karena membuat
 * pengguna di Supabase Auth; perubahan peran/aktif cukup lewat RLS "super admin manage admins".
 */
export async function inviteAdmin(raw: unknown): Promise<AdminActionResult<{ id: string }>> {
  return runAdminAction({
    roles: ["super_admin"],
    schema: adminInviteSchema,
    raw,
    handler: async (d, session) => {
      const service = getServiceClient();
      if (!service) throw new Error("admins.needService");

      // Cari pengguna yang sudah ada; bila belum ada, kirim undangan (membuat pengguna).
      let userId: string | null = null;
      const { data: existing } = await service.from("admins").select("id").eq("email", d.email).maybeSingle();
      if (existing) userId = String((existing as { id: unknown }).id);
      if (!userId) {
        const { data, error } = await service.auth.admin.inviteUserByEmail(d.email, { redirectTo: `${siteUrl}/admin/auth/callback` });
        if (error) {
          // Pengguna auth mungkin sudah ada tanpa baris admins: cari lewat daftar pengguna.
          const { data: list } = await service.auth.admin.listUsers({ perPage: 1000 });
          const found = list?.users.find((u) => u.email?.toLowerCase() === d.email.toLowerCase());
          if (!found) throw new Error(error.message);
          userId = found.id;
        } else {
          userId = data.user.id;
        }
      }

      const { error: upsertError } = await service.from("admins").upsert({ id: userId, email: d.email, full_name: d.fullName, role: d.role, active: true });
      if (upsertError) throw new Error(upsertError.message);
      await logActivity(session.admin.id, "invite", "admins", userId, { email: d.email, role: d.role });
      revalidatePath("/admin/admins");
      return { id: userId };
    },
  });
}

export async function updateAdmin(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: ["super_admin"],
    schema: adminUpdateSchema,
    raw,
    handler: async (d, session) => {
      if (d.id === session.admin.id && (d.active === false || (d.role && d.role !== "super_admin"))) {
        throw new Error("forbidden: tidak bisa menurunkan diri sendiri");
      }
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const patch: Record<string, unknown> = {};
      if (d.role) patch.role = d.role;
      if (typeof d.active === "boolean") patch.active = d.active;
      const { error } = await supabase.from("admins").update(patch).eq("id", d.id);
      if (error) throw new Error(error.message);
      await logActivity(session.admin.id, "update", "admins", d.id, patch);
      revalidatePath("/admin/admins");
      return undefined;
    },
  });
}
