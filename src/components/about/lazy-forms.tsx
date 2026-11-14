"use client";

import dynamic from "next/dynamic";

/**
 * Formulir dimuat sebagai potongan terpisah: zod + react-hook-form hanya terunduh di halaman yang
 * benar-benar menampilkan formulirnya, bukan di setiap halaman yang mengimpor indeks modul ini.
 * Tetap dirender di server (SSR), jadi tidak ada perubahan tampilan.
 */
export const ContactForm = dynamic(() => import("./contact-form").then((m) => m.ContactForm));
