"use server";

import { logActivity } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/site";
import { runAdminAction, type AdminActionResult } from "@/actions/admin/shared";
import { pushBroadcastSchema } from "@/components/admin/schemas";

/**
 * Kirim pengumuman push manual lewat POST /api/push/send (mode broadcast, modul PWA).
 * Endpoint dilindungi PUSH_CRON_SECRET; di sini hanya memanggil dan meneruskan hasilnya.
 */
export async function sendPushBroadcast(raw: unknown): Promise<AdminActionResult<{ sent: number }>> {
  return runAdminAction({
    roles: ["content_admin"],
    schema: pushBroadcastSchema,
    raw,
    handler: async (d, session) => {
      const secret = process.env.PUSH_CRON_SECRET;
      if (!secret) throw new Error("push.notConfigured");
      const res = await fetch(`${siteUrl}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ mode: "broadcast", title: d.title, body: d.body, url: d.url || "/" }),
        signal: AbortSignal.timeout(25_000),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; sent?: number; error?: string; message?: string };
      if (!res.ok || json.ok === false) throw new Error(json.error ?? json.message ?? `HTTP ${res.status}`);
      const sent = typeof json.sent === "number" ? json.sent : 0;
      await logActivity(session.admin.id, "push", "push", null, { title: d.title.id, url: d.url || "/", sent });
      return { sent };
    },
  });
}
