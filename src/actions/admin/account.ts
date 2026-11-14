"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, logActivity } from "@/lib/supabase/admin";
import { getPublicClient } from "@/lib/supabase/server";
import { runAdminAction, type AdminActionResult } from "@/actions/admin/shared";
import { accountPasswordSchema, accountProfileSchema } from "@/components/admin/schemas";

/** Akun admin yang sedang masuk: ubah nama tampilan dan ganti kata sandi. */

export async function updateAccountProfile(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    schema: accountProfileSchema,
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const { error } = await supabase.from("admins").update({ full_name: d.fullName }).eq("id", session.admin.id);
      if (error) throw new Error(error.message);
      await logActivity(session.admin.id, "update", "admins", session.admin.id, { self: true });
      revalidatePath("/admin", "layout");
      return undefined;
    },
  });
}

export async function changeAccountPassword(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    schema: accountPasswordSchema,
    raw,
    handler: async (d, session) => {
      // Verifikasi kata sandi lama lewat klien terpisah agar cookie sesi yang aktif tidak tersentuh.
      const verifier = getPublicClient();
      if (!verifier) throw new Error("supabase");
      const { error: verifyError } = await verifier.auth.signInWithPassword({ email: session.admin.email, password: d.currentPassword });
      if (verifyError) throw new Error("account.wrongPassword");

      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const { error } = await supabase.auth.updateUser({ password: d.newPassword });
      if (error) throw new Error(error.message);
      // Kata sandi awal sudah diganti: matikan peringatan di panel.
      await supabase.from("admins").update({ must_change_password: false }).eq("id", session.admin.id);
      await logActivity(session.admin.id, "password", "admins", session.admin.id);
      revalidatePath("/admin", "layout");
      return undefined;
    },
  });
}
