import Image from "next/image";
import { Clock, Mic, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Lecture, Locale } from "@/lib/types";
import { formatDate, pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";

export function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Kartu kajian dengan thumbnail YouTube, durasi, pemateri, dan tanggal.
 * Sinkron sehingga bisa dirender dari Server Component maupun LectureBrowser (klien).
 */
export function LectureCard({ lecture, locale }: { lecture: Lecture; locale: Locale }) {
  const t = useTranslations("lectures");
  const title = pick(lecture.title, locale);

  return (
    <Link href={`/lectures/${lecture.slug}`} className="card-surface lift group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-hero">
        <Image
          src={youtubeThumbnail(lecture.youtubeId)}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-hero/60 to-transparent" aria-hidden />
        <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-90 shadow-soft transition-transform group-hover:scale-105" aria-hidden>
          <Play className="ml-0.5 size-5 fill-current" />
        </span>
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-hero/80 px-2 py-0.5 text-xs font-semibold text-hero-foreground tabular">
          <Clock className="size-3" aria-hidden />
          {t("card.duration", { count: lecture.durationMinutes })}
        </span>
        <Badge variant="inverse" className="absolute top-3 left-3">
          {t(`languages.${lecture.language}`)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {lecture.series && <p className="text-brand text-xs font-semibold tracking-wide uppercase">{pick(lecture.series, locale)}</p>}
        <h3 className="mt-1 line-clamp-2 text-base leading-snug font-bold group-hover:text-brand sm:text-lg">{title}</h3>
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Mic className="size-3.5" aria-hidden />
            {lecture.speaker}
          </span>
          <time dateTime={lecture.publishedAt}>{formatDate(lecture.publishedAt, locale, { year: "numeric", month: "short", day: "numeric" })}</time>
        </p>
      </div>
    </Link>
  );
}
