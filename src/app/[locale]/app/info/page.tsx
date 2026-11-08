import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getAnnouncements } from "@/lib/data";
import { AppScreenHeader } from "@/components/app/shell";
import { buttonVariants } from "@/components/ui/button";
import { AnnouncementList } from "@/components/activities";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("app.title"), description: t("app.description") };
}

export default async function AppInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, announcements] = await Promise.all([getTranslations({ locale, namespace: "news" }), getTranslations({ locale, namespace: "app" }), getAnnouncements()]);

  return (
    <div>
      <AppScreenHeader title={t("app.title")} description={t("app.description")} backLabel={ta("back")} />
      <AnnouncementList announcements={announcements} locale={locale} share />
      <Link href="/news" className={buttonVariants({ variant: "outline", size: "md", className: "mt-6 w-full" })}>
        {t("app.readOnWeb")}
        <ArrowRight />
      </Link>
    </div>
  );
}
