import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getDuas } from "@/lib/data";
import { AppScreenHeader } from "@/components/app/shell";
import { DuaList } from "@/components/worship";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dua" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function DuaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, duas] = await Promise.all([
    getTranslations({ locale, namespace: "dua" }),
    getTranslations({ locale, namespace: "app" }),
    getDuas(),
  ]);

  return (
    <div>
      <AppScreenHeader title={t("title")} description={t("description")} backLabel={ta("back")} />
      <DuaList duas={duas} locale={locale} />
    </div>
  );
}
