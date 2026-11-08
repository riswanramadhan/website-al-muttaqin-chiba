import type { Metadata } from "next";
import { ArrowRight, Quote } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { Link } from "@/i18n/navigation";
import { getAnnouncements, getEvents, getHadithOfTheDay, getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { APP_SCREENS } from "@/components/site/nav-config";
import { SCREEN_ICONS, SCREEN_TONES } from "@/components/app/screen-icons";
import { IconCircle } from "@/components/ui/primitives";
import { HijriDateBadge, JumuahCard, PrayerTodayCard } from "@/components/prayer";
import { AnnouncementList, LiveStatusBanner } from "@/components/activities";
import { DonateCta } from "@/components/donate";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineBadge } from "@/components/pwa/offline-badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return { title: t("title"), description: t("description") };
}

/** Beranda App Jamaah (PRD-07b). Jadwal dihitung di perangkat/server; konten lain dari cache SW saat offline. */
export default async function AppHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, tp, profile, announcements, hadith, nextKajian] = await Promise.all([
    getTranslations({ locale, namespace: "app" }),
    getTranslations({ locale, namespace: "pwa" }),
    getProfile(),
    getAnnouncements({ limit: 3 }),
    getHadithOfTheDay(),
    getEvents({ upcoming: true, category: "kajian", limit: 1 }),
  ]);
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || undefined;
  const next = nextKajian[0];
  const nextLecture = next ? { title: pick(next.title, locale), startsAt: next.startsAt, href: `/events/${next.slug}` } : undefined;

  return (
    <div className="space-y-6">
      <OfflineBadge />

      <section className="hero-surface rounded-3xl p-5" aria-labelledby="app-home-greeting">
        <p className="text-sm font-semibold text-hero-foreground/80">{t("greeting")}</p>
        <h1 id="app-home-greeting" className="mt-1 text-xl font-bold leading-snug">
          {pick(profile.name, locale)}
        </h1>
        <p className="mt-1 text-sm text-hero-foreground/70">{t("greetingSub")}</p>
        <HijriDateBadge locale={locale} withArabic tone="inverse" className="mt-4" />
      </section>

      <PrayerTodayCard locale={locale} variant="app" />

      <InstallPrompt />

      <nav aria-labelledby="app-home-shortcuts">
        <h2 id="app-home-shortcuts" className="sr-only">
          {tp("home.shortcuts")}
        </h2>
        <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
          {APP_SCREENS.slice(0, 8).map((s) => {
            const Icon = SCREEN_ICONS[s.key];
            return (
              <li key={s.key}>
                <Link href={s.href} className="group flex flex-col items-center gap-2 rounded-xl text-center text-[0.7rem] font-semibold">
                  <IconCircle tone="soft" shape="square" color={SCREEN_TONES[s.key]}>
                    {Icon ? <Icon /> : null}
                  </IconCircle>
                  <span className="line-clamp-2 leading-tight">{t(`screens.${s.key}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <JumuahCard locale={locale} compact />

      {(channelId || nextLecture) && (
        <section aria-labelledby="app-home-live" className="space-y-3">
          <h2 id="app-home-live" className="text-base font-bold">
            {tp("home.live")}
          </h2>
          <LiveStatusBanner channelId={channelId} locale={locale} nextLecture={nextLecture} channelUrl={profile.social.youtube} />
        </section>
      )}

      {announcements.length > 0 && (
        <section aria-labelledby="app-home-announcements" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="app-home-announcements" className="text-base font-bold">
              {tp("home.announcements")}
            </h2>
            <Link href="/app/info" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {tp("home.seeAll")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <AnnouncementList announcements={announcements} locale={locale} compact />
        </section>
      )}

      <section aria-labelledby="app-home-hadith" className="card-surface p-5">
        <div className="flex items-center gap-3">
          <IconCircle size="sm" tone="soft">
            <Quote />
          </IconCircle>
          <h2 id="app-home-hadith" className="text-base font-bold">
            {tp("home.hadith")}
          </h2>
        </div>
        {hadith.arabic && (
          <p lang="ar" dir="rtl" className="mt-4 font-arabic text-2xl leading-[2]">
            {hadith.arabic}
          </p>
        )}
        <blockquote className="mt-3 text-sm leading-relaxed">{pick(hadith.text, locale)}</blockquote>
        <p className="mt-2 text-xs text-muted-foreground">{hadith.source}</p>
      </section>

      <DonateCta locale={locale} />
    </div>
  );
}
