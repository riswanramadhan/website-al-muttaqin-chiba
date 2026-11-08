import * as React from "react";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <SiteHeader locale={locale as Locale} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale as Locale} />
    </>
  );
}
