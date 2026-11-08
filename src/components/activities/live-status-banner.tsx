"use client";

import * as React from "react";
import { CalendarDays, ExternalLink, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { YouTubeEmbed, YouTubeLiveEmbed } from "@/components/ui/youtube-embed";
import { cn } from "@/lib/utils/cn";

export type LiveApiResponse = { live: boolean; videoId?: string; title?: string; reason?: string };

type LiveState =
  | { status: "checking" }
  | { status: "live"; videoId?: string; title?: string }
  | { status: "offline" }
  /** API key belum diatur: jatuh ke embed live_stream kanal. */
  | { status: "fallback" };

export type NextLecture = { title: string; startsAt: string; href: string };

/**
 * Banner status live YouTube. Dengan channelId: cek /api/live (cache 5 menit) dan
 * tampilkan embed bila sedang siaran; bila tidak, tampilkan kajian berikutnya dan
 * tautan kanal. Tanpa channelId: hanya kartu kajian berikutnya. Tanpa keduanya: null.
 */
export function LiveStatusBanner({
  channelId,
  locale,
  tone = "default",
  nextLecture,
  channelUrl,
  className,
}: {
  channelId?: string;
  locale: Locale;
  tone?: "default" | "inverse";
  nextLecture?: NextLecture;
  channelUrl?: string;
  className?: string;
}) {
  const t = useTranslations("live");
  const [state, setState] = React.useState<LiveState>(() => (channelId ? { status: "checking" } : { status: "offline" }));

  React.useEffect(() => {
    if (!channelId) return;
    const controller = new AbortController();
    fetch(`/api/live?channel=${encodeURIComponent(channelId)}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<LiveApiResponse>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data.live) setState({ status: "live", videoId: data.videoId, title: data.title });
        else if (data.reason === "no-api-key") setState({ status: "fallback" });
        else setState({ status: "offline" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "offline" });
      });
    return () => controller.abort();
  }, [channelId]);

  if (!channelId && !nextLecture) return null;

  const inverse = tone === "inverse";
  const resolvedChannelUrl = channelUrl ?? (channelId ? `https://www.youtube.com/channel/${channelId}` : undefined);
  const isLive = state.status === "live";

  return (
    <section
      aria-live="polite"
      className={cn("overflow-hidden rounded-3xl p-5 sm:p-6", inverse ? "hero-surface" : "card-surface", className)}
    >
      <div className="flex flex-wrap items-center gap-2">
        {isLive ? (
          <Badge variant={inverse ? "inverse" : "destructive"}>
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-current" />
            </span>
            {t("banner.liveNow")}
          </Badge>
        ) : (
          <Badge variant={inverse ? "inverse" : "outline"}>
            <Radio />
            {state.status === "checking" ? t("banner.checking") : t("banner.offlineTitle")}
          </Badge>
        )}
      </div>

      {isLive && (
        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{state.title ?? t("banner.liveTitle")}</h2>
            <p className={cn("mt-1 text-sm", inverse ? "text-hero-muted" : "text-muted-foreground")}>{t("banner.liveDescription")}</p>
          </div>
          {state.videoId ? (
            <YouTubeEmbed videoId={state.videoId} title={state.title ?? t("banner.streamTitle")} />
          ) : channelId ? (
            <YouTubeLiveEmbed channelId={channelId} title={t("banner.streamTitle")} />
          ) : null}
          <a
            href={state.videoId ? `https://www.youtube.com/watch?v=${state.videoId}` : resolvedChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: inverse ? "inverse" : "primary", size: "sm" })}
          >
            <ExternalLink />
            {t("banner.watchOnYouTube")}
          </a>
        </div>
      )}

      {state.status === "fallback" && channelId && (
        <div className="mt-4 space-y-3">
          <YouTubeLiveEmbed channelId={channelId} title={t("banner.streamTitle")} />
          <p className={cn("text-xs", inverse ? "text-hero-muted" : "text-muted-foreground")}>{t("banner.streamHint")}</p>
        </div>
      )}

      {!isLive && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-3">
            <IconCircle tone={inverse ? "inverse" : "soft"} size="sm" className="mt-0.5">
              <CalendarDays />
            </IconCircle>
            <div className="min-w-0">
              <p className={cn("text-xs font-semibold tracking-wide uppercase", inverse ? "text-hero-muted" : "text-muted-foreground")}>{t("banner.nextLecture")}</p>
              {nextLecture ? (
                <>
                  <Link href={nextLecture.href} className="mt-0.5 block font-bold leading-snug hover:text-brand">
                    {nextLecture.title}
                  </Link>
                  <p className={cn("mt-0.5 text-sm tabular", inverse ? "text-hero-muted" : "text-muted-foreground")}>{formatDateTime(nextLecture.startsAt, locale)} JST</p>
                </>
              ) : (
                <p className={cn("mt-0.5 text-sm", inverse ? "text-hero-muted" : "text-muted-foreground")}>{t("banner.noSchedule")}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {nextLecture && (
              <Link href={nextLecture.href} className={buttonVariants({ variant: inverse ? "inverse" : "primary", size: "sm" })}>
                {t("banner.viewEvent")}
              </Link>
            )}
            {resolvedChannelUrl && (
              <a href={resolvedChannelUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: inverse ? "outlineInverse" : "outline", size: "sm" })}>
                <ExternalLink />
                {t("banner.openChannel")}
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
