import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Megaphone, Pin, Tag } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Announcement, Locale, NewsPost } from "@/lib/types";
import { getAnnouncementBySlug, getAnnouncements, getNews, getNewsBySlug } from "@/lib/data";
import { formatDate, pick, pickBlocks } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnnouncementList, NewsCard, ShareButton } from "@/components/activities";

/** Apakah instant ISO sudah lewat (di luar komponen agar render tetap murni). */
function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

type Entry = { kind: "announcement"; item: Announcement } | { kind: "post"; item: NewsPost };

async function findEntry(slug: string): Promise<Entry | undefined> {
  const announcement = await getAnnouncementBySlug(slug);
  if (announcement) return { kind: "announcement", item: announcement };
  const post = await getNewsBySlug(slug);
  if (post) return { kind: "post", item: post };
  return undefined;
}

export async function generateStaticParams() {
  const [announcements, posts] = await Promise.all([getAnnouncements({ includeExpired: true }), getNews()]);
  const slugs = [...announcements.map((a) => a.slug), ...posts.map((p) => p.slug)];
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = await findEntry(slug);
  if (!entry) return {};
  return { title: pick(entry.item.title, locale as Locale), description: pick(entry.item.excerpt, locale as Locale) };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const entry = await findEntry(slug);
  if (!entry) notFound();

  const [t, tc] = await Promise.all([getTranslations({ locale, namespace: "news" }), getTranslations({ locale, namespace: "common" })]);
  const { item } = entry;
  const title = pick(item.title, locale);
  const isAnnouncement = entry.kind === "announcement";
  const expired = isAnnouncement && entry.item.expiresAt !== undefined && isPast(entry.item.expiresAt);

  const relatedAnnouncements = isAnnouncement ? (await getAnnouncements({ limit: 4 })).filter((a) => a.id !== item.id).slice(0, 3) : [];
  const relatedPosts = !isAnnouncement ? (await getNews({ category: entry.item.category })).filter((p) => p.id !== item.id).slice(0, 3) : [];

  return (
    <div className="container-site py-12 lg:py-16">
      <Link href="/news" className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-3" })}>
        <ArrowLeft />
        {t("labels.back")}
      </Link>

      <article className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          {isAnnouncement ? (
            <>
              <Badge variant="brand">
                <Megaphone />
                {t("labels.announcement")}
              </Badge>
              {entry.item.pinned && (
                <Badge variant="soft">
                  <Pin />
                  {t("labels.pinned")}
                </Badge>
              )}
              <Badge variant={entry.item.category === "urgent" ? "warning" : "outline"}>{tc(`categories.${entry.item.category}`)}</Badge>
              {expired && <Badge variant="outline">{t("labels.expired")}</Badge>}
            </>
          ) : (
            <Badge variant="soft">{tc(`categories.${entry.item.category}`)}</Badge>
          )}
        </div>
        <h1 className="headline mt-4 text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{pick(item.excerpt, locale)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <time dateTime={item.publishedAt}>{t("labels.published", { date: formatDate(item.publishedAt, locale) })}</time>
          {!isAnnouncement && <span>{t("labels.author", { name: entry.item.author })}</span>}
          <ShareButton title={title} text={pick(item.excerpt, locale)} url={`/${locale}/news/${item.slug}`} label={t("labels.share")} variant="ghost" size="sm" className="-my-2" />
        </div>

        <RichText blocks={pickBlocks(item.body, locale)} className="mt-8" />

        {!isAnnouncement && entry.item.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-6">
            <li className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Tag className="size-3.5" aria-hidden />
            </li>
            {entry.item.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline">{tag}</Badge>
              </li>
            ))}
          </ul>
        )}
      </article>

      {(relatedAnnouncements.length > 0 || relatedPosts.length > 0) && (
        <section className="mt-16" aria-labelledby="news-related">
          <SectionHeading as="h2" title={t("labels.related")} description={t("labels.relatedDescription")} />
          <h2 id="news-related" className="sr-only">
            {t("labels.related")}
          </h2>
          <div className="mt-8">
            {isAnnouncement ? (
              <AnnouncementList announcements={relatedAnnouncements} locale={locale} className="lg:grid-cols-3" />
            ) : (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((p) => (
                  <li key={p.id}>
                    <NewsCard post={p} locale={locale} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
