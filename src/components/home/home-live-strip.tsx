import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAnnouncements, getEvents, getProfile } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { AnnouncementList, LiveStatusBanner } from "@/components/activities";

/**
 * Strip di bawah hero: status siaran langsung YouTube (atau kajian berikutnya) dan pengumuman tersemat.
 * Tidak merender apa pun bila keduanya kosong.
 */
export async function HomeLiveStrip({ locale }: { locale: Locale }) {
  const [t, profile, nextKajian, announcements] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getProfile(),
    getEvents({ upcoming: true, category: "kajian", limit: 1 }),
    getAnnouncements(),
  ]);
  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || undefined;
  const next = nextKajian[0];
  const nextLecture = next ? { title: pick(next.title, locale), startsAt: next.startsAt, href: `/events/${next.slug}` } : undefined;
  const pinned = announcements.filter((a) => a.pinned).slice(0, 2);
  const hasLive = Boolean(channelId || nextLecture);

  if (!hasLive && pinned.length === 0) return null;

  return (
    <section aria-label={t("pinned.label")} className="container-site pt-8 lg:pt-12">
      <div className={pinned.length > 0 && hasLive ? "grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start" : "grid gap-4"}>
        {hasLive && <LiveStatusBanner channelId={channelId} locale={locale} nextLecture={nextLecture} channelUrl={profile.social.youtube} />}
        {pinned.length > 0 && (
          <div className="flex flex-col gap-3">
            <AnnouncementList announcements={pinned} locale={locale} compact />
            <Link href="/news" className="tap-link inline-flex items-center gap-1.5 self-end text-sm font-semibold text-brand underline-offset-4 hover:underline">
              {t("pinned.seeAll")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
