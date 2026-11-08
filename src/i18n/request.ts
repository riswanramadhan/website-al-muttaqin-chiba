import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { loadMessages } from "@/messages";
import type { Locale } from "@/lib/types";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Asia/Tokyo",
    // Jangan hentikan render hanya karena satu terjemahan hilang; kunci EN sudah
    // digabung sebagai fallback di loadMessages, ini pengaman terakhir.
    onError(error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[i18n]", error.message);
      }
    },
    getMessageFallback({ namespace, key }) {
      return `${namespace ? namespace + "." : ""}${key}`;
    },
  };
});
