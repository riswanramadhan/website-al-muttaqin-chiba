import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, CacheableResponsePlugin, ExpirationPlugin, NetworkFirst, RangeRequestsPlugin, Serwist, StaleWhileRevalidate } from "serwist";
import { SW_REMINDER_MESSAGE, type ReminderPushPayload, type SwReminderMessage } from "@/components/pwa/reminder-message";

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
      // Suara adzan (public/audio): simpan setelah diputar sekali agar tetap berbunyi saat offline.
      // RangeRequestsPlugin melayani permintaan Range dari elemen <audio> (Safari) dari cache.
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/audio/"),
      handler: new CacheFirst({
        cacheName: "adhan-audio",
        plugins: [new CacheableResponsePlugin({ statuses: [200] }), new RangeRequestsPlugin(), new ExpirationPlugin({ maxEntries: 6, maxAgeSeconds: 365 * 24 * 60 * 60 })],
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
// Notifikasi push pengingat (Web Push VAPID). Payload JSON: ReminderPushPayload
// { title, body, url, tag, kind?, prayer?, at?, actions? }.
// Browser tidak mengizinkan suara kustom untuk notifikasi latar belakang; suara adzan
// diputar oleh halaman App bila sedang terbuka (pesan SW_REMINDER_MESSAGE ke jendela).
// ---------------------------------------------------------------
const ADHAN_VIBRATE = [600, 250, 600, 250, 900];
const REMINDER_VIBRATE = [250, 120, 250];

function parsePayload(data: PushMessageData): ReminderPushPayload {
  try {
    const raw = data.json() as Partial<ReminderPushPayload>;
    return {
      title: raw.title ?? "Al Muttaqin",
      body: raw.body ?? "",
      url: raw.url ?? "/id/app",
      tag: raw.tag ?? "adzan",
      kind: raw.kind,
      prayer: raw.prayer,
      at: raw.at,
      actions: raw.actions,
    };
  } catch {
    return { title: "Al Muttaqin", body: data.text(), url: "/id/app", tag: "adzan" };
  }
}

async function showReminder(payload: ReminderPushPayload): Promise<void> {
  const isAdhan = payload.kind === "adhan";
  const isReminder = isAdhan || payload.kind === "iqamah" || payload.kind === "jumuah";
  // Notifikasi dengan tag sama sudah tampil (mis. dari pengingat lokal App): ganti tanpa berbunyi lagi.
  const existing = await self.registration.getNotifications({ tag: payload.tag }).catch(() => [] as Notification[]);
  const options: NotificationOptions & { renotify?: boolean; vibrate?: number[]; actions?: { action: string; title: string }[]; timestamp?: number } = {
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag,
    renotify: existing.length === 0,
    requireInteraction: isAdhan,
    vibrate: isAdhan ? ADHAN_VIBRATE : isReminder ? REMINDER_VIBRATE : undefined,
    timestamp: payload.at ? Date.parse(payload.at) : Date.now(),
    data: { url: payload.url, kind: payload.kind, tag: payload.tag },
  };
  if (payload.actions) {
    options.actions = [
      { action: "open", title: payload.actions.open },
      { action: "dismiss", title: payload.actions.dismiss },
    ];
  }
  await self.registration.showNotification(payload.title, options);
}

/** Beri tahu jendela App yang terbuka agar memutar suara adzan & menampilkan banner. */
async function notifyClients(payload: ReminderPushPayload): Promise<void> {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const message: SwReminderMessage = { type: SW_REMINDER_MESSAGE, payload };
  for (const client of clients) client.postMessage(message);
}

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = parsePayload(event.data);
  event.waitUntil(Promise.all([showReminder(payload), notifyClients(payload).catch(() => undefined)]));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const target = (event.notification.data as { url?: string } | undefined)?.url ?? "/id/app";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          await client.navigate(target).catch(() => null);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
