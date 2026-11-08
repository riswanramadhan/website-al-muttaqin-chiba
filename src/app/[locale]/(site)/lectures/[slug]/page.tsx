import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, Languages, Mic, Tag } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { getLectureBySlug, getLectures, getProfile } from "@/lib/data";
import { formatDate, pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { LectureCard, ShareButton } from "@/components/activities";

export async function generateStaticParams() {
  const lectures = await getLectures();
  return routing.locales.flatMap((locale) => lectures.map((l) => ({ locale, slug: l.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const lecture = await getLectureBySlug(slug);
  if (!lecture) return {};
  const title = pick(lecture.title, locale as Locale);
  return {
    title,
    description: pick(lecture.description, locale as Locale),
    openGraph: { title, images: [{ url: `https://i.ytimg.com/vi/${lecture.youtubeId}/hqdefault.jpg` }] },
  };
}

export default async function LectureDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const lecture = await getLectureBySlug(slug);
  if (!lecture) notFound();

  const [t, tc, all, profile] = await Promise.all([
    getTranslations({ locale, namespace: "lectures" }),
    getTranslations({ locale, namespace: "common" }),
    getLectures(),
    getProfile(),
  ]);
  const title = pick(lecture.title, locale);
  const related = all
    .filter((l) => l.id !== lecture.id)
    .map((l) => ({ l, score: (l.series && lecture.series && l.series.en === lecture.series.en ? 2 : 0) + l.tags.filter((tag) => lecture.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score || b.l.publishedAt.localeCompare(a.l.publishedAt))
    .slice(0, 3)
    .map((x) => x.l);

  return (
    <div className="container-site py-12 lg:py-16">
      <Link href="/lectures" className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-3" })}>
        <ArrowLeft />
        {t("detail.back")}
      </Link>

      <article className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <YouTubeEmbed videoId={lecture.youtubeId} title={title} />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="soft">{t(`languages.${lecture.language}`)}</Badge>
            {lecture.series && <Badge variant="outline">{pick(lecture.series, locale)}</Badge>}
          </div>
          <h1 className="headline mt-4 text-3xl sm:text-4xl">{title}</h1>
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mic className="size-4" aria-hidden />
              <dt className="sr-only">{t("detail.speaker")}</dt>
              <dd>{lecture.speaker}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              <dt className="sr-only">{t("detail.duration")}</dt>
              <dd>{tc("labels.minutes", { count: lecture.durationMinutes })}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>{t("detail.published")}:</dt>
              <dd>
                <time dateTime={lecture.publishedAt}>{formatDate(lecture.publishedAt, locale)}</time>
              </dd>
            </div>
          </dl>

          <section className="mt-8" aria-labelledby="lecture-about">
            <h2 id="lecture-about" className="text-xl font-bold">
              {t("detail.about")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/90">{pick(lecture.description, locale)}</p>
          </section>

          {lecture.tags.length > 0 && (
            <section className="mt-8" aria-labelledby="lecture-tags">
              <h2 id="lecture-tags" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Tag className="size-4" aria-hidden />
                {t("detail.tags")}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {lecture.tags.map((tag) => (
                  <li key={tag}>
                    <Badge variant="outline">{tag}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-5">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.speaker")}</dt>
                <dd className="mt-0.5 font-semibold">{lecture.speaker}</dd>
              </div>
              {lecture.series && (
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.series")}</dt>
                  <dd className="mt-0.5 font-semibold">{pick(lecture.series, locale)}</dd>
                </div>
              )}
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <Languages className="size-3.5" aria-hidden />
                  {t("detail.language")}
                </dt>
                <dd className="mt-0.5 font-semibold">{t(`languages.${lecture.language}`)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              <a href={`https://www.youtube.com/watch?v=${lecture.youtubeId}`} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "md" })}>
                <ExternalLink />
                {t("detail.watchOnYouTube")}
              </a>
              {profile.social.youtube && (
                <a href={profile.social.youtube} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "md" })}>
                  {t("detail.openChannel")}
                </a>
              )}
              <ShareButton title={title} text={pick(lecture.description, locale)} url={`/${locale}/lectures/${lecture.slug}`} label={t("detail.share")} size="md" variant="soft" />
            </div>
          </div>
        </aside>
      </article>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="lecture-related">
          <SectionHeading as="h2" title={t("detail.related")} description={t("detail.relatedDescription")} />
          <h2 id="lecture-related" className="sr-only">
            {t("detail.related")}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((l) => (
              <li key={l.id}>
                <LectureCard lecture={l} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
