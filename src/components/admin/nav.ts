import type { AdminRole } from "@/lib/supabase/admin";

/** Menu sidebar panel admin; `roles` kosong = semua peran (super_admin selalu lolos). */
export type AdminNavItem = { key: string; href: string; icon: AdminNavIcon; roles?: AdminRole[] };
export type AdminNavIcon =
  | "dashboard"
  | "announcements"
  | "events"
  | "jumuah"
  | "lectures"
  | "news"
  | "prayer"
  | "donations"
  | "inbox"
  | "push"
  | "admins"
  | "activity"
  | "profile"
  | "board"
  | "facilities"
  | "timeline"
  | "gallery"
  | "faqs"
  | "programs"
  | "rooms"
  | "halal"
  | "video"
  | "promo"
  | "accounts"
  | "donationPrograms"
  | "reports"
  | "account";
export type AdminNavGroup = { key: "main" | "content" | "site" | "donation" | "service" | "system"; items: AdminNavItem[] };

const CONTENT: AdminRole[] = ["content_admin", "viewer"];
const DONATION: AdminRole[] = ["donation_admin", "viewer"];

export const ADMIN_NAV: AdminNavGroup[] = [
  { key: "main", items: [{ key: "dashboard", href: "/admin", icon: "dashboard" }] },
  {
    key: "content",
    items: [
      { key: "announcements", href: "/admin/announcements", icon: "announcements", roles: CONTENT },
      { key: "events", href: "/admin/events", icon: "events", roles: CONTENT },
      { key: "jumuah", href: "/admin/jumuah", icon: "jumuah", roles: CONTENT },
      { key: "lectures", href: "/admin/lectures", icon: "lectures", roles: CONTENT },
      { key: "news", href: "/admin/news", icon: "news", roles: CONTENT },
      { key: "prayer", href: "/admin/prayer", icon: "prayer", roles: CONTENT },
    ],
  },
  {
    key: "site",
    items: [
      { key: "profile", href: "/admin/settings/profile", icon: "profile", roles: CONTENT },
      { key: "board", href: "/admin/cms/board", icon: "board", roles: CONTENT },
      { key: "facilities", href: "/admin/cms/facilities", icon: "facilities", roles: CONTENT },
      { key: "timeline", href: "/admin/cms/timeline", icon: "timeline", roles: CONTENT },
      { key: "gallery", href: "/admin/cms/gallery", icon: "gallery", roles: CONTENT },
      { key: "programs", href: "/admin/cms/programs", icon: "programs", roles: CONTENT },
      { key: "rooms", href: "/admin/cms/rooms", icon: "rooms", roles: CONTENT },
      { key: "halal", href: "/admin/cms/halal-places", icon: "halal", roles: CONTENT },
      { key: "faqs", href: "/admin/cms/faqs", icon: "faqs", roles: CONTENT },
      { key: "video", href: "/admin/settings/video", icon: "video", roles: CONTENT },
      { key: "promo", href: "/admin/settings/promo", icon: "promo", roles: CONTENT },
    ],
  },
  {
    key: "donation",
    items: [
      { key: "donations", href: "/admin/donations", icon: "donations", roles: ["donation_admin"] },
      { key: "accounts", href: "/admin/cms/donation-accounts", icon: "accounts", roles: DONATION },
      { key: "donationPrograms", href: "/admin/cms/donation-programs", icon: "donationPrograms", roles: DONATION },
      { key: "reports", href: "/admin/cms/transparency-reports", icon: "reports", roles: DONATION },
    ],
  },
  {
    key: "service",
    items: [
      { key: "inbox", href: "/admin/inbox", icon: "inbox", roles: CONTENT },
      { key: "push", href: "/admin/push", icon: "push", roles: ["content_admin"] },
    ],
  },
  {
    key: "system",
    items: [
      { key: "admins", href: "/admin/admins", icon: "admins", roles: ["super_admin"] },
      { key: "activity", href: "/admin/activity", icon: "activity" },
      { key: "account", href: "/admin/account", icon: "account" },
    ],
  },
];

export function canAccess(role: AdminRole | null, item: AdminNavItem): boolean {
  if (!item.roles || item.roles.length === 0) return true;
  if (role === null) return true; // mode demo: semua menu terlihat (hanya-baca)
  return role === "super_admin" || item.roles.includes(role);
}
