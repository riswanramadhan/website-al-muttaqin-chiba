import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getEvents, getLectures, getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { AppScreenHeader } from "@/components/app/shell";
import { buttonVariants } from "@/components/ui/button";
import { AppLectureList, LiveStatusBanner } from "@/components/activities";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "live" });
  return { title: t("app.title"), description: t("app.description") };
}

export default async function AppLivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, lectures, nextKajian, profile] = await Promise.all([
    getTranslations({ locale, namespace: "live" }),
    getTranslations({ locale, namespace: "app" }),
    getLectures({ limit: 5 }),
    getEvents({ upcoming: true, category: "kajian", limit: 1 }),
    getProfile(),
  ]);
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || undefined;
  const next = nextKajian[0];
  const nextLecture = next ? { title: pick(next.title, locale), startsAt: next.startsAt, href: `/events/${next.slug}` } : undefined;

  return (
    <div>
      <AppScreenHeader title={t("app.title")} description={t("app.description")} backLabel={ta("back")} />
      <LiveStatusBanner channelId={channelId} locale={locale} tone="inverse" nextLecture={nextLecture} channelUrl={profile.social.youtube} />

      <section className="mt-6" aria-labelledby="app-live-latest">
        <h2 id="app-live-latest" className="text-base font-bold">
          {t("app.latest")}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{t("app.latestDescription")}</p>
        <div className="mt-3">
          <AppLectureList lectures={lectures} locale={locale} />
        </div>
        <Link href="/lectures" className={buttonVariants({ variant: "outline", size: "md", className: "mt-4 w-full" })}>
          {t("app.allLectures")}
          <ArrowRight />
        </Link>
      </section>
    </div>
  );
}
