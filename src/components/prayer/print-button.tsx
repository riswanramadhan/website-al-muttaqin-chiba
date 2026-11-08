"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Tombol cetak jadwal bulanan; gaya `print:` di halaman menyembunyikan bagian lain. */
export function PrintButton({ label, className }: { label: string; className?: string }) {
  return (
    <Button variant="outline" size="sm" className={className} onClick={() => window.print()}>
      <Printer />
      {label}
    </Button>
  );
}
