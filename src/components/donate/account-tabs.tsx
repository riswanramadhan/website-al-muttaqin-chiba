"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Download, Landmark, QrCode, Wallet } from "lucide-react";
import type { DonationAccount, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { shouldSkipOptimization } from "@/lib/utils/media";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { IconCircle } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DonationCurrency } from "@/components/donate/unique-amount";
import { PaymentLogos } from "@/components/donate/payment-logos";

const CURRENCIES: DonationCurrency[] = ["JPY", "IDR"];

/** Tab mata uang kecil (client) yang menerima daftar rekening dari Server Component. */
export function AccountTabs({
  accounts,
  locale,
  compact = false,
  defaultCurrency = "JPY",
}: {
  accounts: DonationAccount[];
  locale: Locale;
  compact?: boolean;
  defaultCurrency?: DonationCurrency;
}) {
  const t = useTranslations("donate.accounts");
  return (
    <Tabs defaultValue={defaultCurrency}>
      <TabsList className="w-full sm:w-auto" aria-label={t("tag")}>
        {CURRENCIES.map((c) => (
          <TabsTrigger key={c} value={c} className="flex-1 sm:flex-none">
            {t(`tabs.${c}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      {CURRENCIES.map((c) => {
        const list = accounts.filter((a) => a.currency === c);
        return (
          <TabsContent key={c} value={c} className={cn("mt-4", !compact && "sm:mt-6")}>
            {list.length === 0 ? (
              <p className="card-muted p-5 text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <ul className={cn("grid grid-cols-1 gap-4", !compact && "lg:grid-cols-2")}>
                {list.map((account) => (
                  <li key={account.id}>
                    <AccountCard account={account} locale={locale} compact={compact} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function AccountCard({ account, locale, compact }: { account: DonationAccount; locale: Locale; compact: boolean }) {
  const t = useTranslations("donate.accounts");
  const bankLabel = pick(account.bankNameLocalized, locale) || account.bankName;
  const note = pick(account.note, locale);
  const Icon = account.method === "qris" ? QrCode : account.method === "ewallet" ? Wallet : Landmark;
  const skipOptimization = shouldSkipOptimization(account.qrImage);

  return (
    <article className="card-surface flex h-full flex-col gap-4 p-5" aria-label={bankLabel}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconCircle tone="soft" shape="square" size="sm">
            <Icon />
          </IconCircle>
          <div>
            <p className="font-bold leading-tight">{bankLabel}</p>
            <p className="text-xs text-muted-foreground">{account.currency}</p>
          </div>
        </div>
        {account.primary && <Badge variant="brand">{t("primary")}</Badge>}
      </div>

      {account.qrImage && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-surface p-4">
          <Image
            src={account.qrImage}
            alt={t("qrisAlt")}
            width={compact ? 240 : 220}
            height={compact ? 240 : 220}
            unoptimized={skipOptimization}
            className="size-56 rounded-lg bg-background p-2"
          />
          <a href={account.qrImage} download className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Download />
            {t("downloadQris")}
          </a>
          <p className="text-center text-xs text-muted-foreground">{t("scanHint")}</p>
        </div>
      )}

      {account.method === "qris" && <PaymentLogos />}

      <dl className="divide-y divide-border text-sm">
        {account.branch && (
          <Row label={t("labels.branch")} value={account.branch}>
            {account.branchCode && <CopyButton value={account.branchCode} label={t("copyBranch")} />}
          </Row>
        )}
        {!account.branch && account.branchCode && (
          <Row label={t("labels.branchCode")} value={account.branchCode}>
            <CopyButton value={account.branchCode} label={t("copyBranch")} />
          </Row>
        )}
        {account.accountType && <Row label={t("labels.accountType")} value={account.accountType} />}
        <Row label={t("labels.accountNumber")} value={account.accountNumber} mono>
          <CopyButton value={account.accountNumber} label={t("copyNumber")} />
        </Row>
        <Row label={t("labels.accountName")} value={account.accountName}>
          <CopyButton value={account.accountName} label={t("copyName")} />
        </Row>
      </dl>

      {note && <p className="rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-muted-foreground">{note}</p>}
    </article>
  );
}

function Row({ label, value, mono, children }: { label: string; value: string; mono?: boolean; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5">
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={cn("font-semibold break-all", mono && "text-lg tabular tracking-wide")}>{value}</dd>
      </div>
      {children}
    </div>
  );
}
