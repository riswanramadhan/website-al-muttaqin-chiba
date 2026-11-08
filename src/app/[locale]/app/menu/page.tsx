import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { APP_SCREENS } from "@/components/site/nav-config";
import { SCREEN_ICONS, SCREEN_TONES } from "@/components/app/screen-icons";
import { AppScreenHeader, PoweredBy } from "@/components/app/shell";
import { IconCircle } from "@/components/ui/primitives";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return { title: t("menu.title"), description: t("menu.description") };
}

/** Semua fitur App Jamaah dalam grid ikon 3D (gaya aplikasi super). */
export default async function AppMenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "app" });

  return (
    <div>
      <AppScreenHeader title={t("menu.title")} description={t("menu.description")} backLabel={t("back")} />
      <section className="card-surface px-2 py-5">
        <ul className="grid grid-cols-4 gap-x-1 gap-y-5">
          {APP_SCREENS.map((s) => {
            const Icon = SCREEN_ICONS[s.key];
            return (
              <li key={s.key}>
                <Link href={s.href} className="group flex flex-col items-center gap-2 rounded-xl px-0.5 text-center text-[0.7rem] leading-tight font-semibold">
                  <IconCircle shape="square" color={SCREEN_TONES[s.key]}>
                    {Icon ? <Icon /> : null}
                  </IconCircle>
                  <span className="line-clamp-2 break-words">{t(`screens.${s.key}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <PoweredBy />
    </div>
  );
}
