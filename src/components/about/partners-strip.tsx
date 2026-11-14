import * as React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ExternalLink, Handshake } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { shouldSkipOptimization } from "@/lib/utils/media";
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
            {p.logo ? (
              <div className="flex h-20 items-center justify-center rounded-2xl border border-border bg-white px-6 py-3">
                <Image src={p.logo.src} alt={p.name} width={p.logo.width} height={p.logo.height} unoptimized={shouldSkipOptimization(p.logo.src)} className="h-full w-auto max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded-2xl border border-border bg-surface">
                <IconCircle tone="soft" shape="square" size="lg">
                  <span className="text-sm font-bold tracking-wide" aria-hidden>
                    {initials}
                  </span>
                </IconCircle>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold leading-snug">{p.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{pick(p.role, locale)}</p>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="tap-link mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline"
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
