import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getHalalPlaces, getProfile } from "@/lib/data";
import { AppScreenHeader } from "@/components/app/shell";
import { HalalRadar } from "@/components/guides";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "radar" });
  return { title: t("meta.title"), description: t("meta.description") };
}

/** Layar App Jamaah: radar halal dengan peta ~45vh, daftar terurut jarak, tombol "lokasi saya". */
export default async function AppRadarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, places, profile] = await Promise.all([
    getTranslations({ locale, namespace: "radar" }),
    getTranslations({ locale, namespace: "app" }),
    getHalalPlaces(),
    getProfile(),
  ]);

  return (
    <div>
      <AppScreenHeader title={t("title")} description={t("description")} backLabel={ta("back")} />
      <HalalRadar places={places} locale={locale} center={profile.coordinates} whatsapp={profile.whatsapp} variant="app" />
    </div>
  );
}
