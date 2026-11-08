import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getAnnouncements, getNews } from "@/lib/data";
import { SectionHeading } from "@/components/ui/section-heading";
import { NewsBrowser } from "@/components/activities";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, announcements, posts] = await Promise.all([getTranslations({ locale, namespace: "news" }), getAnnouncements(), getNews()]);

  return (
    <div className="container-site py-12 lg:py-16">
      <SectionHeading as="h1" tag={t("tag")} title={t("title")} highlight={t("highlight")} description={t("description")} />
      <div className="mt-10">
        <NewsBrowser announcements={announcements} posts={posts} locale={locale} />
      </div>
    </div>
  );
}
