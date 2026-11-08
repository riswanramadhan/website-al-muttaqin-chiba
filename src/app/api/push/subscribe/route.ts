import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";
import { normalizePreferences } from "@/components/pwa/reminders";

/**
 * Simpan / hapus langganan Web Push (PRD-07b).
 *   POST   { subscription: { endpoint, keys: { p256dh, auth } }, locale, preferences } -> { ok, stored }
 *   DELETE { endpoint } -> { ok, removed }
 * Tanpa Supabase (service role) -> { ok: true, stored: false, reason: "no-database" }.
 */
export const dynamic = "force-dynamic";

const subscriptionSchema = z.object({
  endpoint: z.url().max(1000),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

const postSchema = z.object({
  subscription: subscriptionSchema,
  locale: z.enum(["ja", "en", "id"]).default("id"),
  preferences: z.record(z.string(), z.boolean()).optional(),
});

const deleteSchema = z.object({ endpoint: z.url().max(1000) });

// Batas sederhana per IP (per instance): 20 permintaan per menit.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(request: Request): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (rateLimited(request)) return Response.json({ ok: false, error: "rate-limited" }, { status: 429 });
  const parsed = postSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });

  const client = getServiceClient();
  if (!client) return Response.json({ ok: true, stored: false, reason: "no-database" });

  const { subscription, locale, preferences } = parsed.data;
  const { error } = await client.from("push_subscriptions").upsert(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      locale,
      preferences: normalizePreferences(preferences),
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );
  if (error) return Response.json({ ok: false, error: "database" }, { status: 500 });
  return Response.json({ ok: true, stored: true });
}

export async function DELETE(request: Request) {
  if (rateLimited(request)) return Response.json({ ok: false, error: "rate-limited" }, { status: 429 });
  const parsed = deleteSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });

  const client = getServiceClient();
  if (!client) return Response.json({ ok: true, removed: false, reason: "no-database" });

  const { error } = await client.from("push_subscriptions").delete().eq("endpoint", parsed.data.endpoint);
  if (error) return Response.json({ ok: false, error: "database" }, { status: 500 });
  return Response.json({ ok: true, removed: true });
}
