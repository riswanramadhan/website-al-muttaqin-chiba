import { z } from "zod";
import { antiSpamSchema, consentSchema, contactSchema, nameSchema } from "@/lib/schemas";

/**
 * Skema formulir modul donasi (dipakai di klien lewat zodResolver dan di Server Action).
 * Pesan kesalahan berupa kunci terjemahan common.validation.* (diterjemahkan di klien).
 */
export const donationCurrencySchema = z.enum(["JPY", "IDR"]);

const amountSchema = z
  .number({ error: "common.validation.amount" })
  .int("common.validation.amount")
  .positive("common.validation.amount")
  .max(1_000_000_000, "common.validation.amount");

const optionalText = (max: number) => z.string().trim().max(max, "common.validation.tooLong").optional();

export const confirmDonationSchema = z
  .object({
    programSlug: z.string().min(1, "common.validation.required"),
    accountId: z.string().min(1, "common.validation.required"),
    currency: donationCurrencySchema,
    amount: amountSchema,
    transferredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "common.validation.date"),
    donorName: optionalText(80),
    donorContact: optionalText(120),
    onBehalfOf: optionalText(120),
    message: optionalText(1000),
    consent: consentSchema,
  })
  .extend(antiSpamSchema.shape);

export type ConfirmDonationInput = z.input<typeof confirmDonationSchema>;
export type ConfirmDonationValues = z.output<typeof confirmDonationSchema>;

export const recurringMethodSchema = z.enum(["bank", "qris", "ewallet"]);

export const recurringDonorSchema = z
  .object({
    fullName: nameSchema,
    contact: contactSchema,
    monthlyAmount: amountSchema,
    currency: donationCurrencySchema,
    paymentDay: z
      .number({ error: "common.validation.required" })
      .int("common.validation.required")
      .min(1, "common.validation.required")
      .max(28, "common.validation.required"),
    method: recurringMethodSchema,
    publishName: z.boolean(),
    consent: consentSchema,
  })
  .extend(antiSpamSchema.shape);

export type RecurringDonorInput = z.input<typeof recurringDonorSchema>;
export type RecurringDonorValues = z.output<typeof recurringDonorSchema>;

/** Hasil Server Action: tersimpan di Supabase, atau fallback WhatsApp dengan URL siap kirim. */
export type DonationActionOutput =
  | { fallback: null; id: string }
  | { fallback: "whatsapp"; url: string; message: string };
