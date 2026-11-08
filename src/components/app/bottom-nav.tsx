"use client";

import * as React from "react";
import { BookOpen, Clock, Heart, House, LayoutGrid } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type BottomTab = { key: string; href: string; label: string };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: House,
  prayer: Clock,
  quran: BookOpen,
  donate: Heart,
  more: LayoutGrid,
};

/** Navigasi bawah App Jamaah (PRD §8: mobile-first, bottom nav). */
export function BottomNav({ tabs, label }: { tabs: BottomTab[]; label: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <nav aria-label={label} className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md safe-bottom">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.key] ?? LayoutGrid;
          const active = isActive(tab.href);
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 pt-2.5 pb-2 text-[0.68rem] font-semibold transition-colors",
                  active ? "text-brand" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-accent")}>
                  <Icon className="size-5 stroke-[1.75]" />
                </span>
                <span className="truncate">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
