import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bike, Car, Clock, Navigation, Route, TrainFront } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { LeafletMap } from "@/components/shared/map";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from "@/components/site/social-icons";
import { ContactCard, ContactForm, isContactSubject } from "@/components/about";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const ROUTES = ["tokyo", "ueno", "kashiwa", "narita"] as const;

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ subject?: string | string[] }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const sp = await searchParams;
  const rawSubject = Array.isArray(sp.subject) ? sp.subject[0] : sp.subject;
  const defaultSubject = isContactSubject(rawSubject) ? rawSubject : "general";

  const [t, tc, profile] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "common" }),
    getProfile(),
  ]);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${profile.coordinates.lat},${profile.coordinates.lng}&travelmode=transit`;
  const socials = [
    { key: "youtube", href: profile.social.youtube, label: "YouTube", Icon: YouTubeIcon },
    { key: "instagram", href: profile.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { key: "facebook", href: profile.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { key: "whatsapp", href: profile.social.whatsapp, label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter((s) => Boolean(s.href));

  return (
    <div className="container-site py-12 lg:py-16">
      <SectionHeading as="h1" tag={t("hero.tag")} tri={{ ja: "アクセス", ar: "اتصل بنا" }} title={t("hero.title")} highlight={t("hero.highlight")} description={t("hero.description")} />

      {/* Kartu kontak + peta */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ContactCard locale={locale} tone="inverse" className="h-full" />
        </div>
        <div className="lg:col-span-7">
          <LeafletMap
            center={profile.coordinates}
            zoom={15}
            height={420}
            markers={[
              {
                id: "mosque",
                kind: "mosque",
                position: profile.coordinates,
                title: pick(profile.name, locale),
                description: pick(profile.address, locale),
                href: profile.googleMapsUrl,
                linkLabel: tc("actions.openInMaps"),
              },
            ]}
            className="h-full min-h-80"
          />
          <p className="mt-3 text-xs text-muted-foreground">{t("map.note")}</p>
        </div>
      </div>

      {/* Akses */}
      <section className="mt-16 lg:mt-20" aria-labelledby="access-heading">
        <SectionHeading
          tag={t("access.tag")}
          title={t("access.title")}
          highlight={t("access.highlight")}
          description={t("access.description")}
          className="mb-8"
          action={
            <div className="flex flex-wrap gap-2">
              <a href={profile.googleMapsUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Navigation />
                {tc("actions.openInMaps")}
              </a>
              <a href={directionsUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "primary", size: "sm" })}>
                <Route />
                {t("access.directions")}
              </a>
            </div>
          }
        />
        <span id="access-heading" className="sr-only">
          {t("access.title")}
        </span>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card-surface p-6">
            <IconCircle tone="soft" shape="square">
              <TrainFront />
            </IconCircle>
            <h3 className="mt-5 text-lg font-bold">{t("access.stations")}</h3>
            <ul className="mt-4 space-y-4">
              {profile.nearestStations.map((s) => (
                <li key={pick(s.name, "en")} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                  <p className="font-semibold">{pick(s.name, locale)}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.lines}</p>
                  <p className="mt-1 text-sm text-brand">{t("access.walk", { minutes: s.walkMinutes })}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-6">
            <IconCircle tone="soft" shape="square">
              <Route />
            </IconCircle>
            <h3 className="mt-5 text-lg font-bold">{t("access.routesTitle")}</h3>
            <ul className="mt-4 space-y-4">
              {ROUTES.map((r) => (
                <li key={r} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                  <p className="font-semibold">{t(`access.routes.${r}.from`)}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{t(`access.routes.${r}.text`)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="card-surface p-6">
              <IconCircle tone="soft" shape="square">
                <Car />
              </IconCircle>
              <h3 className="mt-5 text-lg font-bold">{t("access.parking.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("access.parking.body")}</p>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Bike className="size-4 text-brand" aria-hidden />
                {t("access.parking.bike")}
              </p>
            </div>
            <div className="card-muted p-6">
              <IconCircle tone="default" shape="square">
                <Clock />
              </IconCircle>
              <h3 className="mt-5 text-lg font-bold">{t("office.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("office.description")}</p>
              <dl className="mt-4 space-y-2 text-sm">
                {(["weekday", "friday", "weekend"] as const).map((k) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border pb-2 last:border-b-0">
                    <dt className="text-muted-foreground">{t(`office.hours.${k}.label`)}</dt>
                    <dd className="font-semibold tabular">{t(`office.hours.${k}.value`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Formulir */}
      <section className="mt-16 lg:mt-20" id="form">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading tag={t("form.tag")} title={t("form.title")} highlight={t("form.highlight")} description={t("form.description")} />
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  <span>{t(`form.tips.${i}`)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("social.title")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("social.description")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {socials.map(({ key, href, label, Icon }) => (
                  <a key={key} href={href} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    <Icon className="size-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ContactForm defaultSubject={defaultSubject} />
          </div>
        </div>
      </section>
    </div>
  );
}
