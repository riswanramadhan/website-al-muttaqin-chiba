"use server";

import { getTranslations } from "next-intl/server";
import { createAction } from "@/lib/actions";
import { getProfile, getProgramBySlug, getPrograms } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import { programRegistrationSchema, type SubmitOutcome } from "@/components/programs/schemas";

/** Pendaftaran program (PRD-08b): tabel program_registrations atau fallback WhatsApp. */
export const registerForProgram = createAction({
  name: "registerForProgram",
  schema: programRegistrationSchema,
  rateLimit: { max: 5, windowMs: 10 * 60_000 },
  handler: async (data, ctx): Promise<SubmitOutcome> => {
    if (ctx.supabase) {
      const { error } = await ctx.supabase.from("program_registrations").insert({
        program_id: data.programId,
        full_name: data.fullName,
        contact: data.contact,
        participant_name: data.participantName ?? null,
        participant_age: data.participantAge ?? null,
        notes: data.notes ?? null,
        locale: ctx.locale,
      });
      if (error) throw error;
      return { fallback: null };
    }

    const [profile, programs, t] = await Promise.all([
      getProfile(),
      getPrograms(),
      getTranslations({ locale: ctx.locale, namespace: "programs" }),
    ]);
    const program = programs.find((p) => p.id === data.programId) ?? (await getProgramBySlug(data.programId));
    const message = composeMessage(t("whatsapp.title"), [
      [t("whatsapp.program"), program ? pick(program.title, ctx.locale) : data.programId],
      [t("form.fullName"), data.fullName],
      [t("form.participantName"), data.participantName],
      [t("form.participantAge"), data.participantAge],
      [t("form.contact"), data.contact],
      [t("form.notes"), data.notes],
    ]);
    return { fallback: "whatsapp", url: buildWhatsAppUrl(profile.whatsapp, message), message };
  },
});
