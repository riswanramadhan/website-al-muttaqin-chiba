import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { AppScreenHeader } from "@/components/app/shell";
import { QiblaCompass } from "@/components/worship";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "qibla" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function QiblaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, profile] = await Promise.all([
    getTranslations({ locale, namespace: "qibla" }),
    getTranslations({ locale, namespace: "app" }),
    getProfile(),
  ]);

  return (
    <div>
      <AppScreenHeader title={t("title")} description={t("description")} backLabel={ta("back")} />
      <QiblaCompass mosque={profile.coordinates} locale={locale} />
    </div>
  );
}
