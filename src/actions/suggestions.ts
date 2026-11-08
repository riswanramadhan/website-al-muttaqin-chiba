"use server";

import { getTranslations } from "next-intl/server";
import { createAction } from "@/lib/actions";
import { getProfile } from "@/lib/data";
import { buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import { suggestionSchema, type SubmitOutcome } from "@/components/programs/schemas";

/** Saran, pertanyaan, dan laporan fasilitas (PRD-08b): tabel suggestions atau fallback WhatsApp. Nama opsional. */
export const sendSuggestion = createAction({
  name: "sendSuggestion",
  schema: suggestionSchema,
  rateLimit: { max: 6, windowMs: 10 * 60_000 },
  handler: async (data, ctx): Promise<SubmitOutcome> => {
    const t = await getTranslations({ locale: ctx.locale, namespace: "help" });
    const locationLabel = data.kind === "facility" && data.location ? t(`form.locations.${data.location}`) : undefined;
    const message = locationLabel ? `[${locationLabel}] ${data.message}` : data.message;

    if (ctx.supabase) {
      const { error } = await ctx.supabase.from("suggestions").insert({
        kind: data.kind,
        message,
        sender_name: data.senderName ?? null,
        sender_contact: data.senderContact ?? null,
        locale: ctx.locale,
      });
      if (error) throw error;
      return { fallback: null };
    }

    const profile = await getProfile();
    const text = composeMessage(t("whatsapp.title"), [
      [t("form.kind"), t(`form.kinds.${data.kind}`)],
      [t("form.location"), locationLabel],
      [t("form.message"), data.message],
      [t("form.name"), data.senderName ?? t("form.anonymous")],
      [t("form.contact"), data.senderContact],
    ]);
    return { fallback: "whatsapp", url: buildWhatsAppUrl(profile.whatsapp, text), message: text };
  },
});
