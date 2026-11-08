"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, localeShort, routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher({ tone = "default", className, showLabel = true }: { tone?: "default" | "inverse"; className?: string; showLabel?: boolean }) {
  const t = useTranslations("common.language");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = React.useTransition();

  function change(next: AppLocale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant={tone === "inverse" ? "outlineInverse" : "outline"} size={showLabel ? "sm" : "icon"} aria-label={t("switch")} className={cn(pending && "opacity-60", className)}>
          <Globe />
          {showLabel && <span>{localeShort[locale]}</span>}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-48 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-soft animate-in fade-in-0 zoom-in-95">
          {routing.locales.map((l) => (
            <DropdownMenu.Item
              key={l}
              onSelect={() => change(l)}
              lang={l}
              className={cn("flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none select-none data-[highlighted]:bg-surface", l === locale && "text-brand font-semibold")}
            >
              <span>{localeNames[l]}</span>
              <span className="text-xs text-muted-foreground">{localeShort[l]}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
