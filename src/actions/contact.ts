"use server";

import { createAction } from "@/lib/actions";
import { getProfile } from "@/lib/data";
import { buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import { contactMessageSchema, type ContactMessageData } from "@/components/about/contact-schema";

/** Hasil pengiriman: tersimpan di Supabase, atau fallback ke WhatsApp/email bila Supabase belum aktif. */
export type ContactMessageResult =
  | { fallback: "none"; id: string }
  | { fallback: "whatsapp"; url: string; message: string; mailto: string };

const SUBJECT_LABELS: Record<ContactMessageData["subject"], string> = {
  general: "General",
  visit: "Visit",
  media: "Media",
  volunteer: "Volunteer",
  partnership: "Partnership",
};

/**
 * Kirim pesan dari formulir kontak (PRD-03a). Validasi zod, rate limit, honeypot,
 * dan Turnstile ditangani `createAction`. Bila Supabase tersedia, pesan masuk ke
 * tabel `contact_messages`; bila tidak, kembalikan tautan WhatsApp dan mailto
 * berisi pesan yang sama agar jamaah tetap bisa mengirim.
 */
export const sendContactMessage = createAction<ContactMessageData, ContactMessageResult>({
  name: "contact.send",
  schema: contactMessageSchema,
  rateLimit: { max: 3, windowMs: 10 * 60_000 },
  handler: async (data, ctx) => {
    if (ctx.supabase) {
      const { data: row, error } = await ctx.supabase
        .from("contact_messages")
        .insert({
          full_name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          locale: data.locale,
        })
        .select("id")
        .single<{ id: string }>();
      if (error) throw error;
      return { fallback: "none", id: row.id };
    }

    const profile = await getProfile();
    const subject = SUBJECT_LABELS[data.subject];
    const message = composeMessage(`[${subject}] ${profile.shortName} contact form`, [
      ["Name", data.name],
      ["Email", data.email],
      ["Subject", subject],
      ["Message", data.message],
    ]);
    const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`[${subject}] ${data.name}`)}&body=${encodeURIComponent(message)}`;
    return {
      fallback: "whatsapp",
      url: buildWhatsAppUrl(profile.whatsapp, message),
      message,
      mailto,
    };
  },
});
