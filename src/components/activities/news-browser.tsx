"use client";

import { Newspaper } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Announcement, Locale, NewsPost } from "@/lib/types";
import { EmptyState } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementItem } from "@/components/activities/announcement-list";
import { NewsCard } from "@/components/activities/news-card";

type FeedItem = { kind: "announcement"; item: Announcement } | { kind: "post"; item: NewsPost };

/**
 * Tab Semua / Pengumuman / Berita / Laporan. Di tab "Semua", pengumuman tersemat
 * tampil paling atas, lalu gabungan pengumuman dan berita urut tanggal.
 */
export function NewsBrowser({ announcements, posts, locale }: { announcements: Announcement[]; posts: NewsPost[]; locale: Locale }) {
  const t = useTranslations("news");
  const pinned = announcements.filter((a) => a.pinned);
  const rest: FeedItem[] = [
    ...announcements.filter((a) => !a.pinned).map((item): FeedItem => ({ kind: "announcement", item })),
    ...posts.map((item): FeedItem => ({ kind: "post", item })),
  ].sort((a, b) => b.item.publishedAt.localeCompare(a.item.publishedAt));
  const reports = posts.filter((p) => p.category === "report");
  const newsOnly = posts.filter((p) => p.category !== "report");

  const renderPosts = (list: NewsPost[]) =>
    list.length === 0 ? (
      <EmptyState icon={<Newspaper />} title={t("labels.empty")} />
    ) : (
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.id}>
            <NewsCard post={p} locale={locale} />
          </li>
        ))}
      </ul>
    );

  return (
    <Tabs defaultValue="all">
      <TabsList aria-label={t("tag")} className="max-w-full overflow-x-auto">
        <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
        <TabsTrigger value="announcements">{t("tabs.announcements")}</TabsTrigger>
        <TabsTrigger value="news">{t("tabs.news")}</TabsTrigger>
        <TabsTrigger value="reports">{t("tabs.reports")}</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-8">
        {pinned.length > 0 && (
          <ul className="grid gap-3">
            {pinned.map((a) => (
              <AnnouncementItem key={a.id} announcement={a} locale={locale} />
            ))}
          </ul>
        )}
        {rest.length === 0 && pinned.length === 0 ? (
          <EmptyState icon={<Newspaper />} title={t("labels.empty")} />
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((entry) =>
              entry.kind === "post" ? (
                <li key={`p-${entry.item.id}`}>
                  <NewsCard post={entry.item} locale={locale} />
                </li>
              ) : (
                <AnnouncementItem key={`a-${entry.item.id}`} announcement={entry.item} locale={locale} />
              ),
            )}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="announcements">
        {announcements.length === 0 ? (
          <EmptyState icon={<Newspaper />} title={t("labels.empty")} />
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {[...pinned, ...announcements.filter((a) => !a.pinned)].map((a) => (
              <AnnouncementItem key={a.id} announcement={a} locale={locale} />
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="news">{renderPosts(newsOnly)}</TabsContent>
      <TabsContent value="reports">{renderPosts(reports)}</TabsContent>
    </Tabs>
  );
}
