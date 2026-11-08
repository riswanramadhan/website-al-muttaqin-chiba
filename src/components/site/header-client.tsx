"use client";

import * as React from "react";
import { ChevronDown, Menu, Smartphone } from "lucide-react";
import { DropdownMenu, Dialog as DialogPrimitive } from "radix-ui";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/site/logo";
import { SearchTrigger } from "@/components/site/search-trigger";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

export type HeaderLink = { key: string; href: string; label: string; description?: string };
export type HeaderData = {
  siteName: string;
  tagline: string;
  primary: HeaderLink[];
  groups: { key: string; label: string; links: HeaderLink[] }[];
  labels: { openMenu: string; closeMenu: string; mainNav: string; openApp: string; skip: string };
};

export function HeaderClient({ data }: { data: HeaderData }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup menu saat rute berganti (pola "sesuaikan state saat render", tanpa setState di effect).
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={cn("sticky top-0 z-40 w-full border-b border-transparent bg-background/80 backdrop-blur-md transition-colors", scrolled && "border-border")}>
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        {data.labels.skip}
      </a>
      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Logo name={data.siteName} subtitle={data.tagline} />

        <nav aria-label={data.labels.mainNav} className="hidden items-center gap-0.5 xl:flex">
          {data.primary.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors hover:bg-surface",
                isActive(l.href) ? "text-brand" : "text-foreground/80",
              )}
            >
              {l.label}
            </Link>
          ))}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface data-[state=open]:bg-surface">
              <Menu className="size-4" />
              <ChevronDown className="size-3.5" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={10}
                className="z-50 w-[min(92vw,960px)] rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-soft animate-in fade-in-0 zoom-in-95"
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 xl:grid-cols-5">
                  {data.groups.map((g) => (
                    <div key={g.key}>
                      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{g.label}</p>
                      <ul className="space-y-1">
                        {g.links.map((l) => (
                          <li key={l.key}>
                            <DropdownMenu.Item asChild>
                              <Link href={l.href} className="block rounded-lg px-2 py-1.5 outline-none data-[highlighted]:bg-surface">
                                <span className={cn("block text-sm font-semibold", isActive(l.href) && "text-brand")}>{l.label}</span>
                                {l.description && <span className="block text-xs text-muted-foreground">{l.description}</span>}
                              </Link>
                            </DropdownMenu.Item>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>

        <div className="flex items-center gap-1.5">
          <SearchTrigger />
          <div className="hidden items-center gap-1.5 md:flex">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <Link href="/app" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
            <Smartphone />
            <span>{data.labels.openApp}</span>
          </Link>

          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label={data.labels.openMenu}>
                <Menu />
              </Button>
            </DialogPrimitive.Trigger>
            <SheetContent side="right" closeLabel={data.labels.closeMenu} className="pt-16">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <nav aria-label={data.labels.mainNav} className="mt-2 flex flex-col gap-6">
                {data.groups.map((g) => (
                  <div key={g.key}>
                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{g.label}</p>
                    <ul className="flex flex-col">
                      {g.links.map((l) => (
                        <li key={l.key}>
                          <Link href={l.href} className={cn("block rounded-lg px-2 py-2 text-base font-semibold hover:bg-surface", isActive(l.href) && "text-brand")}>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
              <Link href="/app" className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full")}>
                <Smartphone />
                <span>{data.labels.openApp}</span>
              </Link>
            </SheetContent>
          </DialogPrimitive.Root>
        </div>
      </div>
    </header>
  );
}
