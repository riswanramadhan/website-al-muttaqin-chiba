"use server";

import type { PrayerConfig } from "@/lib/types";
import { createServerSupabase, logActivity } from "@/lib/supabase/admin";
import { runAdminAction, revalidatePublic, type AdminActionResult } from "@/actions/admin/shared";
import { prayerConfigSchema, type PrayerConfigInput } from "@/components/admin/schemas";
import { textOrNull } from "@/components/admin/utils";

/** Bentuk PrayerConfig (src/lib/types) dari isian formulir admin. */
function toPrayerConfig(d: PrayerConfigInput): PrayerConfig {
  const rule = (r: PrayerConfigInput["iqamah"]["fajr"]) => (r.type === "fixed" ? { type: "fixed" as const, time: r.time || "00:00" } : { type: "offset" as const, minutes: r.minutes });
  const note = textOrNull(d.jumuahNote);
  return {
    method: d.method,
    madhab: d.madhab,
    highLatitudeRule: d.highLatitudeRule,
    adjustments: d.adjustments,
    iqamah: {
      fajr: rule(d.iqamah.fajr),
      dhuhr: rule(d.iqamah.dhuhr),
      asr: rule(d.iqamah.asr),
      maghrib: rule(d.iqamah.maghrib),
      isha: rule(d.iqamah.isha),
    },
    hijriAdjustment: d.hijriAdjustment,
    timezone: "Asia/Tokyo",
    jumuah: {
      time: d.jumuahTime,
      ...(d.jumuahSecondTime ? { secondTime: d.jumuahSecondTime } : {}),
      ...(note ? { note } : {}),
    },
    ...(d.ramadanStart && d.ramadanEnd ? { ramadan: { start: d.ramadanStart, end: d.ramadanEnd } } : {}),
  };
}

/** Simpan prayer_config (baris tunggal id=1) lalu segarkan jadwal publik dan App. */
export async function savePrayerConfig(raw: unknown): Promise<AdminActionResult<undefined>> {
  return runAdminAction({
    roles: ["content_admin"],
    schema: prayerConfigSchema,
    raw,
    handler: async (d, session) => {
      const supabase = await createServerSupabase();
      if (!supabase) throw new Error("supabase");
      const config = toPrayerConfig(d);
      const { error } = await supabase.from("prayer_config").upsert({ id: 1, config, updated_by: session.admin.id, updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
      await logActivity(session.admin.id, "update", "prayer_config", "1", { hijriAdjustment: d.hijriAdjustment, jumuah: d.jumuahTime, ramadan: config.ramadan ?? null });
      await revalidatePublic(["", "/prayer-times", "/jumuah", "/ramadan", "/app", "/app/prayer", "/app/hijri", "/manifest.webmanifest"]);
      return undefined;
    },
  });
}
