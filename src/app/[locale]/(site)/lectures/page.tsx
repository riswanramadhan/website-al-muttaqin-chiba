import type { Metadata } from "next";
import { ExternalLink, FolderOpen, Tv } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getEvents, getLectures, getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionTag } from "@/components/ui/section-tag";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { LectureBrowser, LiveStatusBanner } from "@/components/activities";

const CHANNEL_KEYS = ["1", "2", "3"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lectures" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function LecturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, tc, lectures, nextKajian, profile] = await Promise.all([
    getTranslations({ locale, namespace: "lectures" }),
    getTranslations({ locale, namespace: "common" }),
    getLectures(),
    getEvents({ upcoming: true, category: "kajian", limit: 1 }),
    getProfile(),
  ]);
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || undefined;
  const next = nextKajian[0];
  const nextLecture = next ? { title: pick(next.title, locale), startsAt: next.startsAt, href: `/events/${next.slug}` } : undefined;

  return (
    <div className="container-site space-y-14 py-12 lg:space-y-20 lg:py-16">
      <SectionHeading as="h1" tag={t("tag")} title={t("title")} highlight={t("highlight")} description={t("description")} />

      <LiveStatusBanner channelId={channelId} locale={locale} tone="inverse" nextLecture={nextLecture} channelUrl={profile.social.youtube} />

      <section aria-labelledby="lectures-list">
        <h2 id="lectures-list" className="sr-only">
          {t("meta.title")}
        </h2>
        <LectureBrowser lectures={lectures} locale={locale} />
      </section>

      <section aria-labelledby="lectures-channels">
        <SectionHeading tag={t("channels.tag")} title={t("channels.title")} highlight={t("channels.highlight")} description={t("channels.description")} />
        <h2 id="lectures-channels" className="sr-only">
          {t("channels.tag")}
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHANNEL_KEYS.map((key) => (
            <li key={key}>
              <a href={t(`channels.items.${key}.url`)} target="_blank" rel="noopener noreferrer" className="card-surface lift flex h-full flex-col gap-4 p-5">
                <IconCircle tone="soft" shape="square">
                  <Tv />
                </IconCircle>
                <div className="flex-1">
                  <h3 className="font-bold">{t(`channels.items.${key}.name`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t(`channels.items.${key}.description`)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <ExternalLink className="size-4" aria-hidden />
                  {t("channels.visit")}
                  <span className="sr-only">({tc("a11y.externalLink")})</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="lectures-materials" className="card-muted flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <IconCircle tone="brand" size="lg">
            <FolderOpen />
          </IconCircle>
          <div>
            <SectionTag>{t("materials.tag")}</SectionTag>
            <h2 id="lectures-materials" className="mt-3 text-xl font-bold sm:text-2xl">
              {t("materials.title")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("materials.description")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("materials.note")}</p>
          </div>
        </div>
        <a href={t("materials.url")} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className: "shrink-0" })}>
          <ExternalLink />
          {t("materials.cta")}
        </a>
      </section>
    </div>
  );
}
