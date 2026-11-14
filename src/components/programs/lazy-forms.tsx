"use client";

import dynamic from "next/dynamic";

/**
 * Formulir modul program dimuat sebagai potongan terpisah: zod + react-hook-form hanya terunduh di
 * halaman yang menampilkannya, bukan di setiap halaman yang mengimpor indeks modul ini. Tetap SSR.
 */
export const HelpCenter = dynamic(() => import("./help-center").then((m) => m.HelpCenter));
export const SuggestionForm = dynamic(() => import("./suggestion-form").then((m) => m.SuggestionForm));
export const ProgramRegistrationForm = dynamic(() => import("./program-registration-form").then((m) => m.ProgramRegistrationForm));
export const BookingForm = dynamic(() => import("./booking-form").then((m) => m.BookingForm));
