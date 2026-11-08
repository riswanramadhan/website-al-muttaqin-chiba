import { getTranslations } from "next-intl/server";
import { ArrowRight, ExternalLink, Tv } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getLectures, getProfile } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { EmptyState } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { LectureCard } from "@/components/activities";
import { HomeSection } from "./home-section";

/** Kajian terbaru (PRD-03b §6): carousel kartu kajian dan tautan kanal YouTube. */
export async function HomeLectures({ locale }: { locale: Locale }) {
  const [t, tc, lectures, profile] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "common" }),
    getLectures({ limit: 4 }),
    getProfile(),
  ]);
  const channelUrl = profile.social.youtube;

  return (
    <HomeSection id="lectures">
      <SectionHeading
        tag={t("lectures.tag")}
        title={t("lectures.title")}
        highlight={t("lectures.highlight")}
        description={t("lectures.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/lectures" className={buttonVariants({ variant: "outline" })}>
              {t("lectures.seeAll")}
              <ArrowRight />
            </Link>
            {channelUrl && (
              <a href={channelUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "soft" })}>
                <Tv />
                {t("lectures.channel")}
                <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only">({tc("a11y.externalLink")})</span>
              </a>
            )}
          </div>
        }
      />
      <div className="mt-10">
        {lectures.length === 0 ? (
          <EmptyState icon={<Tv />} title={t("lectures.empty")} />
        ) : (
          <Carousel loop={false} labels={{ previous: tc("actions.previous"), next: tc("actions.next") }}>
            {lectures.map((lecture) => (
              <CarouselItem key={lecture.id}>
                <LectureCard lecture={lecture} locale={locale} />
              </CarouselItem>
            ))}
          </Carousel>
        )}
      </div>
    </HomeSection>
  );
}
