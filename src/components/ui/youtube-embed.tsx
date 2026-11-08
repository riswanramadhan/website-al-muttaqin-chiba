"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Embed YouTube ringan: tampilkan thumbnail dulu, muat iframe hanya saat diklik
 * (hemat data dan bagus untuk Lighthouse).
 */
export function YouTubeEmbed({ videoId, title, className, autoplayOnClick = true }: { videoId: string; title: string; className?: string; autoplayOnClick?: boolean }) {
  const [active, setActive] = React.useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoplayOnClick ? "&autoplay=1" : ""}`;

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl bg-hero", className)}>
      {active ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 size-full" aria-label={`${title} (YouTube)`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100" loading="lazy" />
          <span className="absolute inset-0 bg-gradient-to-t from-hero/70 to-transparent" />
          <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
            <Play className="ml-1 size-7 fill-current" />
          </span>
          <span className="absolute inset-x-4 bottom-4 text-left text-sm font-semibold text-hero-foreground">{title}</span>
        </button>
      )}
    </div>
  );
}

/** Embed siaran langsung kanal (tanpa API key). */
export function YouTubeLiveEmbed({ channelId, title, className }: { channelId: string; title: string; className?: string }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl bg-hero", className)}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&rel=0`}
        title={title}
        className="absolute inset-0 size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
