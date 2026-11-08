import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { APP_SCREENS } from "@/components/site/nav-config";
import { SCREEN_ICONS } from "@/components/app/screen-icons";
import { AppScreenHeader } from "@/components/app/shell";
import { IconCircle } from "@/components/ui/primitives";

export default async function AppMenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "app" });

  return (
    <div>
      <AppScreenHeader title={t("menu.title")} description={t("menu.description")} backLabel={t("back")} />
      <ul className="grid grid-cols-2 gap-3">
        {APP_SCREENS.map((s) => {
          const Icon = SCREEN_ICONS[s.key];
          return (
            <li key={s.key}>
              <Link href={s.href} className="card-surface lift flex h-full flex-col gap-3 p-4">
                <IconCircle tone="soft" shape="square" size="sm">
                  {Icon ? <Icon /> : null}
                </IconCircle>
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {t(`screens.${s.key}`)}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
