/**
 * Ekspor publik modul donasi (PRD-05). Kontrak yang dipakai beranda & App home:
 *   DonationAccountsList  Server: { locale: Locale; compact?: boolean }
 *   DonateCta             Server: { locale: Locale; tone?: "default" | "inverse" }
 *   DonationProgress      Server: { locale: Locale; limit?: number }
 *   ZakatCalculator       Client: { locale: Locale }
 */
export { DonationAccountsList } from "./donation-accounts-list";
export { DonateCta } from "./donate-cta";
export { DonationProgress } from "./donation-progress";
export { ZakatCalculator } from "./zakat-calculator";

// Ekspor tambahan untuk halaman modul ini.
// Formulir diekspor lewat pembungkus malas (lazy-forms.tsx) agar zod + react-hook-form hanya terunduh
// di halaman yang benar-benar menampilkannya, bukan di setiap halaman yang mengimpor berkas indeks ini.
export { DonationFlow, RecurringDonorForm } from "./lazy-forms";
export { DonationFaq } from "./donation-faq";
export { GatewayCard } from "./gateway-card";
export { TransparencyChart } from "./transparency-chart";
export { TransparencyReportCard } from "./transparency-report";
export { makeUniqueAmount, splitUniqueAmount, formatUniqueCode, QUICK_AMOUNTS } from "./unique-amount";
export { buildRecurringCalendarUrl } from "./calendar-link";
