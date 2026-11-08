import type { Locale } from "@/lib/types";
import { getDonationAccounts } from "@/lib/data";
import { AccountTabs } from "@/components/donate/account-tabs";

/**
 * Rekening resmi (PRD-05 §3). Server Component yang mengambil data dan menyerahkan
 * daftar rekening ke tab JPY/IDR (client). Bahasa Indonesia membuka tab Rupiah lebih dulu.
 */
export async function DonationAccountsList({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const accounts = await getDonationAccounts();
  return <AccountTabs accounts={accounts} locale={locale} compact={compact} defaultCurrency={locale === "id" ? "IDR" : "JPY"} />;
}
