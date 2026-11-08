import "server-only";
import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";
import { AdminError, requireAdmin, type AdminRole, type AdminSession } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/site";

/**
 * Pembungkus Server Action admin (PRD-09): requireAdmin(roles) -> validasi Zod -> handler.
 * Semua kesalahan diubah menjadi { ok: false, error } yang aman ditampilkan di UI.
 */
export type AdminActionError = "demo" | "unauthorized" | "forbidden" | "validation" | "server";

export type AdminActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: AdminActionError; message?: string; fieldErrors?: Record<string, string> };

export async function runAdminAction<Input, Output>(options: {
  roles?: AdminRole[];
  schema: ZodType<Input>;
  raw: unknown;
  handler: (data: Input, session: AdminSession) => Promise<Output>;
}): Promise<AdminActionResult<Output>> {
  try {
    const session = await requireAdmin(options.roles);
    const parsed = options.schema.safeParse(options.raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".") || "_";
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      return { ok: false, error: "validation", fieldErrors };
    }
    const data = await options.handler(parsed.data, session);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof AdminError) return { ok: false, error: error.code };
    // redirect() dari requireAdmin melempar NEXT_REDIRECT: teruskan agar Next menangani.
    if (error && typeof error === "object" && "digest" in error && String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")) throw error;
    console.error("[admin action]", error);
    return { ok: false, error: "server", message: error instanceof Error ? error.message : undefined };
  }
}

const LOCALES = ["ja", "en", "id"] as const;

/**
 * Segarkan halaman publik pada ketiga bahasa. `revalidatePath` langsung sudah cukup (satu
 * aplikasi); bila REVALIDATE_SECRET ada, endpoint /api/revalidate juga dipanggil (opsional).
 */
export async function revalidatePublic(paths: string[]): Promise<void> {
  for (const path of paths) {
    for (const locale of LOCALES) revalidatePath(`/${locale}${path}`);
  }
  revalidatePath("/admin", "layout");

  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (error) {
    console.warn("[admin] /api/revalidate tidak terjangkau:", error instanceof Error ? error.message : error);
  }
}
