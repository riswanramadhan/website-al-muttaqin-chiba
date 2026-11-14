/**
 * Ekspor publik modul `about` (PRD-03a). Kontrak ini dipakai beranda dan modul lain.
 */
export { FaqAccordion } from "./faq-accordion"; // Client: { items: FaqItem[]; locale: Locale; searchable?: boolean }
export { GalleryGrid } from "./gallery-grid"; // Client: { items: GalleryItem[]; locale: Locale; limit?: number }
export { ContactCard } from "./contact-card"; // Server: { locale: Locale; tone?: "default" | "inverse" }
export { PartnersStrip } from "./partners-strip"; // Server: { locale: Locale }
export { StatsRow } from "./stats-row"; // Server: { locale: Locale; tone?: "default" | "inverse" }

// Tambahan internal modul (boleh dipakai modul lain bila perlu).
// Formulir diekspor lewat pembungkus malas (lazy-forms.tsx) agar zod + react-hook-form hanya terunduh
// di halaman yang benar-benar menampilkannya, bukan di setiap halaman yang mengimpor berkas indeks ini.
export { ContactForm } from "./lazy-forms"; // Client: { defaultSubject?: ContactSubject }
export { BoardGrid } from "./board-grid";
export { Timeline } from "./timeline";
export { FacilitiesGrid } from "./facilities-grid";
export { CONTACT_SUBJECTS, isContactSubject, type ContactSubject } from "./contact-schema";
