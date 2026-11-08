import { notFound } from "next/navigation";

/** Tangkap semua rute yang tidak dikenal di bawah locale agar not-found.tsx locale dipakai. */
export default function CatchAllPage() {
  notFound();
}
