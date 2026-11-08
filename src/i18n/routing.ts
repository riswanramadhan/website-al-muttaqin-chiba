import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "en", "id"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];

export const localeNames: Record<AppLocale, string> = {
  ja: "日本語",
  en: "English",
  id: "Bahasa Indonesia",
};

export const localeShort: Record<AppLocale, string> = {
  ja: "JA",
  en: "EN",
  id: "ID",
};

export const htmlLang: Record<AppLocale, string> = {
  ja: "ja",
  en: "en",
  id: "id",
};
