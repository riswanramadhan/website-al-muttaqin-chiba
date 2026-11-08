import type { DailyPrayerTimes } from "@/lib/prayer";
import { OBLIGATORY_PRAYERS } from "@/lib/prayer";
import type { ObligatoryPrayer } from "@/lib/types";
import { formatTime, tokyoParts } from "@/lib/utils/i18n";

/**
 * Pembuat berkas iCalendar (RFC 5545) untuk jadwal salat: satu VEVENT per salat wajib,
 * zona waktu Asia/Tokyo lewat VTIMEZONE + TZID, alarm 10 menit sebelum iqamah,
 * baris dilipat pada 75 oktet, pemisah baris CRLF.
 */

export type CalendarInput = {
  days: DailyPrayerTimes[];
  names: Record<ObligatoryPrayer, string>;
  /** Nama singkat masjid untuk SUMMARY, mis. "Al Muttaqin". */
  mosqueName: string;
  location: string;
  url: string;
  iqamahLabel: string;
  /** Domain untuk UID, tanpa protokol. */
  domain: string;
  eventMinutes?: number;
  alarmMinutesBeforeIqamah?: number;
  generatedAt?: Date;
};

const CRLF = "\r\n";
const MAX_OCTETS = 75;
const encoder = new TextEncoder();

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "YYYYMMDDTHHMMSS" dalam waktu sipil Tokyo (dipakai bersama TZID). */
export function toTokyoStamp(date: Date): string {
  const p = tokyoParts(date);
  return `${p.year}${pad(p.month)}${pad(p.day)}T${pad(p.hour)}${pad(p.minute)}${pad(p.second)}`;
}

/** "YYYYMMDDTHHMMSSZ" UTC untuk DTSTAMP. */
export function toUtcStamp(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

/** Escape nilai TEXT: backslash, titik koma, koma, baris baru. */
export function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Lipat satu baris logis agar tiap baris fisik maksimal 75 oktet UTF-8 (lanjutan diawali spasi). */
export function foldLine(line: string): string {
  if (encoder.encode(line).length <= MAX_OCTETS) return line;
  const out: string[] = [];
  let current = "";
  let currentOctets = 0;
  let limit = MAX_OCTETS;
  for (const char of line) {
    const octets = encoder.encode(char).length;
    if (currentOctets + octets > limit) {
      out.push(current);
      current = " ";
      currentOctets = 1;
      limit = MAX_OCTETS;
    }
    current += char;
    currentOctets += octets;
  }
  if (current.length > 0) out.push(current);
  return out.join(CRLF);
}

/** Durasi ISO 8601 untuk TRIGGER relatif terhadap DTSTART (boleh negatif). */
export function triggerFor(minutes: number): string {
  const abs = Math.abs(Math.round(minutes));
  return `${minutes < 0 ? "-" : ""}PT${abs}M`;
}

export function buildPrayerCalendar(input: CalendarInput): string {
  const eventMinutes = input.eventMinutes ?? 15;
  const alarmBefore = input.alarmMinutesBeforeIqamah ?? 10;
  const stamp = toUtcStamp(input.generatedAt ?? new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Al Muttaqin Cultural Center//Prayer Times//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(input.mosqueName)}`,
    "X-WR-TIMEZONE:Asia/Tokyo",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Tokyo",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0900",
    "TZOFFSETTO:+0900",
    "TZNAME:JST",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  for (const day of input.days) {
    for (const prayer of OBLIGATORY_PRAYERS) {
      const start = day.times[prayer];
      const iqamah = day.iqamah[prayer];
      const end = new Date(start.getTime() + eventMinutes * 60_000);
      const name = input.names[prayer];
      const summary = `${name} ${formatTime(start)} · ${input.mosqueName}`;
      const description = `${input.iqamahLabel} ${formatTime(iqamah)}\n${input.url}`;
      const alarmMinutes = (iqamah.getTime() - start.getTime()) / 60_000 - alarmBefore;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${day.dateKey}-${prayer}@${input.domain}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=Asia/Tokyo:${toTokyoStamp(start)}`,
        `DTEND;TZID=Asia/Tokyo:${toTokyoStamp(end)}`,
        `SUMMARY:${escapeText(summary)}`,
        `DESCRIPTION:${escapeText(description)}`,
        `LOCATION:${escapeText(input.location)}`,
        `URL:${input.url}`,
        "CATEGORIES:Prayer",
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeText(`${name} · ${input.iqamahLabel} ${formatTime(iqamah)}`)}`,
        `TRIGGER:${triggerFor(alarmMinutes)}`,
        "END:VALARM",
        "END:VEVENT",
      );
    }
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join(CRLF) + CRLF;
}
