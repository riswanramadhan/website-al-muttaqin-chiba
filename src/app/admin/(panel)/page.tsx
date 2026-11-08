import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarDays, HandCoins, Inbox, Megaphone, MessageSquare } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { IconCircle } from "@/components/ui/primitives";
import { AdminPageHeader } from "@/components/admin/shell";
import { QuickAnnouncement } from "@/components/admin/quick-announcement";
import { ActivityList } from "@/components/admin/activity-list";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getDashboardStats, listActivity } from "@/components/admin/data";
import { formatAdminNumber } from "@/components/admin/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("dashboard.title"), description: t("dashboard.subtitle") };
}

export default async function AdminDashboardPage() {
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const [stats, activity] = await Promise.all([getDashboardStats(), listActivity(8)]);

  const cards = [
    { key: "announcements", value: stats.announcements, href: "/admin/announcements", icon: <Megaphone /> },
    { key: "events", value: stats.events, href: "/admin/events", icon: <CalendarDays /> },
    { key: "donationsPending", value: stats.donationsPending, href: "/admin/donations", icon: <HandCoins /> },
    { key: "registrations", value: stats.registrations, href: "/admin/inbox", icon: <Inbox /> },
    { key: "suggestions", value: stats.suggestions, href: "/admin/inbox?tab=suggestions", icon: <MessageSquare /> },
    { key: "push", value: stats.push, href: "/admin/push", icon: <Bell /> },
  ];

  return (
    <>
      <AdminPageHeader title={t("dashboard.title")} description={t("dashboard.subtitle")} />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <li key={c.key}>
            <Link href={c.href} className="card-surface lift flex h-full flex-col gap-3 p-4 hover:shadow-soft">
              <IconCircle size="sm" tone="soft">
                {c.icon}
              </IconCircle>
              <span className="tabular text-2xl font-bold sm:text-3xl">{formatAdminNumber(c.value, lang)}</span>
              <span className="text-xs leading-snug text-muted-foreground sm:text-sm">{t(`dashboard.cards.${c.key}`)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardTitle>{t("dashboard.quick.title")}</CardTitle>
          <CardDescription className="mt-1.5">{t("dashboard.quick.description")}</CardDescription>
          <div className="mt-5">
            <QuickAnnouncement guard={guardFor(ctx, ["content_admin"])} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <Link href="/admin/activity" className="text-sm font-semibold text-brand hover:underline">
              {t("dashboard.viewAll")}
            </Link>
          </div>
          <div className="mt-3">
            <ActivityList items={activity} />
          </div>
        </Card>
      </div>
    </>
  );
}
