import type { ObligatoryPrayer } from "@/lib/types";

/**
 * Bentuk pesan push pengingat yang dipakai bersama server (/api/push/send), service worker
 * (src/app/sw.ts), dan halaman App. Sengaja tanpa impor runtime agar bundel SW tetap kecil.
 */
export type ReminderPushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  kind?: "adhan" | "iqamah" | "jumuah" | "broadcast" | "test";
  prayer?: ObligatoryPrayer;
  /** Waktu kejadian (ISO UTC). */
  at?: string;
  /** Label tombol aksi notifikasi dalam bahasa pelanggan. */
  actions?: { open: string; dismiss: string };
};

/** Pesan service worker ke jendela App yang terbuka saat push pengingat tiba. */
export const SW_REMINDER_MESSAGE = "acc-reminder";
export type SwReminderMessage = { type: typeof SW_REMINDER_MESSAGE; payload: ReminderPushPayload };
