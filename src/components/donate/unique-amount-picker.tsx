"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import type { Locale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MIN_BASE_AMOUNT,
  QUICK_AMOUNTS,
  formatUniqueCode,
  makeUniqueAmount,
  normalizeBaseAmount,
  randomUniqueCode,
  type DonationCurrency,
} from "@/components/donate/unique-amount";

export type UniqueAmountState = { base: number; code: number } | null;

const CURRENCIES: DonationCurrency[] = ["JPY", "IDR"];

/**
 * Pemilih nominal cepat + input bebas yang menghasilkan nominal unik (PRD-05 §4).
 * Komponen terkontrol: state dipegang DonationFlow agar ikut terisi ke formulir konfirmasi.
 * Kode unik hanya dibuat setelah interaksi pengguna (tidak ada angka acak saat SSR).
 */
export function UniqueAmountPicker({
  locale,
  currency,
  onCurrencyChange,
  value,
  onChange,
  compact = false,
}: {
  locale: Locale;
  currency: DonationCurrency;
  onCurrencyChange: (currency: DonationCurrency) => void;
  value: UniqueAmountState;
  onChange: (next: UniqueAmountState) => void;
  compact?: boolean;
}) {
  const t = useTranslations("donate.unique");
  const ta = useTranslations("donate.accounts");
  const [custom, setCustom] = React.useState("");
  const customId = React.useId();

  const amount = value ? makeUniqueAmount(value.base, currency, value.code) : null;
  const isPreset = value ? QUICK_AMOUNTS[currency].includes(value.base) && custom === "" : false;

  function choosePreset(base: number) {
    setCustom("");
    onChange({ base, code: value?.code ?? randomUniqueCode() });
  }

  function commitCustom() {
    const n = Number(custom);
    if (!custom || !Number.isFinite(n) || n <= 0) return;
    const base = normalizeBaseAmount(n, currency);
    setCustom(String(base));
    onChange({ base, code: value?.code ?? randomUniqueCode() });
  }

  function regenerate() {
    if (!value) return;
    let code = randomUniqueCode();
    if (code === value.code) code = (code % 999) + 1;
    onChange({ base: value.base, code });
  }

  return (
    <div className={cn("grid grid-cols-1 gap-5", !compact && "lg:grid-cols-[1fr_minmax(0,22rem)]")}>
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("currency")}</p>
          <Tabs value={currency} onValueChange={(v) => onCurrencyChange(v as DonationCurrency)}>
            <TabsList className="w-full sm:w-auto" aria-label={t("currency")}>
              {CURRENCIES.map((c) => (
                <TabsTrigger key={c} value={c} className="flex-1 sm:flex-none">
                  {ta(`tabs.${c}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("presets")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={t("presets")}>
            {QUICK_AMOUNTS[currency].map((preset) => {
              const active = isPreset && value?.base === preset;
              return (
                <Button
                  key={preset}
                  variant={active ? "primary" : "outline"}
                  aria-pressed={active}
                  onClick={() => choosePreset(preset)}
                  className="tabular"
                >
                  {formatCurrency(preset, currency, locale)}
                </Button>
              );
            })}
          </div>
        </div>

        <Field label={t("custom")} htmlFor={customId} hint={t("customHint")}>
          <Input
            id={customId}
            type="number"
            inputMode="numeric"
            min={MIN_BASE_AMOUNT[currency]}
            step={1000}
            placeholder={t("customPlaceholder")}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onBlur={commitCustom}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitCustom();
              }
            }}
            className="tabular"
          />
        </Field>
      </div>

      <div className="card-muted flex flex-col justify-center gap-3 p-5 text-center" aria-live="polite">
        {amount !== null && value ? (
          <>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("result")}</p>
            <p className="headline text-brand text-3xl tabular sm:text-4xl">{formatCurrency(amount, currency, locale)}</p>
            <p className="text-xs text-muted-foreground">
              {t("base", { amount: formatCurrency(value.base, currency, locale) })} · {t("code", { code: formatUniqueCode(value.code) })}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <CopyButton value={String(amount)} label={t("copy")} variant="primary" />
              <Button variant="outline" size="sm" onClick={regenerate}>
                <RefreshCw />
                {t("regenerate")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("filled")}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
