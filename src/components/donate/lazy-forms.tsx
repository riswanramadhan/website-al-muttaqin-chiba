"use client";

import dynamic from "next/dynamic";

/**
 * Alur donasi dan formulir donatur tetap dimuat sebagai potongan terpisah: zod + react-hook-form
 * hanya terunduh di halaman Donasi, bukan di setiap halaman yang mengimpor indeks modul ini. Tetap SSR.
 */
export const DonationFlow = dynamic(() => import("./donation-flow").then((m) => m.DonationFlow));
export const RecurringDonorForm = dynamic(() => import("./recurring-donor-form").then((m) => m.RecurringDonorForm));
