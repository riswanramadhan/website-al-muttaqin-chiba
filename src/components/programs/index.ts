export { ProgramCard } from "./program-card"; // Server: { program: Program; locale: Locale }
export { ProgramGrid } from "./program-grid"; // Server: { locale: Locale; limit?: number }
// Formulir diekspor lewat pembungkus malas (lazy-forms.tsx) agar zod + react-hook-form hanya terunduh
// di halaman yang benar-benar menampilkannya, bukan di setiap halaman yang mengimpor berkas indeks ini.
export { HelpCenter, SuggestionForm, ProgramRegistrationForm, BookingForm } from "./lazy-forms";
// HelpCenter { locale; whatsapp; mapsUrl; email } · SuggestionForm { locale; defaultKind? } ·
// ProgramRegistrationForm { locale; programId; programTitle } · BookingForm { locale; rooms; todayKey }
export type { BookingRoomOption } from "./booking-form";
export { ProgramIcon, PROGRAM_ICONS } from "./program-icon";
export type { SuggestionKind, FacilityLocation, BookingPurpose, SubmitOutcome } from "./schemas";
