import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Copy, Maximize2, Volume2 } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/data";
import { SectionHeading } from "@/components/ui/section-heading";
import { NumberedItem } from "@/components/ui/primitives";
import { DictionarySearch } from "@/components/guides";

type Tip = { name: string; detail: string };
const TIP_ICONS = [Maximize2, Copy, Volume2];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dictionary" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function DictionaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, entries] = await Promise.all([getTranslations({ locale, namespace: "dictionary" }), getDictionary()]);
  const tips = Object.values(t.raw("tips.items") as Record<string, Tip>);

  return (
    <div>
      <section className="hero-surface">
        <div className="container-site py-16 lg:py-24">
          <SectionHeading as="h1" tone="inverse" tag={t("tag")} tri={{ ja: "辞書", ar: "قاموس" }} title={t("title")} highlight={t("highlight")} description={t("description")} />
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        <DictionarySearch entries={entries} locale={locale} />
      </section>

      <section className="bg-surface/60 py-12 lg:py-16">
        <div className="container-site">
          <SectionHeading tag={t("tips.tag")} title={t("tips.title")} />
          <div className="card-surface mt-8 px-5 sm:px-6">
            {tips.map((tip, i) => {
              const Icon = TIP_ICONS[i] ?? Maximize2;
              return <NumberedItem key={tip.name} index={i + 1} title={tip.name} description={tip.detail} icon={<Icon />} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
