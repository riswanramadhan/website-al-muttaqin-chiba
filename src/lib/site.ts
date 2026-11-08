/** URL publik situs; dipakai metadata, sitemap, manifest, dan JSON-LD. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const siteName = "Al Muttaqin Cultural Center";
