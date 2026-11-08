import { z } from "zod";

/**
 * Potongan skema Zod bersama untuk formulir publik. Pesan kesalahan memakai kunci
 * terjemahan (common.validation.*) agar bisa diterjemahkan di klien.
 */
export const localeSchema = z.enum(["ja", "en", "id"]);

export const nameSchema = z.string().trim().min(2, "common.validation.name").max(80, "common.validation.tooLong");

export const contactSchema = z.string().trim().min(5, "common.validation.contact").max(120, "common.validation.tooLong");

export const emailSchema = z.string().trim().email("common.validation.email").max(120);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+0-9()\-\s]{8,20}$/, "common.validation.phone");

export const messageSchema = z.string().trim().min(10, "common.validation.message").max(2000, "common.validation.tooLong");

export const consentSchema = z.literal(true, { error: "common.validation.consent" });

/** Kolom anti-bot: Turnstile opsional + honeypot yang harus kosong. */
export const antiSpamSchema = z.object({
  turnstileToken: z.string().optional(),
  honeypot: z.string().max(0).optional(),
  locale: localeSchema.default("id"),
});

export type AntiSpamFields = z.infer<typeof antiSpamSchema>;
