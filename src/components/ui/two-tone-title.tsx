import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Judul besar dengan bagian akhir berwarna merah (PRD §8):
 * <TwoToneTitle text="Masjid dan rumah belajar di Matsudo, Chiba." highlight="Matsudo, Chiba." />
 * Jika `highlight` tidak ditemukan dalam `text`, seluruh teks ditampilkan normal.
 */
export function TwoToneTitle({
  text,
  highlight,
  as: Tag = "h2",
  className,
  highlightClassName,
}: {
  text: string;
  highlight?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  highlightClassName?: string;
}) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || index < 0) {
    return <Tag className={cn("headline", className)}>{text}</Tag>;
  }
  const before = text.slice(0, index);
  const after = text.slice(index + highlight.length);
  return (
    <Tag className={cn("headline", className)}>
      {before}
      <span className={cn("text-brand", highlightClassName)}>{highlight}</span>
      {after}
    </Tag>
  );
}
