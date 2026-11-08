"use server";

import { getTranslations } from "next-intl/server";
import { createAction } from "@/lib/actions";
import { getEventBySlug, getProfile } from "@/lib/data";
import { buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import { formatDateTime, pick } from "@/lib/utils/i18n";
import { registrationSchema, type RegistrationOutput, type RegistrationResult, type RegistrationStatus } from "@/components/activities/registration-schema";

/**
 * Pendaftaran agenda (PRD-06). Simpan ke event_registrations bila Supabase aktif
 * (status waitlist bila kuota penuh); selain itu kembalikan tautan WhatsApp berisi
 * pesan yang sama supaya jamaah tetap bisa mendaftar.
 */
const action = createAction<RegistrationOutput, RegistrationResult>({
  name: "registerForEvent",
  schema: registrationSchema,
  rateLimit: { max: 5, windowMs: 60_000 },
  handler: async (data, ctx) => {
    const event = await getEventBySlug(data.eventSlug);
    if (!event) throw new Error(`event not found: ${data.eventSlug}`);

    const reg = event.registration;
    const full = reg.quota !== undefined && (reg.registered ?? 0) >= reg.quota;
    const status: RegistrationStatus = full ? "waitlist" : "registered";

    if (ctx.supabase) {
      const { error } = await ctx.supabase.from("event_registrations").insert({
        event_id: event.id,
        full_name: data.fullName,
        contact: data.contact,
        participants: data.participants,
        notes: data.notes || null,
        status,
        locale: ctx.locale,
      });
      if (error) throw error;
      return { status, fallback: null };
    }

    const [profile, t] = await Promise.all([getProfile(), getTranslations({ locale: ctx.locale, namespace: "events" })]);
    const message = composeMessage(t("form.waMessageTitle", { title: pick(event.title, ctx.locale) }), [
      [t("form.waDate"), `${formatDateTime(event.startsAt, ctx.locale)} JST`],
      [t("form.waName"), data.fullName],
      [t("form.waContact"), data.contact],
      [t("form.waParticipants"), data.participants],
      [t("form.waNotes"), data.notes],
      [t("form.waStatus"), status === "waitlist" ? t("card.waitlist") : t("card.registrationOpen")],
    ]);
    return { status, fallback: "whatsapp", url: buildWhatsAppUrl(profile.whatsapp, message), message };
  },
});

export async function registerForEvent(raw: unknown) {
  return action(raw);
}
