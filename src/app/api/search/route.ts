import { routing } from "@/i18n/routing";
import { runSearch } from "@/components/search/run-search";
import { MAX_QUERY_LENGTH, isLocale, type SearchApiResponse } from "@/components/search/search";

/**
 * Pencarian global (PRD-07b): GET /api/search?locale=id&q=jumat
 * Respons: SearchApiResponse { query, locale, results } (maks 20, href tanpa prefix locale).
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawLocale = url.searchParams.get("locale");
  const locale = isLocale(rawLocale) ? rawLocale : routing.defaultLocale;
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const results = query ? await runSearch(locale, query) : [];
  const body: SearchApiResponse = { query, locale, results };
  return Response.json(body, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
