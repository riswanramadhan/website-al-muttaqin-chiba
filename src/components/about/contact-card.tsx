import * as React from "react";
import { getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { IconCircle } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";

const LOCALES: Locale[] = ["ja", "en", "id"];

/**
 * Kartu kontak (PRD-03a): alamat tiga bahasa dengan kode pos, jam buka, telepon,
 * WhatsApp, email, dan tombol salin alamat Jepang. `tone="inverse"` untuk latar gelap.
 */
export async function ContactCard({ locale, tone = "default", className }: { locale: Locale; tone?: "default" | "inverse"; className?: string }) {
  const [t, tc, profile] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "common" }),
    getProfile(),
  ]);
  const inverse = tone === "inverse";
  const japaneseAddress = `〒${profile.postalCode} ${profile.address.ja}`;
  const ordered = [locale, ...LOCALES.filter((l) => l !== locale)];
  const muted = inverse ? "text-hero-muted" : "text-muted-foreground";
  const iconTone = inverse ? "inverse" : "soft";
  const btn = (variant: "outline" | "outlineInverse" | "primary" | "inverse") => buttonVariants({ variant, size: "sm" });

  return (
    <div className={cn("rounded-2xl p-6 sm:p-8", inverse ? "hero-surface" : "card-surface", className)}>
      <div className="relative space-y-6">
        <div className="flex gap-4">
          <IconCircle tone={iconTone} size="sm">
            <MapPin />
          </IconCircle>
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-semibold tracking-wide uppercase", muted)}>{t("card.address")}</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              {ordered.map((l) => (
                <li key={l} lang={l} className={l === locale ? "font-semibold" : muted}>
                  {l === "ja" ? `〒${profile.postalCode} ` : ""}
                  {pick(profile.address, l)}
                  {l !== "ja" ? `, ${pick(profile.prefecture, l)} ${profile.postalCode}, ${pick(profile.country, l)}` : ""}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton value={japaneseAddress} label={t("card.copyAddress")} variant={inverse ? "outlineInverse" : "outline"} />
              <a href={profile.googleMapsUrl} target="_blank" rel="noreferrer" className={btn(inverse ? "outlineInverse" : "outline")}>
                {tc("actions.openInMaps")}
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <IconCircle tone={iconTone} size="sm">
            <Clock />
          </IconCircle>
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-semibold tracking-wide uppercase", muted)}>{t("card.hours")}</p>
            <p className="mt-2 text-sm leading-relaxed">{pick(profile.openingHours, locale)}</p>
            <p className={cn("mt-1 text-sm", muted)}>{t("card.officeHours")}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <IconCircle tone={iconTone} size="sm">
            <Phone />
          </IconCircle>
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-semibold tracking-wide uppercase", muted)}>{t("card.phone")}</p>
            <a href={`tel:${profile.phone.replace(/[^+0-9]/g, "")}`} className="mt-2 inline-block text-sm font-semibold tabular underline-offset-4 hover:underline">
              {profile.phone}
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className={btn(inverse ? "inverse" : "primary")}>
                <WhatsAppIcon className="size-4" />
                {tc("actions.whatsapp")}
              </a>
              <a href={`tel:${profile.phone.replace(/[^+0-9]/g, "")}`} className={btn(inverse ? "outlineInverse" : "outline")}>
                <Phone />
                {tc("actions.call")}
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <IconCircle tone={iconTone} size="sm">
            <Mail />
          </IconCircle>
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-semibold tracking-wide uppercase", muted)}>{t("card.email")}</p>
            <a href={`mailto:${profile.email}`} className="mt-2 inline-block break-all text-sm font-semibold underline-offset-4 hover:underline">
              {profile.email}
            </a>
            <p className={cn("mt-1 text-sm", muted)}>{t("card.emailHint")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
