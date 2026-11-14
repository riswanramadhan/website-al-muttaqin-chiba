"use client";

import dynamic from "next/dynamic";

/**
 * Formulir pendaftaran agenda dimuat sebagai potongan terpisah: zod + react-hook-form hanya terunduh
 * di halaman detail agenda, bukan di setiap halaman yang mengimpor indeks modul ini. Tetap SSR.
 */
export const EventRegistrationForm = dynamic(() => import("./event-registration-form").then((m) => m.EventRegistrationForm));
