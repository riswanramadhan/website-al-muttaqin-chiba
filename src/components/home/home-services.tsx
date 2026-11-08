import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, BookOpen, DoorOpen, GraduationCap, HeartHandshake, MoonStar, Sprout } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/ui/section-heading";
import { HomeSection } from "./home-section";

type ServiceKey = "prayer" | "lectures" | "muallaf" | "tpa" | "openMosque" | "newcomers";

const SERVICES: { key: ServiceKey; href: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { key: "prayer", href: "/jumuah", icon: MoonStar },
  { key: "lectures", href: "/lectures", icon: BookOpen },
  { key: "muallaf", href: "/programs/kelas-muallaf", icon: HeartHandshake },
  { key: "tpa", href: "/programs/tpa", icon: GraduationCap },
  { key: "openMosque", href: "/programs/open-mosque", icon: DoorOpen },
  { key: "newcomers", href: "/newcomers", icon: Sprout },
];

/**
 * Layanan kami (PRD-03b §4): daftar bernomor 01-06 bergaya referensi UI (seperti NumberedItem),
 * tetapi memakai Link berlokal agar navigasi tetap di sisi klien.
 */
export async function HomeServices({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <HomeSection id="services">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading tag={t("services.tag")} title={t("services.title")} highlight={t("services.highlight")} description={t("services.description")} />
            <Link href="/programs" className={cn(buttonVariants({ variant: "primary" }), "mt-8")}>
              {t("services.cta")}
              <ArrowRight />
            </Link>
          </div>
        </div>
        <ol className="card-surface px-5 sm:px-8 lg:col-span-7">
          {SERVICES.map(({ key, href, icon: Icon }, i) => (
            <li key={key} className="border-b border-border last:border-b-0">
              <Link href={href} className="group flex items-start gap-4 py-6 sm:gap-6">
                <span className="headline w-10 shrink-0 text-2xl text-brand tabular sm:w-14 sm:text-4xl">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <IconCircle size="sm" tone="soft" className="hidden sm:inline-flex">
                    <Icon />
                  </IconCircle>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-brand">{t(`services.items.${key}.title`)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`services.items.${key}.description`)}</p>
                  </div>
                </div>
                <ArrowUpRight
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </HomeSection>
  );
}
