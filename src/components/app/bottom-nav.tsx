"use client";

import { BookOpen, Clock, Heart, House, LayoutGrid, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { TAB_TONES } from "@/components/app/screen-icons";

export type BottomTab = { key: string; href: string; label: string };

const ICONS: Record<string, LucideIcon> = {
  home: House,
  prayer: Clock,
  quran: BookOpen,
  donate: Heart,
  more: LayoutGrid,
};

const SPRING = { type: "spring", stiffness: 520, damping: 36, mass: 0.8 } as const;

/**
 * Navigasi bawah App Jamaah (PRD §8: mobile-first, bottom nav), gaya aplikasi modern:
 * - bilah mengambang membulat di atas home indicator iPhone (`safe-area-inset-bottom`),
 * - lima kolom sama lebar; setiap ikon di kotak 44 px yang sama sehingga sejajar presisi,
 * - "pill" 3D tab aktif meluncur antartab (Motion `layoutId`), ikon aktif memantul kecil,
 *   dan semua tombol mengecil sesaat saat diketuk,
 * - menghormati `prefers-reduced-motion` (tanpa luncuran/pantulan).
 */
export function BottomNav({ tabs, label }: { tabs: BottomTab[]; label: string }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <nav
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))]"
    >
      <ul className="pointer-events-auto mx-auto grid h-[4.25rem] max-w-md grid-cols-5 items-stretch rounded-[1.75rem] border border-border/80 bg-card/90 px-1.5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45),0_2px_8px_-2px_rgb(0_0_0/0.12)] backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.key] ?? LayoutGrid;
          const active = isActive(tab.href);
          return (
            <li key={tab.key} className="flex">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="group flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <motion.span
                  whileTap={reduce ? undefined : { scale: 0.84 }}
                  transition={SPRING}
                  className="relative flex size-11 items-center justify-center"
                >
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "app-tab-pill"}
                      transition={SPRING}
                      data-tone={TAB_TONES[tab.key] ?? "maroon"}
                      className="icon-3d absolute inset-x-0.5 inset-y-1 rounded-[0.95rem]"
                      aria-hidden
                    />
                  )}
                  <motion.span
                    key={active ? "on" : "off"}
                    initial={reduce || !active ? false : { scale: 0.55, y: 3 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={SPRING}
                    className="relative flex items-center justify-center"
                  >
                    <Icon
                      className={cn(
                        "size-[1.3rem] transition-colors duration-200",
                        active ? "stroke-[2.1] text-white drop-shadow-[0_1px_1px_rgb(0_0_0/0.3)]" : "stroke-[1.75] text-muted-foreground group-hover:text-foreground",
                      )}
                      aria-hidden
                    />
                  </motion.span>
                </motion.span>
                <span
                  className={cn(
                    "block h-4 max-w-full truncate px-0.5 text-center text-[0.66rem] leading-4 transition-colors duration-200",
                    active ? "font-bold text-brand" : "font-medium text-muted-foreground",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
