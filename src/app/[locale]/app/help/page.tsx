import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { AppScreenHeader } from "@/components/app/shell";
import { HelpCenter } from "@/components/programs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function AppHelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, profile] = await Promise.all([
    getTranslations({ locale, namespace: "help" }),
    getTranslations({ locale, namespace: "app" }),
    getProfile(),
  ]);

  return (
    <div>
      <AppScreenHeader title={t("title")} description={t("description")} backLabel={ta("back")} />
      <HelpCenter locale={locale} whatsapp={profile.whatsapp} mapsUrl={profile.googleMapsUrl} email={profile.email} />
    </div>
  );
}
