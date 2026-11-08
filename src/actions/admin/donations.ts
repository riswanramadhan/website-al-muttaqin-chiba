"use server";

import { z } from "zod";
import { createServerSupabase, logActivity } from "@/lib/supabase/admin";
import { runAdminAction, type AdminActionResult } from "@/actions/admin/shared";
import { donationStatusSchema, recurringDonorActiveSchema } from "@/components/admin/schemas";
import { revalidatePath } from "next/cache";

const DONATION_ROLES = ["donation_admin" as const];

/** Pencocokan manual: tandai cocok / tolak / buka kembali, dengan catatan admin. */
export async function updateDonationStatus(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: DONATION_ROLES,
    schema: donationStatusSchema,
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const matched = d.status !== "pending";
      const { error } = await supabase
        .from("donation_confirmations")
        .update({
          status: d.status,
          admin_note: d.adminNote || null,
          matched_by: matched ? session.admin.id : null,
          matched_at: matched ? new Date().toISOString() : null,
        })
        .eq("id", d.id);
      if (error) throw new Error(error.message);
      await logActivity(session.admin.id, "status", "donation_confirmations", d.id, { status: d.status });
      revalidatePath("/admin/donations");
      return undefined;
    },
  });
}

export async function setRecurringDonorActive(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: DONATION_ROLES,
    schema: recurringDonorActiveSchema,
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const { error } = await supabase.from("recurring_donors").update({ active: d.active }).eq("id", d.id);
      if (error) throw new Error(error.message);
      await logActivity(session.admin.id, "status", "recurring_donors", d.id, { active: d.active });
      revalidatePath("/admin/donations");
      return undefined;
    },
  });
}

const exportLogSchema = z.object({ kind: z.enum(["confirmations", "recurring"]), count: z.number().int().min(0) });

/** Catat ekspor CSV donasi (data sudah dicek perannya di halaman server sebelum dikirim ke client). */
export async function logDonationExport(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: DONATION_ROLES,
    schema: exportLogSchema,
    raw,
    handler: async (d, session) => {
      await logActivity(session.admin.id, "export", d.kind === "recurring" ? "recurring_donors" : "donation_confirmations", null, { count: d.count });
      return undefined;
    },
  });
}
