import { createSerwistRoute } from "@serwist/turbopack";

/**
 * Menyajikan service worker (/serwist/sw.js) yang dibangun dari src/app/sw.ts.
 * Revisi precache berubah setiap build agar halaman inti diperbarui.
 */
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.BUILD_ID ?? String(Date.now());

const LOCALES = ["ja", "en", "id"];
const CORE_PAGES = ["/offline", "/app", "/app/prayer", "/app/qibla", "/app/dua", "/app/dictionary", "/app/menu"];

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: LOCALES.flatMap((locale) => CORE_PAGES.map((page) => ({ url: `/${locale}${page}`, revision }))),
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
