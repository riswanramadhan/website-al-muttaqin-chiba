"use client";

import { Type } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ARABIC_SIZE_CLASS, useArabicSize, type ArabicSize } from "./storage";

const SIZES: ArabicSize[] = ["sm", "md", "lg"];

/** Pengalih ukuran teks Arab (kecil/sedang/besar), tersimpan di localStorage `acc-arabic-size`. */
export function ArabicSizeControl({ labels, className }: { labels: { label: string; sm: string; md: string; lg: string }; className?: string }) {
  const [size, setSize] = useArabicSize();
  return (
    <div role="group" aria-label={labels.label} className={cn("inline-flex h-9 items-center gap-1 rounded-full bg-surface p-1", className)}>
      <Type className="ml-2 size-4 text-muted-foreground" aria-hidden />
      {SIZES.map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={size === s}
          onClick={() => setSize(s)}
          className={cn(
            "h-7 rounded-full px-3 text-xs font-semibold transition-colors",
            size === s ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {labels[s]}
        </button>
      ))}
    </div>
  );
}

export function useArabicSizeClass(): string {
  const [size] = useArabicSize();
  return ARABIC_SIZE_CLASS[size];
}
