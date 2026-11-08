"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Coins, RotateCw, Wallet, Wheat } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { IconCircle } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEFAULT_GOLD_PRICE_JPY_PER_GRAM,
  DEFAULT_IDR_PER_JPY,
  DEFAULT_RICE_PRICE_JPY_PER_KG,
  calcZakatFitrah,
  calcZakatIncome,
  calcZakatMaal,
  convert,
  fromJpy,
  type ZakatCurrency,
} from "@/components/donate/zakat-math";

type Tab = "maal" | "income" | "fitrah";

const num = (s: string): number => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

/** Kalkulator zakat (PRD-05): Maal, Penghasilan, Fitrah. Semua hitungan di klien, tanpa penyimpanan. */
export function ZakatCalculator({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const t = useTranslations("zakat");
  const id = React.useId();

  const [currency, setCurrency] = React.useState<ZakatCurrency>(locale === "id" ? "IDR" : "JPY");
  const [rate, setRate] = React.useState(String(DEFAULT_IDR_PER_JPY));
  const idrPerJpy = num(rate) > 0 ? num(rate) : DEFAULT_IDR_PER_JPY;
  const defaultGold = (c: ZakatCurrency, r: number) => String(Math.round(fromJpy(DEFAULT_GOLD_PRICE_JPY_PER_GRAM, c, r)));
  const defaultRice = (c: ZakatCurrency, r: number) => String(Math.round(fromJpy(DEFAULT_RICE_PRICE_JPY_PER_KG, c, r)));

  const [goldPrice, setGoldPrice] = React.useState(() => defaultGold(currency, DEFAULT_IDR_PER_JPY));
  const [ricePrice, setRicePrice] = React.useState(() => defaultRice(currency, DEFAULT_IDR_PER_JPY));
  const [tab, setTab] = React.useState<Tab>("maal");

  const [maal, setMaal] = React.useState({ goldGrams: "", silverValue: "", savings: "", receivables: "", tradeGoods: "", debts: "" });
  const [income, setIncome] = React.useState({ amount: "", period: "monthly" as "monthly" | "yearly" });
  const [fitrah, setFitrah] = React.useState({ persons: "1" });

  function changeCurrency(next: ZakatCurrency) {
    setCurrency(next);
    setGoldPrice(defaultGold(next, idrPerJpy));
    setRicePrice(defaultRice(next, idrPerJpy));
  }

  function resetAll() {
    setRate(String(DEFAULT_IDR_PER_JPY));
    setGoldPrice(defaultGold(currency, DEFAULT_IDR_PER_JPY));
    setRicePrice(defaultRice(currency, DEFAULT_IDR_PER_JPY));
    setMaal({ goldGrams: "", silverValue: "", savings: "", receivables: "", tradeGoods: "", debts: "" });
    setIncome({ amount: "", period: "monthly" });
    setFitrah({ persons: "1" });
  }

  const money = (v: number) => formatCurrency(v, currency, locale);
  const other: ZakatCurrency = currency === "JPY" ? "IDR" : "JPY";
  const equivalent = (v: number) => formatCurrency(convert(v, currency, other, idrPerJpy), other, locale);

  const maalResult = calcZakatMaal({
    goldGrams: num(maal.goldGrams),
    goldPricePerGram: num(goldPrice),
    silverValue: num(maal.silverValue),
    savings: num(maal.savings),
    receivables: num(maal.receivables),
    tradeGoods: num(maal.tradeGoods),
    debts: num(maal.debts),
  });
  const incomeResult = calcZakatIncome({ amount: num(income.amount), period: income.period, goldPricePerGram: num(goldPrice) });
  const fitrahResult = calcZakatFitrah({ persons: num(fitrah.persons), ricePricePerKg: num(ricePrice) });

  const resultAmount = tab === "maal" ? maalResult.zakat : tab === "income" ? (income.period === "monthly" ? incomeResult.zakatMonthly : incomeResult.zakatYearly) : fitrahResult.total;

  const fieldCols = compact ? "grid gap-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2";

  return (
    <div className={cn("grid grid-cols-1 gap-6", !compact && "lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-start")}>
      <div className="space-y-6">
        <div className="card-muted space-y-4 p-5">
          <div className={fieldCols}>
            <Field label={t("settings.currency")} htmlFor={`${id}-currency`}>
              <Select id={`${id}-currency`} value={currency} onChange={(e) => changeCurrency(e.target.value as ZakatCurrency)}>
                <option value="JPY">{t("settings.JPY")}</option>
                <option value="IDR">{t("settings.IDR")}</option>
              </Select>
            </Field>
            <Field label={t("settings.rate")} htmlFor={`${id}-rate`} hint={t("settings.rateHint")}>
              <Input id={`${id}-rate`} type="number" inputMode="decimal" min={1} step={0.1} value={rate} onChange={(e) => setRate(e.target.value)} className="tabular" />
            </Field>
          </div>
          <Button variant="ghost" size="sm" onClick={resetAll}>
            <RotateCw />
            {t("settings.reset")}
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="w-full overflow-x-auto scrollbar-none sm:w-auto" aria-label={t("tag")}>
            <TabsTrigger value="maal" className="flex-1 sm:flex-none">
              <Coins />
              {t("tabs.maal")}
            </TabsTrigger>
            <TabsTrigger value="income" className="flex-1 sm:flex-none">
              <Wallet />
              {t("tabs.income")}
            </TabsTrigger>
            <TabsTrigger value="fitrah" className="flex-1 sm:flex-none">
              <Wheat />
              {t("tabs.fitrah")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maal" className="card-surface space-y-5 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">{t("maal.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("maal.description")}</p>
            </div>
            <div className={fieldCols}>
              <NumberField id={`${id}-gold`} label={t("maal.gold")} value={maal.goldGrams} onChange={(v) => setMaal({ ...maal, goldGrams: v })} step={0.1} />
              <NumberField id={`${id}-goldprice`} label={t("maal.goldPrice")} value={goldPrice} onChange={setGoldPrice} />
              <NumberField id={`${id}-silver`} label={t("maal.silver")} value={maal.silverValue} onChange={(v) => setMaal({ ...maal, silverValue: v })} />
              <NumberField id={`${id}-savings`} label={t("maal.savings")} value={maal.savings} onChange={(v) => setMaal({ ...maal, savings: v })} />
              <NumberField id={`${id}-receivables`} label={t("maal.receivables")} value={maal.receivables} onChange={(v) => setMaal({ ...maal, receivables: v })} />
              <NumberField id={`${id}-trade`} label={t("maal.trade")} value={maal.tradeGoods} onChange={(v) => setMaal({ ...maal, tradeGoods: v })} />
              <NumberField id={`${id}-debts`} label={t("maal.debts")} value={maal.debts} onChange={(v) => setMaal({ ...maal, debts: v })} />
            </div>
            <dl className="grid grid-cols-1 gap-2 rounded-xl bg-surface p-4 text-sm sm:grid-cols-3">
              <Stat label={t("maal.nisab")} value={money(maalResult.nisab)} />
              <Stat label={t("maal.total")} value={money(maalResult.totalAssets)} />
              <Stat label={t("maal.net")} value={money(maalResult.netAssets)} />
            </dl>
            <p className={cn("text-sm", maalResult.eligible ? "text-success" : "text-muted-foreground")}>{maalResult.eligible ? t("maal.aboveNisab") : t("maal.belowNisab")}</p>
            <p className="border-l-2 border-border pl-4 text-xs leading-relaxed text-muted-foreground">{t("maal.dalil")}</p>
          </TabsContent>

          <TabsContent value="income" className="card-surface space-y-5 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">{t("income.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("income.description")}</p>
            </div>
            <div className={fieldCols}>
              <NumberField id={`${id}-income`} label={t("income.amount")} value={income.amount} onChange={(v) => setIncome({ ...income, amount: v })} />
              <Field label={t("income.period")} htmlFor={`${id}-period`}>
                <Select id={`${id}-period`} value={income.period} onChange={(e) => setIncome({ ...income, period: e.target.value as "monthly" | "yearly" })}>
                  <option value="monthly">{t("income.periods.monthly")}</option>
                  <option value="yearly">{t("income.periods.yearly")}</option>
                </Select>
              </Field>
              <NumberField id={`${id}-goldprice2`} label={t("income.goldPrice")} value={goldPrice} onChange={setGoldPrice} />
            </div>
            <dl className="grid grid-cols-1 gap-2 rounded-xl bg-surface p-4 text-sm sm:grid-cols-2">
              <Stat label={t("income.annual")} value={money(incomeResult.annualIncome)} />
              <Stat label={t("income.nisabYearly")} value={money(incomeResult.nisabYearly)} />
              <Stat label={t("income.monthly")} value={money(incomeResult.zakatMonthly)} />
              <Stat label={t("income.yearly")} value={money(incomeResult.zakatYearly)} />
            </dl>
            <p className={cn("text-sm", incomeResult.eligible ? "text-success" : "text-muted-foreground")}>{incomeResult.eligible ? t("income.aboveNisab") : t("income.belowNisab")}</p>
            <p className="border-l-2 border-border pl-4 text-xs leading-relaxed text-muted-foreground">{t("income.dalil")}</p>
          </TabsContent>

          <TabsContent value="fitrah" className="card-surface space-y-5 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">{t("fitrah.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("fitrah.description")}</p>
            </div>
            <div className={fieldCols}>
              <NumberField id={`${id}-persons`} label={t("fitrah.persons")} value={fitrah.persons} onChange={(v) => setFitrah({ persons: v })} min={1} step={1} />
              <NumberField id={`${id}-rice`} label={t("fitrah.ricePrice")} value={ricePrice} onChange={setRicePrice} />
            </div>
            <dl className="grid grid-cols-1 gap-2 rounded-xl bg-surface p-4 text-sm sm:grid-cols-2">
              <Stat label={t("fitrah.totalRice")} value={t("fitrah.kg", { kg: formatNumber(fitrahResult.riceKg, locale) })} />
              <Stat label={t("fitrah.perPerson")} value={money(fitrahResult.perPerson)} />
            </dl>
            <p className="border-l-2 border-border pl-4 text-xs leading-relaxed text-muted-foreground">{t("fitrah.dalil")}</p>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="hero-surface rounded-2xl p-6 lg:sticky lg:top-24" aria-live="polite">
        <div className="relative space-y-3 text-center">
          <IconCircle tone="inverse" className="mx-auto">
            <Coins />
          </IconCircle>
          <p className="text-xs font-semibold tracking-wide text-hero-muted uppercase">{tab === "fitrah" ? t("fitrah.result") : t("result.label")}</p>
          <p className="headline text-3xl tabular sm:text-4xl">{money(resultAmount)}</p>
          <p className="text-sm text-hero-muted">{t("result.equivalent", { amount: equivalent(resultAmount) })}</p>
          <Link href="/donate" className={cn(buttonVariants({ variant: "inverse", size: "lg" }), "mt-2 w-full")}>
            {t("result.cta")}
            <ArrowRight />
          </Link>
          <p className="text-xs leading-relaxed text-hero-muted">{t("result.disclaimer")}</p>
        </div>
      </aside>
    </div>
  );
}

function NumberField({ id, label, value, onChange, min = 0, step = 1 }: { id: string; label: string; value: string; onChange: (v: string) => void; min?: number; step?: number }) {
  return (
    <Field label={label} htmlFor={id}>
      <Input id={id} type="number" inputMode="decimal" min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="tabular" placeholder="0" />
    </Field>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular">{value}</dd>
    </div>
  );
}
