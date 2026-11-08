"use server";

import { getTranslations } from "next-intl/server";
import { createAction, type ActionResult } from "@/lib/actions";
import { getProfile, getRooms } from "@/lib/data";
import { parseTokyoDate, pick, tokyoDateKey } from "@/lib/utils/i18n";
import { buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import { buildBookingSchema, type SubmitOutcome } from "@/components/programs/schemas";

/**
 * Permintaan peminjaman ruangan (PRD-08b): tabel room_bookings atau fallback WhatsApp.
 * Skema dibangun per panggilan agar kapasitas ruangan ikut divalidasi di server.
 */
export async function requestRoomBooking(raw: unknown): Promise<ActionResult<SubmitOutcome>> {
  const rooms = await getRooms();
  const action = createAction({
    name: "requestRoomBooking",
    schema: buildBookingSchema(rooms, tokyoDateKey()),
    rateLimit: { max: 5, windowMs: 10 * 60_000 },
    handler: async (data, ctx): Promise<SubmitOutcome> => {
      const startsAt = parseTokyoDate(data.date, data.startTime).toISOString();
      const endsAt = parseTokyoDate(data.date, data.endTime).toISOString();

      if (ctx.supabase) {
        const { error } = await ctx.supabase.from("room_bookings").insert({
          room_id: data.roomId,
          purpose: data.purpose,
          organizer_name: data.organizerName,
          organizer_contact: data.organizerContact,
          starts_at: startsAt,
          ends_at: endsAt,
          attendees: data.attendees,
          notes: data.notes ?? null,
          locale: ctx.locale,
        });
        if (error) throw error;
        return { fallback: null };
      }

      const [profile, t] = await Promise.all([getProfile(), getTranslations({ locale: ctx.locale, namespace: "booking" })]);
      const room = rooms.find((r) => r.id === data.roomId);
      const message = composeMessage(t("whatsapp.title"), [
        [t("form.room"), room ? pick(room.name, ctx.locale) : data.roomId],
        [t("form.purpose"), t(`purposes.${data.purpose}`)],
        [t("form.organizerName"), data.organizerName],
        [t("form.organizerContact"), data.organizerContact],
        [t("form.date"), data.date],
        [t("form.time"), `${data.startTime} - ${data.endTime}`],
        [t("form.attendees"), data.attendees],
        [t("form.notes"), data.notes],
      ]);
      return { fallback: "whatsapp", url: buildWhatsAppUrl(profile.whatsapp, message), message };
    },
  });
  return action(raw);
}
