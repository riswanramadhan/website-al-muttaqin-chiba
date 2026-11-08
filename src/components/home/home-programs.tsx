import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProgramGrid } from "@/components/programs";
import { HomeSection } from "./home-section";

/** Program unggulan (PRD-03b §5): empat kartu program dan tombol lihat semua. */
export async function HomePrograms({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <HomeSection id="programs" tone="surface">
      <SectionHeading
        tag={t("programs.tag")}
        title={t("programs.title")}
        highlight={t("programs.highlight")}
        description={t("programs.description")}
        action={
          <Link href="/programs" className={buttonVariants({ variant: "outline" })}>
            {t("programs.seeAll")}
            <ArrowRight />
          </Link>
        }
      />
      {/* Empat kartu: 2x2 di tablet/laptop, empat sejajar di layar lebar (grid milik ProgramGrid). */}
      <div className="mt-10 lg:[&>div]:grid-cols-2 xl:[&>div]:grid-cols-4">
        <ProgramGrid locale={locale} limit={4} />
      </div>
    </HomeSection>
  );
}
