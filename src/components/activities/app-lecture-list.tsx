"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Lecture, Locale } from "@/lib/types";
import { formatDate, pick } from "@/lib/utils/i18n";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { youtubeThumbnail } from "@/components/activities/lecture-card";
import { cn } from "@/lib/utils/cn";

/** Daftar kajian ringkas untuk App: ketuk untuk memutar embed di tempat, atau buka detail web. */
export function AppLectureList({ lectures, locale }: { lectures: Lecture[]; locale: Locale }) {
  const t = useTranslations("live");
  const tl = useTranslations("lectures");
  const [activeId, setActiveId] = React.useState<string | null>(null);

  if (lectures.length === 0) {
    return <p className="card-muted p-6 text-center text-sm text-muted-foreground">{t("app.empty")}</p>;
  }

  return (
    <ul className="grid gap-3">
      {lectures.map((l) => {
        const active = activeId === l.id;
        const title = pick(l.title, locale);
        return (
          <li key={l.id} className="card-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveId(active ? null : l.id)}
              aria-expanded={active}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-hero">
                <Image src={youtubeThumbnail(l.youtubeId)} alt="" fill sizes="96px" className="object-cover" />
                {!active && (
                  <span className="absolute inset-0 flex items-center justify-center bg-hero/30 text-hero-foreground" aria-hidden>
                    <Play className="size-4 fill-current" />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm leading-snug font-semibold">{title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {l.speaker} · {formatDate(l.publishedAt, locale, { month: "short", day: "numeric" })} · {tl("card.duration", { count: l.durationMinutes })}
                </span>
              </span>
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", active && "rotate-180")} aria-hidden />
            </button>
            {active && (
              <div className="space-y-3 px-3 pb-3">
                <YouTubeEmbed videoId={l.youtubeId} title={title} className="rounded-xl" />
                <Link href={`/lectures/${l.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <ExternalLink className="size-3.5" aria-hidden />
                  {t("app.openInWeb")}
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
