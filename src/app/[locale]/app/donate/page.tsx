import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Calculator, ChevronRight, FileText, Globe } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getDonationAccounts, getDonationPrograms } from "@/lib/data";
import { pick } from "@/lib/utils/i18n";
import { AppScreenHeader } from "@/components/app/shell";
import { IconCircle } from "@/components/ui/primitives";
import { DonationAccountsList, DonationFlow } from "@/components/donate";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "donate" });
  return { title: t("app.title"), description: t("app.description") };
}

/** Layar Infaq App Jamaah (PRD-05): rekening + QRIS, nominal unik, konfirmasi satu kolom. */
export default async function AppDonatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, programs, accounts] = await Promise.all([
    getTranslations({ locale, namespace: "donate" }),
    getTranslations({ locale, namespace: "app" }),
    getDonationPrograms(),
    getDonationAccounts(),
  ]);

  const formPrograms = programs.filter((p) => p.status === "open").map((p) => ({ slug: p.slug, label: pick(p.title, locale) }));
  const formAccounts = accounts.map((a) => ({
    id: a.id,
    label: `${pick(a.bankNameLocalized, locale) || a.bankName} · ${a.accountNumber}`,
    currency: a.currency,
  }));

  const links = [
    { href: "/donate/zakat", label: t("app.zakatLink"), Icon: Calculator },
    { href: "/transparency", label: t("app.transparencyLink"), Icon: FileText },
    { href: "/donate", label: t("app.moreOnWeb"), Icon: Globe },
  ] as const;

  return (
    <div className="space-y-8">
      <AppScreenHeader title={t("app.title")} description={t("app.description")} backLabel={ta("back")} />

      <section aria-label={t("accounts.tag")}>
        <DonationAccountsList locale={locale} compact />
      </section>

      <DonationFlow locale={locale} programs={formPrograms} accounts={formAccounts} compact />

      <ul className="space-y-2">
        {links.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link href={href} className="card-surface lift flex items-center gap-3 p-4 text-sm font-semibold">
              <IconCircle tone="soft" shape="square" size="sm">
                <Icon />
              </IconCircle>
              <span className="flex-1">{label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
