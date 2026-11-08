import { getTranslations } from "next-intl/server";
import { ArrowRight, MessageCircleQuestionMark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getFaqs } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { FaqAccordion } from "@/components/about";
import { HomeSection } from "./home-section";

/** FAQ (PRD-03b §13): lima pertanyaan teratas dan tautan ke halaman FAQ lengkap. */
export async function HomeFaq({ locale }: { locale: Locale }) {
  const [t, faqs] = await Promise.all([getTranslations({ locale, namespace: "home" }), getFaqs()]);

  return (
    <HomeSection id="faq" tone="surface">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading tag={t("faq.tag")} title={t("faq.title")} highlight={t("faq.highlight")} description={t("faq.description")} />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/faq" className={buttonVariants({ variant: "primary" })}>
              {t("faq.seeAll")}
              <ArrowRight />
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              <MessageCircleQuestionMark />
              {t("faq.ask")}
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <FaqAccordion items={faqs.slice(0, 5)} locale={locale} searchable={false} />
        </div>
      </div>
    </HomeSection>
  );
}
