import { getTranslations } from "next-intl/server";
import { ArrowRight, MapPin, TrainFront } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getProfile } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { ContactCard, PartnersStrip } from "@/components/about";
import { HomeSection } from "./home-section";

/** Kontak & akses (PRD-03b §14): kartu kontak, tombol WhatsApp/peta, stasiun terdekat, dan mitra. */
export async function HomeContact({ locale }: { locale: Locale }) {
  const [t, tc, profile] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "common" }),
    getProfile(),
  ]);
  const whatsappUrl = profile.social.whatsapp ?? `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`;

  return (
    <HomeSection id="contact">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading tag={t("contact.tag")} title={t("contact.title")} highlight={t("contact.highlight")} description={t("contact.description")} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "primary", size: "lg" })}>
              <WhatsAppIcon className="size-5" />
              {t("contact.whatsapp")}
              <span className="sr-only">({tc("a11y.externalLink")})</span>
            </a>
            <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <MapPin />
              {t("contact.maps")}
              <span className="sr-only">({tc("a11y.externalLink")})</span>
            </a>
          </div>
          {profile.nearestStations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("contact.stationsTitle")}</h3>
              <ul className="mt-3 grid gap-2">
                {profile.nearestStations.map((station) => (
                  <li key={station.lines + station.walkMinutes} className="card-muted flex items-center gap-3 px-4 py-3 text-sm">
                    <TrainFront className="size-4 shrink-0 text-brand" aria-hidden />
                    <span className="min-w-0 flex-1 font-semibold">{pick(station.name, locale)}</span>
                    <span className="shrink-0 text-muted-foreground tabular">{t("contact.walk", { count: station.walkMinutes })}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline">
            {t("contact.form")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="lg:col-span-7">
          <ContactCard locale={locale} />
        </div>
      </div>
      <div className="mt-16 border-t border-border pt-10">
        <h3 className="mb-6 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{t("contact.partnersTitle")}</h3>
        <PartnersStrip locale={locale} />
      </div>
    </HomeSection>
  );
}
