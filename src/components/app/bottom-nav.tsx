"use client";

import { BookOpen, Clock, Heart, House, LayoutGrid, type LucideIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { Icon3D } from "@/components/ui/icon-3d";
import { TAB_TONES } from "@/components/app/screen-icons";

export type BottomTab = { key: string; href: string; label: string };

const ICONS: Record<string, LucideIcon> = {
  home: House,
  prayer: Clock,
  quran: BookOpen,
  donate: Heart,
  more: LayoutGrid,
};

/**
 * Navigasi bawah App Jamaah (PRD §8: mobile-first, bottom nav) bergaya aplikasi super:
 * tab aktif memakai ubin ikon 3D kecil, tab lain ikon garis yang bersih.
 * `safe-bottom` menambah padding setinggi home indicator iPhone; inset kiri/kanan untuk lanskap.
 */
export function BottomNav({ tabs, label }: { tabs: BottomTab[]; label: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] backdrop-blur-md safe-bottom"
    >
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
                  "group flex min-h-14 flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5 text-[0.68rem] font-semibold transition-colors",
                  active ? "text-brand" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="flex size-8 items-center justify-center">
                  {active ? (
                    <Icon3D icon={Icon} tone={TAB_TONES[tab.key] ?? "maroon"} size="xs" className="duration-300 motion-safe:animate-in motion-safe:zoom-in-50" />
                  ) : (
                    <Icon className="size-[1.35rem] stroke-[1.75] transition-transform group-active:scale-90" aria-hidden />
                  )}
                </span>
                <span className="max-w-full truncate">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
