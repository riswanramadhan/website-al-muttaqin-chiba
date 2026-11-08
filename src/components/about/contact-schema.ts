import { z } from "zod";
import { antiSpamSchema, consentSchema, emailSchema, messageSchema, nameSchema } from "@/lib/schemas";

/** Subjek formulir kontak (PRD-03a). Nilai disimpan apa adanya di `contact_messages.subject`. */
export const CONTACT_SUBJECTS = ["general", "visit", "media", "volunteer", "partnership"] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export function isContactSubject(value: unknown): value is ContactSubject {
  return typeof value === "string" && (CONTACT_SUBJECTS as readonly string[]).includes(value);
}

/**
 * Skema formulir kontak; dipakai di klien (react-hook-form) dan di Server Action.
 * Pesan kesalahan adalah kunci `common.validation.*` yang diterjemahkan di klien.
 */
export const contactMessageSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.enum(CONTACT_SUBJECTS, { error: "common.validation.required" }),
  message: messageSchema,
  consent: consentSchema,
  ...antiSpamSchema.shape,
});

export type ContactMessageData = z.output<typeof contactMessageSchema>;

/**
 * Versi klien untuk react-hook-form: `consent` bertipe boolean (kotak centang) dan
 * baru divalidasi harus `true` saat submit; server tetap memakai `consentSchema` literal.
 */
export const contactFormSchema = contactMessageSchema.extend({
  consent: z.boolean().refine((v) => v === true, { message: "common.validation.consent" }),
  locale: z.enum(["ja", "en", "id"]),
  honeypot: z.string().max(0),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
