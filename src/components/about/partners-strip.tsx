import * as React from "react";
import { getTranslations } from "next-intl/server";
import { ExternalLink, Handshake } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { IconCircle } from "@/components/ui/primitives";

/** Mitra pengelola dan pendukung (PRD-03a), dibaca dari `profile.partners`. */
export async function PartnersStrip({ locale, className }: { locale: Locale; className?: string }) {
  const [t, tc, profile] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "common" }),
    getProfile(),
  ]);

  return (
    <ul className={className ?? "grid grid-cols-1 gap-4 sm:grid-cols-3"}>
      {profile.partners.map((p) => {
        const initials = p.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase();
        return (
          <li key={p.name} className="card-surface flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
              <IconCircle tone="soft" shape="square" size="lg">
                <span className="text-sm font-bold tracking-wide" aria-hidden>
                  {initials}
                </span>
              </IconCircle>
              <div className="min-w-0">
                <p className="font-bold leading-snug">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pick(p.role, locale)}</p>
              </div>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline"
              >
                <Handshake className="size-4" aria-hidden />
                {t("partners.visit")}
                <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only">({tc("a11y.externalLink")})</span>
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
