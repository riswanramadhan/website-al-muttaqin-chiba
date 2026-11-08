import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { getEventBySlug } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { pick } from "@/lib/utils/i18n";
import { buildIcs } from "@/components/activities/calendar-links";

/**
 * Berkas iCalendar untuk satu agenda (PRD-06): satu VEVENT dengan DTSTART/DTEND UTC,
 * judul sesuai ?locale=, lokasi, deskripsi, dan URL halaman. Baris dipisah CRLF.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const requested = new URL(request.url).searchParams.get("locale");
  const locale: Locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const event = await getEventBySlug(slug);
  if (!event) return new Response("Not found", { status: 404 });

  const t = await getTranslations({ locale, namespace: "events" });
  const title = pick(event.title, locale);
  const url = `${siteUrl}/${locale}/events/${event.slug}`;
  const description = [pick(event.excerpt, locale), t("calendar.description", { title, url })].filter(Boolean).join("\n\n");

  const body = buildIcs({
    uid: `${event.id}@almuttaqinculturalcenter.org`,
    summary: title,
    description,
    location: `${pick(event.location, locale)}, Al Muttaqin Cultural Center, Matsudo`,
    url,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    stampAt: event.startsAt,
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
