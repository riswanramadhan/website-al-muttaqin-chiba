import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, NetworkFirst, Serwist, StaleWhileRevalidate } from "serwist";

/**
 * Service worker App Jamaah (PRD-07 / §7 Offline):
 * - precache halaman inti App & fallback offline untuk ketiga bahasa,
 * - cache runtime untuk API Al-Qur'an, jadwal salat, dan halaman (network-first),
 * - notifikasi push adzan (payload dari /api/push/send).
 */
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const LOCALES = ["ja", "en", "id"] as const;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Teks Al-Qur'an & terjemahan: jarang berubah, simpan lama.
      matcher: ({ url }) => url.hostname === "api.alquran.cloud" || url.hostname === "api.quran.com",
      handler: new CacheFirst({
        cacheName: "quran-api",
        plugins: [new ExpirationPlugin({ maxEntries: 400, maxAgeSeconds: 180 * 24 * 60 * 60 })],
      }),
    },
    {
      // Jadwal salat & data publik aplikasi: tampilkan cache, perbarui di belakang.
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/prayer"),
      handler: new StaleWhileRevalidate({
        cacheName: "prayer-api",
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 7 * 24 * 60 * 60 })],
      }),
    },
    {
      // Thumbnail YouTube
      matcher: ({ url }) => url.hostname === "i.ytimg.com",
      handler: new CacheFirst({
        cacheName: "youtube-thumbs",
        plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
      }),
    },
    {
      // Ubin peta OpenStreetMap
      matcher: ({ url }) => url.hostname.endsWith("tile.openstreetmap.org"),
      handler: new CacheFirst({
        cacheName: "osm-tiles",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 14 * 24 * 60 * 60 })],
      }),
    },
    {
      // Halaman App Jamaah: network-first agar konten segar, tetap terbuka saat offline.
      matcher: ({ request, url, sameOrigin }) => sameOrigin && request.destination === "document" && /^\/(ja|en|id)\/app(\/|$)/.test(url.pathname),
      handler: new NetworkFirst({
        cacheName: "app-pages",
        networkTimeoutSeconds: 4,
        plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: LOCALES.map((locale) => ({
      url: `/${locale}/offline`,
      matcher({ request }) {
        return request.destination === "document" && new URL(request.url).pathname.startsWith(`/${locale}/`);
      },
    })),
  },
});

serwist.addEventListeners();

// ---------------------------------------------------------------
// Notifikasi push adzan (Web Push VAPID). Payload JSON:
// { title, body, url, tag, prayer }
// ---------------------------------------------------------------
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload: { title?: string; body?: string; url?: string; tag?: string } = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Al Muttaqin", body: event.data.text() };
  }
  const title = payload.title ?? "Al Muttaqin";
  const options: NotificationOptions = {
    body: payload.body ?? "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag ?? "adzan",
    data: { url: payload.url ?? "/id/app" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data as { url?: string } | undefined)?.url ?? "/id/app";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
