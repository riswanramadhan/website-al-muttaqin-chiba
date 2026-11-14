"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Bell,
  CalendarClock,
  CalendarDays,
  CircleQuestionMark,
  CircleUserRound,
  Clock,
  Contact,
  DoorOpen,
  ExternalLink,
  FileChartColumn,
  GraduationCap,
  HandCoins,
  IdCard,
  Images,
  Inbox,
  Landmark,
  Languages,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Megaphone,
  Menu,
  Mic,
  Milestone,
  Newspaper,
  Presentation,
  ScrollText,
  Target,
  TriangleAlert,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AdminRole } from "@/lib/supabase/admin";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, SheetContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ADMIN_NAV, canAccess, type AdminNavIcon } from "@/components/admin/nav";
import { useAdminT } from "@/components/admin/i18n-context";
import { ADMIN_LANGS } from "@/components/admin/i18n";
import { DemoBanner } from "@/components/admin/demo-banner";
import { setAdminLang, signOut } from "@/actions/admin/auth";

const ICONS: Record<AdminNavIcon, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  announcements: Megaphone,
  events: CalendarDays,
  jumuah: CalendarClock,
  lectures: Mic,
  news: Newspaper,
  prayer: Clock,
  donations: HandCoins,
  inbox: Inbox,
  push: Bell,
  admins: Users,
  activity: ScrollText,
  profile: Contact,
  board: IdCard,
  facilities: Landmark,
  timeline: Milestone,
  gallery: Images,
  faqs: CircleQuestionMark,
  programs: GraduationCap,
  rooms: DoorOpen,
  halal: MapPinned,
  video: Video,
  promo: Presentation,
  accounts: Banknote,
  donationPrograms: Target,
  reports: FileChartColumn,
  account: CircleUserRound,
};

export type AdminShellUser = { name: string; email: string; role: AdminRole; mustChangePassword?: boolean } | null;

function NavList({ role, onNavigate }: { role: AdminRole | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useAdminT();
  return (
    <nav className="flex flex-col gap-6" aria-label={t("common.menu")}>
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter((item) => canAccess(role, item));
        if (items.length === 0) return null;
        return (
          <div key={group.key}>
            <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t(`nav.groups.${group.key}`)}</p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const Icon = ICONS[item.icon];
                const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground hover:bg-surface",
                      )}
                    >
                      <Icon className="size-4 shrink-0 stroke-[1.5]" />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function LangSwitch() {
  const { lang, t } = useAdminT();
  const [pending, startTransition] = React.useTransition();
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1" role="group" aria-label={t("common.language")}>
      <Languages className="ml-1.5 size-4 text-muted-foreground" aria-hidden />
      {ADMIN_LANGS.map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => setAdminLang(l))}
          className={cn(
            "h-7 rounded-full px-2.5 text-xs font-semibold uppercase transition-colors disabled:opacity-60",
            lang === l ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** Kerangka panel admin: sidebar tetap di desktop, drawer (SheetContent) di mobile. */
export function AdminShell({ user, demo, children }: { user: AdminShellUser; demo: boolean; children: React.ReactNode }) {
  const { t } = useAdminT();
  const [open, setOpen] = React.useState(false);
  const role = user?.role ?? null;

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <LogoMark className="size-9" />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold">{t("common.appName")}</span>
        <span className="text-xs text-muted-foreground">{t("common.siteName")}</span>
      </span>
    </Link>
  );

  const userBlock = (
    <div className="rounded-xl bg-surface p-3 text-sm">
      <p className="truncate font-semibold">{user?.name || t("common.demoUser")}</p>
      {user?.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
      <div className="mt-2 flex items-center justify-between gap-2">
        <Badge variant={demo ? "warning" : "soft"}>{user ? t(`roles.${user.role}`) : t("demo.title").split(":")[0]}</Badge>
        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="iconSm" aria-label={t("common.logout")} onClick={() => signOut()}>
                <LogOut />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("common.logout")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="hidden border-r border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-6 lg:overflow-y-auto lg:p-5">
        {brand}
        <NavList role={role} />
        <div className="mt-auto flex flex-col gap-3">
          <a href="/id" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 text-sm text-muted-foreground hover:text-foreground">
            <ExternalLink className="size-4" />
            {t("common.openSite")}
          </a>
          {userBlock}
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="iconSm" className="lg:hidden" aria-label={t("common.menu")}>
                <Menu />
              </Button>
            </DialogTrigger>
            <SheetContent side="left" closeLabel={t("common.close")} className="gap-6">
              <DialogTitle className="sr-only">{t("common.menu")}</DialogTitle>
              {brand}
              <NavList role={role} onNavigate={() => setOpen(false)} />
              <div className="mt-auto">{userBlock}</div>
            </SheetContent>
          </Dialog>
          <div className="min-w-0 flex-1 lg:hidden">{brand}</div>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitch />
          </div>
        </header>
        {demo && <DemoBanner />}
        {user?.mustChangePassword && (
          <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-warning/30 bg-warning/10 px-4 py-3 text-sm sm:px-6">
            <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden />
            <span className="min-w-0 flex-1">{t("account.mustChange")}</span>
            <Link href="/admin/account" className="font-semibold text-brand hover:underline">
              {t("account.changePassword")}
            </Link>
          </div>
        )}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Kepala halaman admin: judul, deskripsi, aksi di kanan. */
export function AdminPageHeader({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="headline text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
