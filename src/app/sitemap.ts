import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import { getEvents, getLectures, getNews, getPrograms } from "@/lib/data";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/prayer-times", priority: 0.9, changeFrequency: "daily" },
  { path: "/jumuah", priority: 0.9, changeFrequency: "weekly" },
  { path: "/lectures", priority: 0.8, changeFrequency: "weekly" },
  { path: "/events", priority: 0.8, changeFrequency: "weekly" },
  { path: "/news", priority: 0.7, changeFrequency: "weekly" },
  { path: "/donate", priority: 0.9, changeFrequency: "monthly" },
  { path: "/donate/zakat", priority: 0.6, changeFrequency: "yearly" },
  { path: "/transparency", priority: 0.6, changeFrequency: "monthly" },
  { path: "/newcomers", priority: 0.7, changeFrequency: "monthly" },
  { path: "/halal", priority: 0.7, changeFrequency: "monthly" },
  { path: "/dictionary", priority: 0.5, changeFrequency: "monthly" },
  { path: "/programs", priority: 0.8, changeFrequency: "monthly" },
  { path: "/booking", priority: 0.5, changeFrequency: "yearly" },
  { path: "/islam", priority: 0.7, changeFrequency: "yearly" },
  { path: "/gallery", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/about", priority: 0.7, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/app", priority: 0.8, changeFrequency: "daily" },
];

function entry(path: string, extra: Partial<MetadataRoute.Sitemap[number]> = {}): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}${path}`,
    lastModified: extra.lastModified ?? new Date(),
    changeFrequency: extra.changeFrequency ?? "weekly",
    priority: extra.priority ?? 0.5,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news, lectures, programs] = await Promise.all([getEvents(), getNews(), getLectures(), getPrograms()]);
  const out: MetadataRoute.Sitemap = [];
  for (const r of STATIC_ROUTES) out.push(...entry(r.path, { priority: r.priority, changeFrequency: r.changeFrequency }));
  for (const e of events) out.push(...entry(`/events/${e.slug}`, { priority: 0.6, lastModified: new Date(e.startsAt) }));
  for (const n of news) out.push(...entry(`/news/${n.slug}`, { priority: 0.5, lastModified: new Date(n.publishedAt) }));
  for (const l of lectures) out.push(...entry(`/lectures/${l.slug}`, { priority: 0.5, lastModified: new Date(l.publishedAt) }));
  for (const p of programs) out.push(...entry(`/programs/${p.slug}`, { priority: 0.6 }));
  return out;
}
