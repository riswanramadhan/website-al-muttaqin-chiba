"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabase, logActivity } from "@/lib/supabase/admin";
import { runAdminAction, type AdminActionResult } from "@/actions/admin/shared";
import { inboxStatusSchema } from "@/components/admin/schemas";
import { INBOX_STATUSES, INBOX_TABLES } from "@/components/admin/types";

/** Ubah status pendaftar / peminjaman / saran / pesan kontak. */
export async function updateInboxStatus(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: ["content_admin"],
    schema: inboxStatusSchema,
    raw,
    handler: async (d, session) => {
      if (!INBOX_STATUSES[d.kind].includes(d.status)) throw new Error(`status tidak dikenal: ${d.status}`);
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const table = INBOX_TABLES[d.kind];
      const patch: Record<string, unknown> = { status: d.status };
      if (d.kind === "suggestions") patch.handled_by = session.admin.id;
      const { error } = await supabase.from(table).update(patch).eq("id", d.id);
      if (error) throw new Error(error.message);
      await logActivity(session.admin.id, "status", table, d.id, { status: d.status });
      revalidatePath("/admin/inbox");
      revalidatePath("/admin");
      return undefined;
    },
  });
}

const exportLogSchema = z.object({ kind: z.enum(["events", "programs", "bookings", "suggestions", "contact"]), count: z.number().int().min(0) });

export async function logInboxExport(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: ["content_admin"],
    schema: exportLogSchema,
    raw,
    handler: async (d, session) => {
      await logActivity(session.admin.id, "export", INBOX_TABLES[d.kind], null, { count: d.count });
      return undefined;
    },
  });
}
