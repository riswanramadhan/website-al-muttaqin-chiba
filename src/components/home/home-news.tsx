import { getTranslations } from "next-intl/server";
import { ArrowRight, Megaphone, Newspaper } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAnnouncements, getNews } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnnouncementList, NewsCard } from "@/components/activities";
import { HomeSection } from "./home-section";

/** Berita & pengumuman (PRD-03b §10): tiga berita terbaru dan tiga pengumuman ringkas. */
export async function HomeNews({ locale }: { locale: Locale }) {
  const [t, posts, announcements] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getNews({ limit: 3 }),
    getAnnouncements(),
  ]);
  // Pengumuman tersemat sudah tampil di bawah hero; di sini utamakan yang belum tersemat.
  const unpinned = announcements.filter((a) => !a.pinned);
  const latest = (unpinned.length > 0 ? unpinned : announcements).slice(0, 3);

  return (
    <HomeSection id="news">
      <SectionHeading
        tag={t("news.tag")}
        title={t("news.title")}
        highlight={t("news.highlight")}
        description={t("news.description")}
        action={
          <Link href="/news" className={buttonVariants({ variant: "outline" })}>
            {t("news.seeAll")}
            <ArrowRight />
          </Link>
        }
      />
      {posts.length === 0 ? (
        <EmptyState className="mt-10" icon={<Newspaper />} title={t("news.empty")} />
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <li key={post.id} className={i === 2 ? "md:hidden lg:block" : undefined}>
              <NewsCard post={post} locale={locale} />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Megaphone className="size-5 text-brand" aria-hidden />
            {t("news.announcementsTitle")}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("news.announcementsDescription")}</p>
        </div>
        <div className="lg:col-span-8">
          <AnnouncementList announcements={latest} locale={locale} compact />
        </div>
      </div>
    </HomeSection>
  );
}
