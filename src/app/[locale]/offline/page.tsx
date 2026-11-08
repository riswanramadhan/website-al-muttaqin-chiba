import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { OfflineRetry } from "@/app/[locale]/offline/retry";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offline" });
  return { title: t("title"), robots: { index: false } };
}

/** Halaman fallback offline; di-precache service worker untuk setiap bahasa. */
export default async function OfflinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "offline" });
  return (
    <div className="container-narrow flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <IconCircle size="lg" tone="soft">
        <WifiOff />
      </IconCircle>
      <h1 className="headline mt-6 text-3xl">{t("title")}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{t("body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/app" className={buttonVariants({ size: "lg" })}>
          {t("openApp")}
        </Link>
        <OfflineRetry label={t("retry")} />
      </div>
    </div>
  );
}
