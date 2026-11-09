import type { Metadata, Viewport } from "next";
import { Amiri, Noto_Sans_JP, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { getPrayerConfig, getProfile } from "@/lib/data";
import { ThemeProvider, themeInitScript } from "@/components/shared/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PwaProvider } from "@/components/shared/pwa-provider";
import { PwaRuntime } from "@/components/pwa/pwa-runtime";
import { DonationPosterPopup } from "@/components/promo/donation-poster-popup";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta", display: "swap" });
const notoJp = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-jp", display: "swap", preload: false });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", display: "swap", preload: false });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}`]));
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("siteTitle"), template: t("titleTemplate", { title: "%s" }) },
    description: t("siteDescription"),
    keywords: t("keywords").split(",").map((k) => k.trim()),
    manifest: `/${locale}/manifest.webmanifest`,
    applicationName: "Al Muttaqin",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Al Muttaqin" },
    formatDetection: { telephone: false },
    alternates: { canonical: `${siteUrl}/${locale}`, languages: { ...languages, "x-default": `${siteUrl}/en` } },
    openGraph: {
      type: "website",
      siteName: "Al Muttaqin Cultural Center",
      locale: locale === "ja" ? "ja_JP" : locale === "id" ? "id_ID" : "en_US",
      url: `${siteUrl}/${locale}`,
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: [{ url: "/images/masjid/og.jpg", width: 1200, height: 630, alt: "Al Muttaqin Cultural Center" }],
    },
    twitter: { card: "summary_large_image" },
    icons: {
      icon: [
        { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#800000" },
    { media: "(prefers-color-scheme: dark)", color: "#120504" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [messages, config, profile] = await Promise.all([getMessages(), getPrayerConfig(), getProfile()]);

  return (
    <html lang={locale} suppressHydrationWarning className={`${jakarta.variable} ${notoJp.variable} ${amiri.variable}`}>
      <body className="min-h-dvh flex flex-col">
        {/* Skrip tema di awal <body> (bukan <head> manual) agar hidrasi <head> React tidak bentrok
            dengan metadata Next; tetap berjalan sebelum konten dilukis sehingga tidak berkedip. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <NextIntlClientProvider messages={messages} locale={locale as Locale} timeZone="Asia/Tokyo">
          <ThemeProvider prayerConfig={config} coordinates={profile.coordinates}>
            <TooltipProvider delayDuration={200}>
              <ToastProvider>
                <PwaProvider>
                  {children}
                  <PwaRuntime />
                  <DonationPosterPopup />
                </PwaProvider>
              </ToastProvider>
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
