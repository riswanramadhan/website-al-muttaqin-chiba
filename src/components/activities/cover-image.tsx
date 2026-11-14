import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { shouldSkipOptimization } from "@/lib/utils/media";

/**
 * Gambar sampul agenda/berita (rasio 16:9). Unggahan admin sudah dikompres di browser,
 * jadi ditampilkan tanpa Image Optimization agar hemat kuota Vercel.
 */
export function CoverImage({ src, alt, className, priority = true }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-3xl border border-border bg-surface", className)}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 48rem, 100vw" priority={priority} unoptimized={shouldSkipOptimization(src)} className="object-cover" />
    </div>
  );
}
