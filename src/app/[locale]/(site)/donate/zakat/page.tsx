import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ZakatCalculator } from "@/components/donate";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "zakat" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function ZakatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const t = await getTranslations({ locale, namespace: "zakat" });
  return (
    <div className="container-site space-y-10 py-12 lg:py-16">
      <SectionHeading as="h1" tag={t("tag")} tri={{ ja: "ザカート", ar: "زكاة" }} title={t("title")} highlight={t("highlight")} description={t("description")} />
      <ZakatCalculator locale={locale} />
    </div>
  );
}
