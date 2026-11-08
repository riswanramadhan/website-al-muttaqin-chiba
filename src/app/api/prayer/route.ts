import { NextResponse } from "next/server";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { getUpcomingSchedule, serializeDay } from "@/lib/prayer";
import { clampDays } from "@/components/prayer/prayer-utils";

/**
 * GET /api/prayer?days=30 — jadwal N hari ke depan (1..60) mulai hari ini (Asia/Tokyo).
 * Dipakai App Jamaah untuk cache offline 30 hari (localStorage `acc-prayer-30d`) dan service worker.
 */
export async function GET(request: Request) {
  const days = clampDays(new URL(request.url).searchParams.get("days"));
  const [config, profile] = await Promise.all([getPrayerConfig(), getProfile()]);
  const schedule = getUpcomingSchedule(days, config, profile.coordinates).map(serializeDay);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      config: { method: config.method, madhab: config.madhab },
      coordinates: profile.coordinates,
      days: schedule,
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
