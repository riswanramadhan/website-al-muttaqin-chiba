import "server-only";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ZodType } from "zod";
import type { Locale } from "@/lib/types";
import { getPublicClient } from "@/lib/supabase/server";

/**
 * Kontrak Server Action (PRD-12): satu pembungkus untuk validasi Zod, rate limit,
 * verifikasi Turnstile opsional, dan konteks Supabase. Handler mengembalikan data;
 * pembungkus mengubah error menjadi { ok: false } yang aman ditampilkan ke pengguna.
 */
export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: "validation" | "rate_limit" | "turnstile" | "server"; fieldErrors?: Record<string, string>; message?: string };

export type ActionContext = {
  supabase: SupabaseClient | null;
  locale: Locale;
  ip: string;
  userAgent: string;
};

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Rate limit sederhana per IP di memori (cukup untuk Vercel per instance; Turnstile menambah lapisan). */
function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile belum diaktifkan
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
}

export function createAction<Input, Output>(options: {
  name: string;
  schema: ZodType<Input>;
  rateLimit?: { max: number; windowMs: number };
  requireTurnstile?: boolean;
  handler: (data: Input, ctx: ActionContext) => Promise<Output>;
}) {
  const { name, schema, rateLimit = { max: 5, windowMs: 60_000 }, requireTurnstile = true, handler } = options;

  return async function action(raw: unknown): Promise<ActionResult<Output>> {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "local").split(",")[0].trim();
    const userAgent = h.get("user-agent") ?? "";

    if (!checkRateLimit(`${name}:${ip}`, rateLimit.max, rateLimit.windowMs)) {
      return { ok: false, error: "rate_limit" };
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".") || "_";
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      return { ok: false, error: "validation", fieldErrors };
    }

    const data = parsed.data as Input & { turnstileToken?: string; honeypot?: string; locale?: Locale };
    if (data.honeypot) {
      // Bot mengisi kolom tersembunyi: pura-pura sukses tanpa menyimpan.
      return { ok: true, data: undefined as Output };
    }
    if (requireTurnstile && !(await verifyTurnstile(data.turnstileToken, ip))) {
      return { ok: false, error: "turnstile" };
    }

    try {
      const output = await handler(parsed.data, { supabase: getPublicClient(), locale: data.locale ?? "id", ip, userAgent });
      return { ok: true, data: output };
    } catch (error) {
      console.error(`[action:${name}]`, error);
      return { ok: false, error: "server" };
    }
  };
}
