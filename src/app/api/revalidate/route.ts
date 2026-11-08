import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

/**
 * Dipanggil panel admin / webhook Supabase setelah konten diterbitkan (PRD §5: hanya konten
 * terbit yang memicu revalidate). Body: { "paths": ["/news", "/news/slug"] } tanpa prefix locale.
 * Header: Authorization: Bearer <REVALIDATE_SECRET>.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { paths?: string[] };
  const paths = Array.isArray(body.paths) && body.paths.length ? body.paths : [""];
  const revalidated: string[] = [];
  for (const path of paths) {
    for (const locale of routing.locales) {
      const full = `/${locale}${path}`;
      revalidatePath(full);
      revalidated.push(full);
    }
  }
  return NextResponse.json({ ok: true, revalidated, at: new Date().toISOString() });
}
