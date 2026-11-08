import { getTranslations } from "next-intl/server";
import { BadgeCheck, FileDown } from "lucide-react";
import type { Locale, TransparencyReport } from "@/lib/types";
import { formatCurrency, formatDate, pick } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { sumAmounts } from "@/components/donate/transparency-chart";

/** Kartu laporan bulanan: ringkasan saldo, tabel rincian, catatan bendahara, unduh PDF (PRD-05). */
export async function TransparencyReportCard({ report, locale, featured = false }: { report: TransparencyReport; locale: Locale; featured?: boolean }) {
  const t = await getTranslations({ locale, namespace: "transparency" });
  const income = sumAmounts(report.income);
  const expense = sumAmounts(report.expense);
  const money = (v: number) => formatCurrency(v, report.currency, locale);
  const note = pick(report.note, locale);

  return (
    <article className={cn("card-surface p-5 sm:p-6", featured && "border-primary/30")} aria-labelledby={`report-${report.id}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {featured && <Badge variant="brand" className="mb-2">{t("report.latest")}</Badge>}
          <h3 id={`report-${report.id}`} className={cn("font-bold leading-snug", featured ? "text-2xl" : "text-lg")}>
            {pick(report.title, locale)}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("report.publishedAt", { date: formatDate(report.publishedAt, locale) })}</p>
        </div>
        {report.fileUrl && (
          <a href={report.fileUrl} download className={buttonVariants({ variant: "outline", size: "sm" })}>
            <FileDown />
            {t("report.download")}
          </a>
        )}
      </header>

      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Summary label={t("report.opening")} value={money(report.openingBalance)} />
        <Summary label={t("report.income")} value={money(income)} tone="income" />
        <Summary label={t("report.expense")} value={money(expense)} tone="expense" />
        <Summary label={t("report.closing")} value={money(report.closingBalance)} strong />
      </dl>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DetailTable caption={t("report.incomeDetail")} totalLabel={t("report.total")} rows={report.income.map((i) => ({ label: pick(i.label, locale), amount: money(i.amount) }))} total={money(income)} />
        <DetailTable caption={t("report.expenseDetail")} totalLabel={t("report.total")} rows={report.expense.map((i) => ({ label: pick(i.label, locale), amount: money(i.amount) }))} total={money(expense)} />
      </div>

      <footer className="mt-6 flex flex-col gap-2 rounded-xl bg-surface p-4 text-sm sm:flex-row sm:items-start sm:gap-3">
        <BadgeCheck className="size-5 shrink-0 text-success" aria-hidden />
        <div>
          <p className="font-semibold">{t("report.verified")}</p>
          {note && <p className="mt-0.5 text-muted-foreground">{note}</p>}
        </div>
      </footer>
    </article>
  );
}

function Summary({ label, value, tone, strong }: { label: string; value: string; tone?: "income" | "expense"; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl p-4", strong ? "bg-primary text-primary-foreground" : "bg-surface")}>
      <dt className={cn("text-xs", strong ? "text-primary-foreground/80" : "text-muted-foreground")}>{label}</dt>
      <dd className={cn("mt-1 font-bold tabular", strong ? "text-lg" : "text-base", tone === "income" && "text-success", tone === "expense" && "text-brand")}>
        {tone === "income" && "+"}
        {tone === "expense" && "-"}
        {value}
      </dd>
    </div>
  );
}

function DetailTable({ caption, rows, total, totalLabel }: { caption: string; rows: { label: string; amount: string }[]; total: string; totalLabel: string }) {
  return (
    <table className="w-full text-sm">
      <caption className="mb-2 text-left font-semibold">{caption}</caption>
      <tbody className="divide-y divide-border">
        {rows.map((row, i) => (
          <tr key={i}>
            <th scope="row" className="py-2 pr-3 text-left font-normal text-muted-foreground">
              {row.label}
            </th>
            <td className="py-2 text-right font-medium tabular whitespace-nowrap">{row.amount}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-border">
          <th scope="row" className="pt-2 text-left font-bold">
            {totalLabel}
          </th>
          <td className="pt-2 text-right font-bold tabular whitespace-nowrap">{total}</td>
        </tr>
      </tfoot>
    </table>
  );
}
