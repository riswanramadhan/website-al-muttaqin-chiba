import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getSurahList, getSurahMeta } from "@/lib/data";
import { routing } from "@/i18n/routing";
import { AppScreenHeader } from "@/components/app/shell";
import { SurahReader } from "@/components/worship";
import { surahLocalName } from "@/components/worship/utils";

type Params = { locale: string; surah: string };

function parseSurah(raw: string): number | null {
  if (!/^\d{1,3}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= 114 ? n : null;
}

export async function generateStaticParams(): Promise<Params[]> {
  const surahs = await getSurahList();
  return routing.locales.flatMap((locale) => surahs.map((s) => ({ locale, surah: String(s.number) })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, surah } = await params;
  const n = parseSurah(surah);
  const t = await getTranslations({ locale, namespace: "quran" });
  const meta = n ? await getSurahMeta(n) : undefined;
  if (!meta) return { title: t("meta.title") };
  return {
    title: `${meta.transliteration} (${meta.name}) · ${t("meta.title")}`,
    description: `${surahLocalName(meta, locale as Locale)} · ${t("ayahs", { count: meta.numberOfAyahs })}`,
  };
}

export default async function SurahPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, surah } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const n = parseSurah(surah);
  if (!n) notFound();
  const [meta, prev, next, ta] = await Promise.all([
    getSurahMeta(n),
    n > 1 ? getSurahMeta(n - 1) : Promise.resolve(undefined),
    n < 114 ? getSurahMeta(n + 1) : Promise.resolve(undefined),
    getTranslations({ locale, namespace: "app" }),
  ]);
  if (!meta) notFound();

  return (
    <div>
      <AppScreenHeader title={meta.transliteration} description={surahLocalName(meta, locale)} backHref="/app/quran" backLabel={ta("back")} />
      <SurahReader meta={meta} prev={prev} next={next} locale={locale} />
    </div>
  );
}
