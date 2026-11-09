import * as React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { AppShell } from "@/components/app/shell";
import { AdhanReminderHost } from "@/components/pwa/local-adhan-reminder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return { title: t("title"), description: t("description") };
}

export default async function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [config, profile] = await Promise.all([getPrayerConfig(), getProfile()]);
  return (
    <AppShell locale={locale as Locale}>
      {/* Pengingat adzan lokal + banner suara untuk semua layar App. */}
      <AdhanReminderHost config={config} coordinates={profile.coordinates} />
      {children}
    </AppShell>
  );
}
