/**
 * Struktur navigasi situs. Label dan deskripsi diambil dari messages/nav.json
 * memakai `key`; href relatif terhadap locale (dipakai dengan Link dari @/i18n/navigation).
 */
export type NavLink = { key: string; href: string };
export type NavGroup = { key: "worship" | "learn" | "community" | "support" | "about"; links: NavLink[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "worship",
    links: [
      { key: "prayerTimes", href: "/prayer-times" },
      { key: "jumuah", href: "/jumuah" },
      { key: "app", href: "/app" },
    ],
  },
  {
    key: "learn",
    links: [
      { key: "lectures", href: "/lectures" },
      { key: "programs", href: "/programs" },
      { key: "islam", href: "/islam" },
      { key: "dictionary", href: "/dictionary" },
    ],
  },
  {
    key: "community",
    links: [
      { key: "events", href: "/events" },
      { key: "news", href: "/news" },
      { key: "newcomers", href: "/newcomers" },
      { key: "halal", href: "/halal" },
      { key: "gallery", href: "/gallery" },
      { key: "booking", href: "/booking" },
    ],
  },
  {
    key: "support",
    links: [
      { key: "donate", href: "/donate" },
      { key: "transparency", href: "/transparency" },
    ],
  },
  {
    key: "about",
    links: [
      { key: "about", href: "/about" },
      { key: "faq", href: "/faq" },
      { key: "contact", href: "/contact" },
    ],
  },
];

/** Tautan utama di bilah atas desktop (sisanya ada di menu). */
export const PRIMARY_LINKS: NavLink[] = [
  { key: "prayerTimes", href: "/prayer-times" },
  { key: "lectures", href: "/lectures" },
  { key: "events", href: "/events" },
  { key: "programs", href: "/programs" },
  { key: "donate", href: "/donate" },
  { key: "about", href: "/about" },
];

/** Layar App Jamaah (navigasi bawah + menu "Lainnya"). */
export const APP_TABS: NavLink[] = [
  { key: "home", href: "/app" },
  { key: "prayer", href: "/app/prayer" },
  { key: "quran", href: "/app/quran" },
  { key: "donate", href: "/app/donate" },
  { key: "more", href: "/app/menu" },
];

export const APP_SCREENS: NavLink[] = [
  { key: "prayer", href: "/app/prayer" },
  { key: "qibla", href: "/app/qibla" },
  { key: "quran", href: "/app/quran" },
  { key: "dua", href: "/app/dua" },
  { key: "tasbih", href: "/app/tasbih" },
  { key: "hijri", href: "/app/hijri" },
  { key: "live", href: "/app/live" },
  { key: "agenda", href: "/app/agenda" },
  { key: "info", href: "/app/info" },
  { key: "donate", href: "/app/donate" },
  { key: "dictionary", href: "/app/dictionary" },
  { key: "radar", href: "/app/radar" },
  { key: "help", href: "/app/help" },
  { key: "settings", href: "/app/settings" },
];
