"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ConfirmationForm, type FormAccount, type FormProgram } from "@/components/donate/confirmation-form";
import { UniqueAmountPicker, type UniqueAmountState } from "@/components/donate/unique-amount-picker";
import { makeUniqueAmount, type DonationCurrency } from "@/components/donate/unique-amount";

/**
 * Alur donasi: pemilih nominal unik + formulir konfirmasi dengan state bersama (PRD-05 §4-5).
 * Menerima hanya data serializable dari Server Component (label sudah dipilih per bahasa).
 */
export function DonationFlow({
  locale,
  programs,
  accounts,
  compact = false,
}: {
  locale: Locale;
  programs: FormProgram[];
  accounts: FormAccount[];
  compact?: boolean;
}) {
  const t = useTranslations("donate");
  const [currency, setCurrency] = React.useState<DonationCurrency>(locale === "id" ? "IDR" : "JPY");
  const [unique, setUnique] = React.useState<UniqueAmountState>(null);
  const amount = unique ? makeUniqueAmount(unique.base, currency, unique.code) : null;

  function changeCurrency(next: DonationCurrency) {
    setCurrency(next);
    setUnique(null);
  }

  return (
    <>
      <section id="unique-amount" className={compact ? "space-y-3" : "space-y-8"} aria-labelledby="unique-amount-title">
        {compact ? (
          <div>
            <h2 id="unique-amount-title" className="text-lg font-bold">
              {t("unique.title")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("unique.description")}</p>
          </div>
        ) : (
          <SectionHeading tag={t("unique.tag")} title={t("unique.title")} highlight={t("unique.highlight")} description={t("unique.description")} />
        )}
        <UniqueAmountPicker locale={locale} currency={currency} onCurrencyChange={changeCurrency} value={unique} onChange={setUnique} compact={compact} />
      </section>

      <section id="confirm" className={compact ? "space-y-3" : "space-y-8"} aria-labelledby="confirm-title">
        {compact ? (
          <div>
            <h2 id="confirm-title" className="text-lg font-bold">
              {t("app.confirmTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("form.description")}</p>
          </div>
        ) : (
          <SectionHeading tag={t("form.tag")} title={t("form.title")} highlight={t("form.highlight")} description={t("form.description")} />
        )}
        <ConfirmationForm locale={locale} programs={programs} accounts={accounts} prefillCurrency={currency} prefillAmount={amount} compact={compact} />
      </section>
    </>
  );
}
