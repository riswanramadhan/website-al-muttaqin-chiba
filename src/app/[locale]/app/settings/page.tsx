import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { AppScreenHeader } from "@/components/app/shell";
import { SettingsPanel } from "@/components/pwa/settings-panel";
import pkg from "../../../../../package.json";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta] = await Promise.all([getTranslations({ locale, namespace: "settings" }), getTranslations({ locale, namespace: "app" })]);

  return (
    <div>
      <AppScreenHeader title={t("title")} description={t("description")} backLabel={ta("back")} />
      <SettingsPanel version={pkg.version} />
    </div>
  );
}
