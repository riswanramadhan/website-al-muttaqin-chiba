import * as React from "react";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { APP_TABS } from "@/components/site/nav-config";
import { BottomNav } from "@/components/app/bottom-nav";
import { LogoMark } from "@/components/site/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * Kerangka App Jamaah: bilah atas ringkas, konten selebar HP (maks 28rem) di desktop,
 * dan navigasi bawah. Layar lain cukup merender isinya.
 *
 * Safe area iPhone: layout akar memakai `viewportFit: "cover"` + status bar `black-translucent`,
 * jadi konten digambar di belakang jam/notch. Header diberi `safe-top` (padding
 * env(safe-area-inset-top)) agar isinya turun di bawah status bar, sementara latarnya tetap
 * memanjang ke belakang status bar. Pita setinggi inset itu berwarna gelap (`bg-hero`) karena
 * teks status bar `black-translucent` selalu putih. Inset kiri/kanan dipakai saat lanskap.
 */
export async function AppShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const [t, tc] = await Promise.all([getTranslations({ locale, namespace: "app" }), getTranslations({ locale, namespace: "common" })]);
  const tabs = APP_TABS.map((tab) => ({ ...tab, label: t(`tabs.${tab.key}`) }));

  return (
    <div className="min-h-dvh bg-surface/60">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] backdrop-blur-md safe-top">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[env(safe-area-inset-top,0px)] bg-hero" />
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2" aria-label={tc("siteName")}>
            <LogoMark className="size-8 shrink-0" />
            <span className="truncate text-sm font-bold text-heading">{t("title")}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "iconSm" }), "hidden sm:inline-flex")} aria-label={t("backToWeb")}>
              <ArrowLeft />
            </Link>
            <LanguageSwitcher showLabel={false} />
            <Link href="/app/settings" className={buttonVariants({ variant: "ghost", size: "iconSm" })} aria-label={t("tabs.settings")}>
              <Settings />
            </Link>
          </div>
        </div>
      </header>
      <main
        id="content"
        className="mx-auto w-full max-w-md pt-4 pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pl-[max(1rem,env(safe-area-inset-left))]"
      >
        {children}
      </main>
      <BottomNav tabs={tabs} label={t("navLabel")} />
    </div>
  );
}

/** Judul layar App dengan tombol kembali. */
export function AppScreenHeader({ title, description, backHref = "/app", backLabel, action }: { title: string; description?: string; backHref?: string; backLabel: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <Link href={backHref} className={buttonVariants({ variant: "outline", size: "iconSm" })} aria-label={backLabel}>
        <ArrowLeft />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold leading-tight">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Kredit pengembang di bagian bawah layar Pengaturan & Menu App. */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <p className={cn("mt-8 text-center text-xs text-muted-foreground", className)}>
      Powered by{" "}
      <a href="https://dekatlokal.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
        dekatlokal
      </a>
    </p>
  );
}
