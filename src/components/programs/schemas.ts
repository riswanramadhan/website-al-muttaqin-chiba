import { z } from "zod";
import { antiSpamSchema, contactSchema, nameSchema } from "@/lib/schemas";

/**
 * Skema Zod modul programs (PRD-08b). Dipakai di klien (zodResolver) dan di
 * Server Action; pesan kesalahan berupa kunci terjemahan.
 */

export const SUGGESTION_KINDS = ["suggestion", "facility", "question", "ustadz", "website", "other"] as const;
export type SuggestionKind = (typeof SUGGESTION_KINDS)[number];

export const FACILITY_LOCATIONS = ["toilet", "ac", "carpet", "light", "other"] as const;
export type FacilityLocation = (typeof FACILITY_LOCATIONS)[number];

export const BOOKING_PURPOSES = ["wedding", "aqiqah", "seminar", "meeting", "other"] as const;
export type BookingPurpose = (typeof BOOKING_PURPOSES)[number];

export const PROGRAM_IDS = ["tpa", "muallaf-class", "japanese-class", "open-mosque", "school-visit", "weekly-kajian", "youth"] as const;

/** Hasil kirim formulir: tersimpan di Supabase, atau fallback WhatsApp dengan URL & teks pesan. */
export type SubmitOutcome = { fallback: null } | { fallback: "whatsapp"; url: string; message: string };

const consentField = z.boolean().refine((v) => v === true, "common.validation.consent");
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "common.validation.tooLong")
    .optional()
    .transform((v) => (v === "" ? undefined : v));

export const programRegistrationSchema = z
  .object({
    programId: z.enum(PROGRAM_IDS, { error: "common.validation.required" }),
    fullName: nameSchema,
    participantName: optionalText(80),
    participantAge: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z.number().int().min(1, "programs.validation.age").max(120, "programs.validation.age").optional(),
    ),
    contact: contactSchema,
    notes: optionalText(1000),
    consent: consentField,
    ...antiSpamSchema.shape,
  })
  .superRefine((data, ctx) => {
    if (data.programId === "tpa" && data.participantAge === undefined) {
      ctx.addIssue({ code: "custom", path: ["participantAge"], message: "programs.validation.age" });
    }
  });

export type ProgramRegistrationInput = z.input<typeof programRegistrationSchema>;
export type ProgramRegistrationValues = z.output<typeof programRegistrationSchema>;

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "common.validation.date");
const timeKey = z.string().regex(/^\d{2}:\d{2}$/, "booking.validation.time");

/** Skema booking dibangun dengan daftar ruangan agar kapasitas bisa divalidasi. */
export function buildBookingSchema(rooms: { id: string; capacity: number }[], todayKey?: string) {
  const ids = rooms.map((r) => r.id);
  return z
    .object({
      roomId: z.string().refine((v) => ids.includes(v), "common.validation.required"),
      purpose: z.enum(BOOKING_PURPOSES, { error: "common.validation.required" }),
      organizerName: nameSchema,
      organizerContact: contactSchema,
      date: dateKey,
      startTime: timeKey,
      endTime: timeKey,
      attendees: z.preprocess(
        (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
        z.number({ error: "booking.validation.attendees" }).int().min(1, "booking.validation.attendees"),
      ),
      notes: optionalText(1000),
      consent: consentField,
      ...antiSpamSchema.shape,
    })
    .superRefine((data, ctx) => {
      if (data.endTime <= data.startTime) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "booking.validation.endAfterStart" });
      }
      if (data.endTime > "22:00") {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "booking.validation.latest" });
      }
      if (todayKey && data.date < todayKey) {
        ctx.addIssue({ code: "custom", path: ["date"], message: "booking.validation.past" });
      }
      const room = rooms.find((r) => r.id === data.roomId);
      if (room && data.attendees > room.capacity) {
        ctx.addIssue({ code: "custom", path: ["attendees"], message: "booking.validation.capacity" });
      }
    });
}

export type BookingSchema = ReturnType<typeof buildBookingSchema>;
export type BookingInput = z.input<BookingSchema>;
export type BookingValues = z.output<BookingSchema>;

export const suggestionSchema = z
  .object({
    kind: z.enum(SUGGESTION_KINDS, { error: "common.validation.required" }),
    location: z.enum(FACILITY_LOCATIONS).optional(),
    message: z.string().trim().min(10, "common.validation.message").max(2000, "common.validation.tooLong"),
    senderName: optionalText(80),
    senderContact: optionalText(120),
    consent: consentField,
    ...antiSpamSchema.shape,
  })
  .superRefine((data, ctx) => {
    if (data.kind === "facility" && !data.location) {
      ctx.addIssue({ code: "custom", path: ["location"], message: "common.validation.required" });
    }
  });

export type SuggestionInput = z.input<typeof suggestionSchema>;
export type SuggestionValues = z.output<typeof suggestionSchema>;
