import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { AppScreenHeader } from "@/components/app/shell";
import { TasbihCounter } from "@/components/worship";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tasbih" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function TasbihPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta] = await Promise.all([getTranslations({ locale, namespace: "tasbih" }), getTranslations({ locale, namespace: "app" })]);

  return (
    <div>
      <AppScreenHeader title={t("title")} description={t("description")} backLabel={ta("back")} />
      <TasbihCounter locale={locale} />
    </div>
  );
}
