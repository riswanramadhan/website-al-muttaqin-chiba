import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ExternalLink, Languages, MapPin, Smartphone, UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getDictionary, getHalalPlaces, getHaramIngredients, getProfile } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/primitives";
import { HalalRadar, HaramKanjiSearch } from "@/components/guides";
import { cn } from "@/lib/utils/cn";

type LabelItem = { term: string; reading: string; meaning: string };
type LinkItem = { name: string; detail: string; url: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "halal" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function HalalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ingredients, places, dictionary, profile] = await Promise.all([
    getTranslations({ locale, namespace: "halal" }),
    getHaramIngredients(),
    getHalalPlaces(),
    getDictionary(),
    getProfile(),
  ]);

  const labelItems = Object.values(t.raw("labels.items") as Record<string, LabelItem>);
  const culinary = Object.values(t.raw("cards.culinary.items") as Record<string, LinkItem>);
  const apps = Object.values(t.raw("cards.apps.items") as Record<string, LinkItem>);
  const foodPhrases = dictionary.filter((d) => d.category === "food" && d.example).slice(0, 6);

  return (
    <div>
      <section className="hero-surface">
        <div className="container-site py-16 lg:py-24">
          <SectionHeading as="h1" tone="inverse" tag={t("tag")} tri={{ ja: "ハラール", ar: "حلال" }} title={t("title")} highlight={t("highlight")} description={t("description")} />
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#radar" className={buttonVariants({ variant: "inverse" })}>
              <MapPin />
              {t("hero.radar")}
            </a>
            <a href="#phrases" className={buttonVariants({ variant: "outlineInverse" })}>
              <Languages />
              {t("hero.dictionary")}
            </a>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-hero-muted">{t("hero.disclaimer")}</p>
        </div>
      </section>

      <section id="kanji" className="container-site scroll-mt-24 py-12 lg:py-16">
        <SectionHeading tag={t("search.tag")} title={t("search.title")} description={t("search.description")} />
        <div className="mt-8">
          <HaramKanjiSearch items={ingredients} locale={locale} />
        </div>
      </section>

      <section id="labels" className="scroll-mt-24 bg-surface/60 py-12 lg:py-16">
        <div className="container-site">
          <SectionHeading tag={t("labels.tag")} title={t("labels.title")} description={t("labels.description")} />
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {labelItems.map((item) => (
              <li key={item.term} className="card-surface flex flex-col gap-2 p-5">
                <p lang="ja" className="headline text-3xl">
                  {item.term}
                </p>
                <p className="text-xs text-muted-foreground italic">{item.reading}</p>
                <p className="text-sm">{item.meaning}</p>
              </li>
            ))}
          </ul>
          <Card variant="brand" className="mt-6">
            <p className="text-sm leading-relaxed">{t("labels.tip")}</p>
          </Card>
        </div>
      </section>

      <section id="phrases" className="container-site scroll-mt-24 py-12 lg:py-16">
        <SectionHeading
          tag={t("phrases.tag")}
          title={t("phrases.title")}
          description={t("phrases.description")}
          action={
            <Link href="/dictionary" className={buttonVariants({ variant: "outline" })}>
              {t("phrases.link")}
              <ArrowRight />
            </Link>
          }
        />
        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {foodPhrases.map((entry) => (
            <li key={entry.id} className="card-surface flex flex-col gap-2 p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <span lang="ja">{entry.japanese}</span> · {pick(entry.meaning, locale)}
              </p>
              <p lang="ja" className="text-lg leading-relaxed font-semibold">
                {entry.example?.ja}
              </p>
              <p className="text-sm text-muted-foreground">{entry.example ? pick(entry.example.translation, locale) : null}</p>
              <Link href={`/dictionary#${entry.id}`} className={cn(buttonVariants({ variant: "link", size: "sm" }), "mt-1 self-start")}>
                {t("phrases.show")}
                <ArrowRight />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="radar" className="scroll-mt-24 bg-surface/60 py-12 lg:py-16">
        <div className="container-site">
          <SectionHeading tag={t("radar.tag")} title={t("radar.title")} description={t("radar.description")} />
          <div className="mt-8">
            <HalalRadar places={places} locale={locale} center={profile.coordinates} whatsapp={profile.whatsapp} />
          </div>
        </div>
      </section>

      <section id="resources" className="container-site scroll-mt-24 py-12 lg:py-16">
        <SectionHeading tag={t("cards.tag")} title={t("cards.title")} />
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <IconCircle tone="soft" size="sm">
                <UtensilsCrossed />
              </IconCircle>
              <div>
                <CardTitle>{t("cards.culinary.title")}</CardTitle>
                <CardDescription>{t("cards.culinary.description")}</CardDescription>
              </div>
            </div>
            <ul className="mt-5 flex flex-col divide-y divide-border">
              {culinary.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })} aria-label={`${t("cards.open")}: ${item.name}`}>
                    {t("cards.open")}
                    <ExternalLink />
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <IconCircle tone="soft" size="sm">
                <Smartphone />
              </IconCircle>
              <div>
                <CardTitle>{t("cards.apps.title")}</CardTitle>
                <CardDescription>{t("cards.apps.description")}</CardDescription>
              </div>
            </div>
            <ul className="mt-5 flex flex-col divide-y divide-border">
              {apps.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })} aria-label={`${t("cards.open")}: ${item.name}`}>
                    {t("cards.open")}
                    <ExternalLink />
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
