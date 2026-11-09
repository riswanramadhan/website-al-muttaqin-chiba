import { getTranslations } from "next-intl/server";
import { CalendarDays, Clock, ExternalLink, Tv } from "lucide-react";
import { getDocumentary } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { formatDate } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { DocumentaryPlayer } from "./documentary-player";
import { HomeSection } from "./home-section";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Blok video dokumenter Al Muttaqin: judul dua warna, deskripsi, info video, dan pemutar 16:9.
 * tone="dark" untuk latar hero-surface (beranda), "default" untuk latar terang (Tentang kami).
 * Teks dari namespace `about` (kunci `documentary.*`).
 */
export async function DocumentaryFeature({ locale, tone = "default", className }: { locale: Locale; tone?: "default" | "dark"; className?: string }) {
  const [t, tc, video] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "common" }),
    getDocumentary(),
  ]);
  const inverse = tone === "dark";
  const duration = formatDuration(video.durationSeconds);
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <div className={cn("grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14", className)}>
      <div className="lg:col-span-5">
        <SectionHeading
          tag={t("documentary.tag")}
          title={t("documentary.title")}
          highlight={t("documentary.highlight")}
          description={t("documentary.description")}
          tone={inverse ? "inverse" : "default"}
        />
        <dl className={cn("mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2", inverse ? "text-hero-muted" : "text-muted-foreground")}>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" aria-hidden />
            <dt className="sr-only">{t("documentary.duration")}</dt>
            <dd className="tabular">{duration}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            <dt className="sr-only">{t("documentary.published")}</dt>
            <dd>
              <time dateTime={video.publishedAt}>{formatDate(video.publishedAt, locale, { year: "numeric", month: "long", day: "numeric" })}</time>
            </dd>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Tv className="size-4 shrink-0" aria-hidden />
            <dt className="sr-only">{t("documentary.channel")}</dt>
            <dd>
              <a href={video.channelUrl} target="_blank" rel="noopener noreferrer" className={cn("font-semibold underline-offset-4 hover:underline", inverse ? "text-hero-foreground" : "text-brand")}>
                {video.channelName}
                <span className="sr-only"> ({tc("a11y.externalLink")})</span>
              </a>
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={watchUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: inverse ? "inverse" : "primary" })}>
            <ExternalLink />
            {t("documentary.watchOnYoutube")}
            <span className="sr-only">({tc("a11y.externalLink")})</span>
          </a>
        </div>
      </div>
      <div className="lg:col-span-7">
        <DocumentaryPlayer videoId={video.youtubeId} title={video.title} playLabel={t("documentary.play")} duration={duration} />
      </div>
    </div>
  );
}

/** Section beranda: dokumenter Al Muttaqin di latar gelap berpola. */
export async function HomeDocumentary({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "about" });
  return (
    <HomeSection id="documentary" tone="dark" label={t("documentary.tag")}>
      <DocumentaryFeature locale={locale} tone="dark" />
    </HomeSection>
  );
}
