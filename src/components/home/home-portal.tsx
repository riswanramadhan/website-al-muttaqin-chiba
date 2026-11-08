import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, Compass, HandCoins, LifeBuoy, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { IconCircle } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { HomeSection } from "./home-section";

type PortalKey = "jamaah" | "newcomers" | "donors";

const PORTALS: { key: PortalKey; href: string; icon: ComponentType<SVGProps<SVGSVGElement>>; dark?: boolean }[] = [
  { key: "jamaah", href: "/app", icon: Smartphone, dark: true },
  { key: "newcomers", href: "/newcomers", icon: Compass },
  { key: "donors", href: "/donate", icon: HandCoins },
];

/** Portal jamaah (PRD-03b §2): tiga pintu masuk utama sesuai persona, plus kartu bantuan. */
export async function HomePortal({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <HomeSection id="portal">
      <SectionHeading tag={t("portal.tag")} title={t("portal.title")} highlight={t("portal.highlight")} description={t("portal.description")} />
      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
        {PORTALS.map(({ key, href, icon: Icon, dark }) => (
          <li key={key}>
            <Link
              href={href}
              className={cn(
                "lift group flex h-full flex-col gap-6 rounded-3xl p-6 sm:p-8",
                dark ? "hero-surface" : "card-surface hover:shadow-soft",
              )}
            >
              <div className="relative flex items-start justify-between gap-4">
                <IconCircle tone={dark ? "inverse" : "soft"} size="lg">
                  <Icon />
                </IconCircle>
                <ArrowUpRight
                  className={cn("size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", dark ? "text-hero-muted" : "text-muted-foreground")}
                  aria-hidden
                />
              </div>
              <div className="relative flex-1">
                <p className={cn("text-xs font-semibold tracking-wide uppercase", dark ? "text-hero-muted" : "text-brand")}>{t(`portal.items.${key}.eyebrow`)}</p>
                <h3 className="headline mt-2 text-2xl">{t(`portal.items.${key}.title`)}</h3>
                <p className={cn("mt-2 text-sm leading-relaxed", dark ? "text-hero-muted" : "text-muted-foreground")}>{t(`portal.items.${key}.description`)}</p>
              </div>
              <span className="relative inline-flex items-center gap-1.5 text-sm font-semibold">
                {t(`portal.items.${key}.cta`)}
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/app/help" className="card-muted lift group mt-4 flex items-center gap-4 rounded-3xl p-5 sm:p-6 lg:mt-6">
        <IconCircle tone="brand" size="md">
          <LifeBuoy />
        </IconCircle>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{t("portal.help.title")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("portal.help.description")}</p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand sm:inline-flex">
          {t("portal.help.cta")}
        </span>
        <ArrowRight className="size-5 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </HomeSection>
  );
}
