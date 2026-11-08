"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Tombol "cetak ringkasan": memanggil window.print(); disembunyikan saat mencetak. */
export function PrintButton({ label, className, ...props }: { label: string } & Omit<ButtonProps, "onClick" | "children">) {
  return (
    <Button onClick={() => window.print()} className={className ? `print:hidden ${className}` : "print:hidden"} {...props}>
      <Printer />
      {label}
    </Button>
  );
}
