import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import type { ZodType } from "zod";
import { AdminError, requireAdmin, type AdminRole, type AdminSession } from "@/lib/supabase/admin";
import { CMS_TAG } from "@/lib/data/supabase-adapter";

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

/**
 * Segarkan situs publik setelah admin menyimpan. Data Supabase di-cache dengan tag `cms`
 * (lihat src/lib/data/supabase-adapter.ts): `updateTag` membuang cache itu sehingga permintaan
 * berikutnya membaca data baru, dan `revalidatePath("/", "layout")` menandai semua halaman
 * statis untuk dibuat ulang saat dikunjungi lagi (bukan sekaligus, jadi tetap hemat).
 * Endpoint /api/revalidate tetap tersedia untuk pemicu dari luar (mis. webhook Supabase).
 */
export async function revalidatePublic(_paths: string[] = []): Promise<void> {
  void _paths;
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}
