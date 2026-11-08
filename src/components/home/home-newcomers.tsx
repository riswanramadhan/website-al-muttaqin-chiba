import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, Landmark, Languages, Recycle, TrainFront, UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getDictionary } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { DictionarySearch } from "@/components/guides";
import { HomeSection } from "./home-section";

type ShortcutKey = "cityHall" | "garbage" | "halal" | "transport";

const SHORTCUTS: { key: ShortcutKey; href: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: "cityHall", href: "/newcomers#firstSteps", icon: Landmark },
  { key: "garbage", href: "/newcomers#garbage", icon: Recycle },
  { key: "halal", href: "/halal", icon: UtensilsCrossed },
  { key: "transport", href: "/newcomers#transport", icon: TrainFront },
];

/** Baru di Chiba (PRD-03b §11): empat pintasan panduan dan pratinjau kamus Jepang. */
export async function HomeNewcomers({ locale }: { locale: Locale }) {
  const [t, entries] = await Promise.all([getTranslations({ locale, namespace: "home" }), getDictionary()]);

  return (
    <HomeSection id="newcomers" tone="surface">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionHeading tag={t("newcomers.tag")} tri={{ ja: "千葉へようこそ" }} title={t("newcomers.title")} highlight={t("newcomers.highlight")} description={t("newcomers.description")} />
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SHORTCUTS.map(({ key, href, icon: Icon }) => (
              <li key={key}>
                <Link href={href} className="card-surface lift group flex h-full items-start gap-4 p-5 hover:shadow-soft">
                  <IconCircle tone="soft" shape="square">
                    <Icon />
                  </IconCircle>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-snug transition-colors group-hover:text-brand">{t(`newcomers.shortcuts.${key}.title`)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`newcomers.shortcuts.${key}.description`)}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/newcomers" className={cn(buttonVariants({ variant: "primary" }), "mt-8")}>
            {t("newcomers.guideCta")}
            <ArrowRight />
          </Link>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-border bg-background p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <IconCircle size="sm" tone="brand">
                <Languages />
              </IconCircle>
              <div className="min-w-0">
                <h3 className="font-bold">{t("newcomers.dictionaryTitle")}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("newcomers.dictionaryDescription")}</p>
              </div>
            </div>
            <div className="mt-5">
              <DictionarySearch entries={entries} locale={locale} compact />
            </div>
            <Link href="/dictionary" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline">
              {t("newcomers.dictionaryCta")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
