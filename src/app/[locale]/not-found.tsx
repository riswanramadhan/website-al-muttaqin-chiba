import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  const t = useTranslations("notFound");
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-brand text-sm font-semibold tracking-wide uppercase">404</p>
      <h1 className="headline mt-3 text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{t("body")}</p>
      <Link href="/" className={`${buttonVariants({ size: "lg" })} mt-8`}>
        {t("backHome")}
      </Link>
    </div>
  );
}
