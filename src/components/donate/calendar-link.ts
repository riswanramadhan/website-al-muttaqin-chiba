import { daysInMonth, tokyoParts } from "@/lib/utils/i18n";

/**
 * Tautan Google Calendar untuk pengingat donatur tetap: acara berulang tiap bulan pada
 * tanggal `day` (1..28), pukul 09:00-09:30 Asia/Tokyo, mulai dari kejadian terdekat.
 * Bentuk: https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&recur=RRULE:FREQ=MONTHLY;BYMONTHDAY=N&dates=...
 */
export function buildRecurringCalendarUrl(opts: { title: string; details?: string; day: number; now?: Date }): string {
  const day = Math.min(28, Math.max(1, Math.floor(opts.day) || 1));
  const p = tokyoParts(opts.now ?? new Date());
  let year = p.year;
  let month = p.month;
  if (p.day > day) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  const safeDay = Math.min(day, daysInMonth(year, month));
  const ymd = `${year}${String(month).padStart(2, "0")}${String(safeDay).padStart(2, "0")}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${ymd}T090000/${ymd}T093000`,
    ctz: "Asia/Tokyo",
    recur: `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`,
  });
  if (opts.details) params.set("details", opts.details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
