import { getTranslations } from "next-intl/server";
import { ArrowRight, HandCoins } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";

/** Ajakan infaq ringkas untuk beranda dan App home (PRD-05). Server Component. */
export async function DonateCta({ locale, tone = "default" }: { locale: Locale; tone?: "default" | "inverse" }) {
  const t = await getTranslations({ locale, namespace: "donate" });
  const inverse = tone === "inverse";
  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8",
        inverse ? "hero-surface" : "card-surface",
      )}
      aria-labelledby="donate-cta-title"
    >
      <div className="flex items-start gap-4">
        <IconCircle tone={inverse ? "inverse" : "soft"} size="lg">
          <HandCoins />
        </IconCircle>
        <div>
          <h2 id="donate-cta-title" className="headline text-xl sm:text-2xl">
            {t("cta.title")}
          </h2>
          <p className={cn("mt-1.5 text-sm leading-relaxed sm:text-base", inverse ? "text-hero-muted" : "text-muted-foreground")}>{t("cta.description")}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <Link href="/donate" className={buttonVariants({ variant: inverse ? "inverse" : "primary" })}>
          {t("cta.primary")}
          <ArrowRight />
        </Link>
        <Link href="/transparency" className={buttonVariants({ variant: inverse ? "outlineInverse" : "outline" })}>
          {t("cta.secondary")}
        </Link>
      </div>
    </section>
  );
}
