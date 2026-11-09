import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Plus_Jakarta_Sans } from "next/font/google";
import { themeInitScript } from "@/components/shared/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminI18nProvider } from "@/components/admin/i18n-context";
import { getAdminT } from "@/components/admin/lang.server";
import "@/app/globals.css";

/**
 * Root layout panel admin (PRD-09): di luar segmen [locale], tanpa next-intl.
 * Bahasa UI (id | ja) dari cookie `acc-admin-lang`.
 */
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta", display: "swap" });
const notoJp = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-jp", display: "swap", preload: false });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return {
    title: { default: `${t("meta.title")} | Al Muttaqin`, template: `%s | ${t("meta.title")}` },
    description: t("meta.description"),
    robots: { index: false, follow: false },
    icons: { icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }] },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7f1d1d" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { lang } = await getAdminT();
  return (
    <html lang={lang} suppressHydrationWarning className={`${jakarta.variable} ${notoJp.variable}`}>
      <body className="min-h-dvh">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <AdminI18nProvider lang={lang}>
          <TooltipProvider delayDuration={200}>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </AdminI18nProvider>
      </body>
    </html>
  );
}
