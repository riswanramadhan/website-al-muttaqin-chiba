import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { loadMessages } from "@/messages";
import type { Locale } from "@/lib/types";

export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Web App Manifest per bahasa: start_url mengarah ke App Jamaah bahasa tersebut
 * (PRD §7: start URL /[locale]/app).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const messages = (await loadMessages(locale)) as { app?: { title?: string; description?: string } };
  const name = locale === "ja" ? "アルムッタキーン文化センター" : "Al Muttaqin Cultural Center";

  const manifest = {
    id: `/${locale}/app`,
    name,
    short_name: "Al Muttaqin",
    description: messages.app?.description ?? "",
    lang: locale,
    dir: "ltr",
    start_url: `/${locale}/app`,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#7f1d1d",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: messages.app?.title ?? "Jamaah App", url: `/${locale}/app`, icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Qibla", url: `/${locale}/app/qibla` },
      { name: "Al-Quran", url: `/${locale}/app/quran` },
      { name: "Infaq", url: `/${locale}/app/donate` },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
