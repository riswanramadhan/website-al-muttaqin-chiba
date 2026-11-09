import * as React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from "@/components/site/social-icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { METHOD_LABELS } from "@/lib/prayer";
import { pick } from "@/lib/utils/i18n";
import { NAV_GROUPS } from "@/components/site/nav-config";
import { LogoMark } from "@/components/site/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const DEKATLOKAL_URL = "https://dekatlokal.com";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [t, tn, tc, profile, config] = await Promise.all([
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getProfile(),
    getPrayerConfig(),
  ]);
  const year = new Date().getFullYear();
  const groupsLeft = NAV_GROUPS.filter((g) => g.key === "worship" || g.key === "learn");
  const groupsRight = NAV_GROUPS.filter((g) => g.key === "community" || g.key === "support" || g.key === "about");

  return (
    <footer className="bg-hero text-hero-foreground pattern-shippo mt-24">
      <div className="container-site py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <LogoMark tone="inverse" className="size-14" />
              <div>
                <p className="text-xl font-bold">{pick(profile.name, locale)}</p>
                <p className="text-sm text-hero-muted">{pick(profile.tagline, locale)}</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-hero-muted">{t("about")}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.social.youtube && (
                <a href={profile.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className={buttonVariants({ variant: "outlineInverse", size: "icon" })}>
                  <YouTubeIcon />
                </a>
              )}
              {profile.social.instagram && (
                <a href={profile.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className={buttonVariants({ variant: "outlineInverse", size: "icon" })}>
                  <InstagramIcon />
                </a>
              )}
              {profile.social.facebook && (
                <a href={profile.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className={buttonVariants({ variant: "outlineInverse", size: "icon" })}>
                  <FacebookIcon />
                </a>
              )}
              {profile.social.whatsapp && (
                <a href={profile.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className={buttonVariants({ variant: "outlineInverse", size: "icon" })}>
                  <WhatsAppIcon />
                </a>
              )}
            </div>
            <p className="mt-8 text-xs leading-relaxed text-hero-muted">{t("installCta")}</p>
            <Link href="/app" className={cn(buttonVariants({ variant: "inverse", size: "sm" }), "mt-3")}>
              {tc("actions.openApp")}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {[...groupsLeft, ...groupsRight].map((g) => (
              <div key={g.key} className={cn(g.key === "about" && "sm:col-start-3")}>
                <p className="mb-3 text-xs font-semibold tracking-wide text-hero-muted uppercase">{tn(`groups.${g.key}`)}</p>
                <ul className="space-y-2">
                  {g.links.map((l) => (
                    <li key={l.key}>
                      <Link href={l.href} className="text-sm text-hero-foreground/85 transition-colors hover:text-hero-foreground">
                        {tn(l.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <p className="mb-3 text-xs font-semibold tracking-wide text-hero-muted uppercase">{t("contact")}</p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-hero-muted" />
                <span>
                  {pick(profile.address, locale)}
                  <br />
                  <a href={profile.googleMapsUrl} target="_blank" rel="noreferrer" className="text-hero-muted underline-offset-4 hover:underline">
                    {tc("actions.openInMaps")}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-hero-muted" />
                <span>{pick(profile.openingHours, locale)}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-hero-muted" />
                <a href={`mailto:${profile.email}`} className="break-all hover:underline">
                  {profile.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-hero-muted" />
                <a href={`tel:${profile.phone}`} className="hover:underline">
                  {profile.phone}
                </a>
              </li>
            </ul>
            <p className="mt-6 mb-3 text-xs font-semibold tracking-wide text-hero-muted uppercase">{t("partners")}</p>
            <ul className="flex flex-wrap items-center gap-2.5 text-sm text-hero-foreground/85">
              {profile.partners.map((p) => {
                const content = p.logo ? (
                  <span className="flex h-11 items-center rounded-xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Image src={p.logo.src} alt={p.name} width={p.logo.width} height={p.logo.height} className="h-full w-auto object-contain" />
                  </span>
                ) : (
                  <span className="flex h-11 items-center rounded-xl border border-hero-foreground/15 bg-hero-foreground/5 px-3 font-semibold">{p.name}</span>
                );
                return (
                  <li key={p.name}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="group block" title={p.url === DEKATLOKAL_URL ? t("techPartner") : p.name}>
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-hero-foreground/10 pt-6 text-xs text-hero-muted md:flex-row md:items-center md:justify-between">
          <p>{t("copyright", { year })}</p>
          <p className="max-w-xl">{t("prayerNote", { method: METHOD_LABELS[config.method] })}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-hero-foreground">
              {tn("privacy")}
            </Link>
            <Link href="/faq" className="hover:text-hero-foreground">
              {tn("faq")}
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hero-foreground/15 bg-hero-foreground/5 px-3 py-1">
              <span>{t("poweredBy")}</span>
              <a href={DEKATLOKAL_URL} target="_blank" rel="noreferrer" className="font-bold text-hero-foreground hover:text-gold">
                DekatLokal
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
