import type { AdminRole } from "@/lib/supabase/admin";

/** Menu sidebar panel admin; `roles` kosong = semua peran (super_admin selalu lolos). */
export type AdminNavItem = { key: string; href: string; icon: AdminNavIcon; roles?: AdminRole[] };
export type AdminNavIcon = "dashboard" | "announcements" | "events" | "jumuah" | "lectures" | "news" | "prayer" | "donations" | "inbox" | "push" | "admins" | "activity";
export type AdminNavGroup = { key: "main" | "content" | "service" | "system"; items: AdminNavItem[] };

const CONTENT: AdminRole[] = ["content_admin", "viewer"];

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
    key: "service",
    items: [
      { key: "donations", href: "/admin/donations", icon: "donations", roles: ["donation_admin"] },
      { key: "inbox", href: "/admin/inbox", icon: "inbox", roles: CONTENT },
      { key: "push", href: "/admin/push", icon: "push", roles: ["content_admin"] },
    ],
  },
  {
    key: "system",
    items: [
      { key: "admins", href: "/admin/admins", icon: "admins", roles: ["super_admin"] },
      { key: "activity", href: "/admin/activity", icon: "activity" },
    ],
  },
];

export function canAccess(role: AdminRole | null, item: AdminNavItem): boolean {
  if (!item.roles || item.roles.length === 0) return true;
  if (role === null) return true; // mode demo: semua menu terlihat (hanya-baca)
  return role === "super_admin" || item.roles.includes(role);
}
