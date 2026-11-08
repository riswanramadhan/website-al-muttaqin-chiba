import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import type { Locale, ObligatoryPrayer } from "@/lib/types";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { getServiceClient } from "@/lib/supabase/server";
import { pick } from "@/lib/utils/i18n";
import { buildReminderMessage, getCronEvents, normalizePreferences, reminderTag, wantsEvent, type ReminderEvent } from "@/components/pwa/reminders";

/**
 * Pengirim Web Push (PRD-07b).
 * Otorisasi: `Authorization: Bearer <PUSH_CRON_SECRET | CRON_SECRET>`.
 *
 * Mode cron (GET tiap 5 menit dari penjadwal luar seperti cron-job.org, atau POST tanpa body / { mode: "cron" }):
 *   adzan, iqamah, dan Jumatan yang jatuh 5-10 menit ke depan, dikirim sesuai preferensi & bahasa.
 * Mode broadcast (POST dari admin):
 *   { mode: "broadcast", title: { ja, en, id }, body: { ja, en, id }, url } ke semua langganan.
 *
 * Respons: { ok, sent, failed?, removed?, reason? }. Tanpa Supabase -> reason "no-database";
 * tanpa VAPID -> reason "no-vapid". Langganan yang 404/410 dihapus.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Row = { id: string; endpoint: string; keys: { p256dh?: string; auth?: string } | null; locale: string | null; preferences: unknown };
type Payload = { title: string; body: string; url: string; tag: string };
type SendResult = { ok: true; sent: number; failed?: number; removed?: number; mode?: "cron" | "broadcast"; reason?: string };

const localized = z.object({ ja: z.string().max(300).optional(), en: z.string().max(300).optional(), id: z.string().max(300).optional() });
const broadcastSchema = z.object({
  mode: z.literal("broadcast"),
  title: localized,
  body: localized,
  url: z.string().max(500).optional(),
});

function isAuthorized(request: Request): boolean {
  const secrets = [process.env.PUSH_CRON_SECRET, process.env.CRON_SECRET].filter((s): s is string => Boolean(s));
  if (secrets.length === 0) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token.length > 0 && secrets.includes(token);
}

function toLocale(value: string | null): Locale {
  return value === "ja" || value === "en" || value === "id" ? value : "id";
}

function localizeUrl(url: string | undefined, locale: Locale): string {
  if (!url) return `/${locale}/app`;
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  if (/^\/(ja|en|id)(\/|$)/.test(path)) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

function toLocalizedText(v: z.infer<typeof localized>) {
  return { ja: v.ja ?? "", en: v.en ?? "", id: v.id ?? "" };
}

async function sendAll(rows: Row[], payloadFor: (row: Row, locale: Locale) => Payload | Payload[] | null): Promise<{ sent: number; failed: number; removed: number }> {
  const client = getServiceClient();
  let sent = 0;
  let failed = 0;
  const gone: string[] = [];
  const jobs: { row: Row; payload: Payload }[] = [];
  for (const row of rows) {
    if (!row.keys?.p256dh || !row.keys.auth) continue;
    const p = payloadFor(row, toLocale(row.locale));
    if (!p) continue;
    for (const payload of Array.isArray(p) ? p : [p]) jobs.push({ row, payload });
  }

  const BATCH = 50;
  for (let i = 0; i < jobs.length; i += BATCH) {
    const results = await Promise.allSettled(
      jobs.slice(i, i + BATCH).map(({ row, payload }) => {
        const sub: WebPushSubscription = { endpoint: row.endpoint, keys: { p256dh: row.keys?.p256dh ?? "", auth: row.keys?.auth ?? "" } };
        return webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 15 * 60, urgency: "high", topic: payload.tag.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 32) });
      }),
    );
    results.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        sent += 1;
        return;
      }
      failed += 1;
      const status = (r.reason as { statusCode?: number } | undefined)?.statusCode;
      if (status === 404 || status === 410) gone.push(jobs[i + idx].row.endpoint);
    });
  }

  const unique = Array.from(new Set(gone));
  if (client && unique.length > 0) await client.from("push_subscriptions").delete().in("endpoint", unique);
  return { sent, failed, removed: unique.length };
}

async function handle(request: Request, body: unknown): Promise<Response> {
  if (!isAuthorized(request)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let broadcast: z.infer<typeof broadcastSchema> | null = null;
  if (body && typeof body === "object" && (body as { mode?: unknown }).mode === "broadcast") {
    const parsed = broadcastSchema.safeParse(body);
    if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
    broadcast = parsed.data;
  }
  const mode = broadcast ? "broadcast" : "cron";

  const client = getServiceClient();
  if (!client) return Response.json({ ok: true, sent: 0, mode, reason: "no-database" } satisfies SendResult);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return Response.json({ ok: true, sent: 0, mode, reason: "no-vapid" } satisfies SendResult);
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:info@almuttaqinculturalcenter.org", publicKey, privateKey);

  let events: ReminderEvent[] = [];
  if (!broadcast) {
    const [config, profile] = await Promise.all([getPrayerConfig(), getProfile()]);
    events = getCronEvents(config, profile.coordinates, new Date());
    if (events.length === 0) return Response.json({ ok: true, sent: 0, mode, reason: "no-events" } satisfies SendResult);
  }

  const { data, error } = await client.from("push_subscriptions").select("id, endpoint, keys, locale, preferences");
  if (error) return Response.json({ ok: false, error: "database" }, { status: 500 });
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return Response.json({ ok: true, sent: 0, mode, reason: "no-subscribers" } satisfies SendResult);

  if (broadcast) {
    const title = toLocalizedText(broadcast.title);
    const text = toLocalizedText(broadcast.body);
    const tag = `broadcast-${Date.now()}`;
    const result = await sendAll(rows, (_row, locale) => ({ title: pick(title, locale) || "Al Muttaqin", body: pick(text, locale), url: localizeUrl(broadcast.url, locale), tag }));
    return Response.json({ ok: true, mode, ...result } satisfies SendResult);
  }

  // Teks per bahasa (dimuat sekali per locale yang dipakai).
  const locales = Array.from(new Set(rows.map((r) => toLocale(r.locale))));
  const messages = new Map<Locale, Map<string, { title: string; body: string }>>();
  await Promise.all(
    locales.map(async (locale) => {
      const [t, tp] = await Promise.all([getTranslations({ locale, namespace: "settings" }), getTranslations({ locale, namespace: "prayer" })]);
      const map = new Map<string, { title: string; body: string }>();
      for (const e of events) {
        map.set(
          reminderTag(e),
          buildReminderMessage(e, locale, (key, values) => t(`notify.${key}`, values), (p: ObligatoryPrayer) => tp(`names.${p}`)),
        );
      }
      messages.set(locale, map);
    }),
  );

  const result = await sendAll(rows, (row, locale) => {
    const prefs = normalizePreferences(row.preferences);
    const wanted = events.filter((e) => wantsEvent(prefs, e));
    if (wanted.length === 0) return null;
    return wanted.map((e) => {
      const tag = reminderTag(e);
      const msg = messages.get(locale)?.get(tag) ?? { title: "Al Muttaqin", body: "" };
      return { ...msg, url: `/${locale}/app/prayer`, tag };
    });
  });
  return Response.json({ ok: true, mode, ...result } satisfies SendResult);
}

export async function GET(request: Request) {
  return handle(request, null);
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : null;
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  return handle(request, body);
}
