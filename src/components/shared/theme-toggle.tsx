"use client";

import * as React from "react";
import { Monitor, Moon, Sun, Sunset } from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import { useTheme, type ThemeMode } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils/cn";

const MODES: { value: ThemeMode; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
  { value: "sun", icon: Sunset },
];

export function ThemeToggle({ tone = "default", className }: { tone?: "default" | "inverse"; className?: string }) {
  const t = useTranslations("common.theme");
  const { theme, resolved, setTheme } = useTheme();
  const Icon = resolved === "dark" ? Moon : Sun;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant={tone === "inverse" ? "outlineInverse" : "ghost"} size="icon" aria-label={t("label")} className={className}>
          <Icon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-soft animate-in fade-in-0 zoom-in-95"
        >
          {MODES.map(({ value, icon: ItemIcon }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setTheme(value)}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-sm outline-none select-none data-[highlighted]:bg-surface",
                theme === value && "text-brand font-semibold",
              )}
            >
              <ItemIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="block">{t(value)}</span>
                {value === "sun" && <span className="block text-xs font-normal text-muted-foreground">{t("sunHint")}</span>}
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
