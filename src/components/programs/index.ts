export { ProgramCard } from "./program-card"; // Server: { program: Program; locale: Locale }
export { ProgramGrid } from "./program-grid"; // Server: { locale: Locale; limit?: number }
export { HelpCenter } from "./help-center"; // Client: { locale: Locale; whatsapp: string; mapsUrl: string; email: string }
export { SuggestionForm } from "./suggestion-form"; // Client: { locale: Locale; defaultKind?: SuggestionKind; onDone?: () => void }
export { ProgramRegistrationForm } from "./program-registration-form"; // Client: { locale; programId; programTitle }
export { BookingForm, type BookingRoomOption } from "./booking-form"; // Client: { locale; rooms; todayKey }
export { ProgramIcon, PROGRAM_ICONS } from "./program-icon";
export type { SuggestionKind, FacilityLocation, BookingPurpose, SubmitOutcome } from "./schemas";
