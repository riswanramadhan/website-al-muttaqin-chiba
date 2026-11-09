import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getFaqs } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { siteUrl } from "@/lib/site";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { FaqAccordion } from "@/components/about";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, tc, items] = await Promise.all([
    getTranslations({ locale, namespace: "faq" }),
    getTranslations({ locale, namespace: "common" }),
    getFaqs(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${siteUrl}/${locale}/faq`,
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: pick(item.question, locale),
      url: `${siteUrl}/${locale}/faq#${item.id}`,
      acceptedAnswer: { "@type": "Answer", text: pick(item.answer, locale) },
    })),
  };

  return (
    <div className="container-site py-12 lg:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SectionHeading as="h1" tag={t("hero.tag")} tri={{ ja: "よくある質問", ar: "الأسئلة الشائعة" }} title={t("hero.title")} highlight={t("hero.highlight")} description={t("hero.description")} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <FaqAccordion items={items} locale={locale} searchable />
        </div>
        <aside className="lg:col-span-4">
          <div className="card-muted sticky top-24 p-6">
            <IconCircle color="emerald">
              <WhatsAppIcon />
            </IconCircle>
            <h2 className="mt-5 text-xl font-bold">{t("cta.title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("cta.body")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/contact" className={buttonVariants({ variant: "primary", size: "sm" })}>
                {tc("actions.contactUs")}
                <ArrowRight />
              </Link>
              <Link href="/newcomers" className={buttonVariants({ variant: "outline", size: "sm" })}>
                {t("cta.newcomers")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
