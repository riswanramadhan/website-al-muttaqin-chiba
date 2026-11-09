"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Poster = "maxresdefault" | "hqdefault";

/**
 * Pemutar video dokumenter: poster besar 16:9 (maxresdefault, jatuh ke hqdefault bila tidak ada),
 * tombol putar besar, dan iframe youtube-nocookie yang baru dimuat setelah diklik.
 */
export function DocumentaryPlayer({
  videoId,
  title,
  playLabel,
  duration,
  className,
}: {
  videoId: string;
  title: string;
  playLabel: string;
  duration?: string;
  className?: string;
}) {
  const [active, setActive] = React.useState(false);
  const [poster, setPoster] = React.useState<Poster>("maxresdefault");
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  function fallback() {
    if (poster !== "hqdefault") setPoster("hqdefault");
  }

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-3xl bg-hero shadow-soft ring-1 ring-border", className)}>
      {active ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 size-full cursor-pointer text-left" aria-label={`${playLabel}: ${title} (YouTube)`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/${poster}.jpg`}
            alt=""
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            onError={fallback}
            onLoad={(e) => {
              // YouTube mengirim gambar abu 120x90 bila maxresdefault belum tersedia.
              if (e.currentTarget.naturalWidth <= 120) fallback();
            }}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-hero/85 via-hero/20 to-hero/10" aria-hidden />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
            <span className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-ping" />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft ring-4 ring-hero-foreground/20 transition-transform group-hover:scale-105 sm:size-20 lg:size-24">
              <Play className="ml-1 size-7 fill-current sm:size-8 lg:size-9" />
            </span>
          </span>
          <span className="absolute inset-x-4 bottom-4 flex flex-col gap-2 sm:inset-x-6 sm:bottom-6" aria-hidden>
            <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-hero-foreground">
              <span className="rounded-full bg-hero/70 px-2.5 py-0.5">YouTube</span>
              {duration && <span className="tabular rounded-full bg-hero/70 px-2.5 py-0.5">{duration}</span>}
            </span>
            <span className="line-clamp-2 max-w-2xl text-sm leading-snug font-semibold text-hero-foreground sm:text-base">{title}</span>
          </span>
        </button>
      )}
    </div>
  );
}
