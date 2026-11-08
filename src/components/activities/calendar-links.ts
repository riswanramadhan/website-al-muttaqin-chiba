import type { Locale, MosqueEvent } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";

/**
 * Pembantu tautan kalender (Google Calendar & ICS). Tanpa dependensi React agar
 * bisa dipakai di route handler, Server Component, maupun klien.
 */

/** "2026-11-07T08:30:00.000Z" -> "20261107T083000Z" (format Google Calendar dan ICS). */
export function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function eventPath(event: Pick<MosqueEvent, "slug">, locale: Locale): string {
  return `/${locale}/events/${event.slug}`;
}

export function icsPath(event: Pick<MosqueEvent, "slug">, locale: Locale): string {
  return `/api/events/${event.slug}/calendar.ics?locale=${locale}`;
}

export function googleCalendarUrl(event: MosqueEvent, locale: Locale, siteUrl: string, details: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: pick(event.title, locale),
    dates: `${toCalendarStamp(event.startsAt)}/${toCalendarStamp(event.endsAt)}`,
    details,
    location: `${pick(event.location, locale)}, Al Muttaqin Cultural Center, Matsudo`,
    ctz: "Asia/Tokyo",
    sprop: `website:${siteUrl}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escape teks sesuai RFC 5545 (koma, titik koma, backslash, baris baru). */
export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Lipat baris ICS maksimal 75 oktet (RFC 5545 §3.1). */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    if (encoder.encode(current + ch).length > 74) {
      out.push(current);
      current = ` ${ch}`;
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out.join("\r\n");
}

export function buildIcs(opts: { uid: string; summary: string; description: string; location: string; url: string; startsAt: string; endsAt: string; stampAt?: string }): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Al Muttaqin Cultural Center//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${toCalendarStamp(opts.stampAt ?? new Date().toISOString())}`,
    `DTSTART:${toCalendarStamp(opts.startsAt)}`,
    `DTEND:${toCalendarStamp(opts.endsAt)}`,
    `SUMMARY:${escapeIcsText(opts.summary)}`,
    `DESCRIPTION:${escapeIcsText(opts.description)}`,
    `LOCATION:${escapeIcsText(opts.location)}`,
    `URL:${opts.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}
