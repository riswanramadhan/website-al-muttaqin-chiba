import { z } from "zod";
import { antiSpamSchema, contactSchema, nameSchema } from "@/lib/schemas";

/**
 * Skema pendaftaran agenda (PRD-06). Dipakai bersama oleh formulir klien
 * (react-hook-form + zodResolver) dan Server Action registerForEvent.
 * Pesan kesalahan berupa kunci terjemahan common.validation.*.
 */
export const registrationSchema = z.object({
  eventSlug: z.string().trim().min(1, "common.validation.required").max(120),
  fullName: nameSchema,
  contact: contactSchema,
  participants: z.number({ error: "common.validation.required" }).int("common.validation.required").min(1, "common.validation.required").max(10, "common.validation.tooLong"),
  notes: z.string().trim().max(500, "common.validation.tooLong").optional(),
  consent: z.boolean().refine((v) => v === true, { message: "common.validation.consent" }),
  ...antiSpamSchema.shape,
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationOutput = z.output<typeof registrationSchema>;

export type RegistrationStatus = "registered" | "waitlist";

export type RegistrationResult =
  | { status: RegistrationStatus; fallback: null }
  | { status: RegistrationStatus; fallback: "whatsapp"; url: string; message: string };
