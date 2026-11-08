import { getTranslations } from "next-intl/server";
import type { Locale, TransparencyReport } from "@/lib/types";
import { formatCurrency, formatDate, parseTokyoDate, toIntlLocale } from "@/lib/utils/i18n";

export function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((acc, i) => acc + i.amount, 0);
}

export function periodLabel(period: string, locale: Locale, width: "short" | "long" = "short"): string {
  return formatDate(parseTokyoDate(`${period}-01`), locale, { month: width, year: width === "long" ? "numeric" : "2-digit" });
}

/**
 * Grafik batang SVG tanpa library (PRD-05): pemasukan vs pengeluaran per bulan, maks 6 bulan terakhir.
 * Aksesibel lewat aria-label dan <title> di tiap batang; warna dari token CSS.
 */
export async function TransparencyChart({ reports, locale, months = 6 }: { reports: TransparencyReport[]; locale: Locale; months?: number }) {
  const t = await getTranslations({ locale, namespace: "transparency" });
  const series = [...reports]
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-months)
    .map((r) => ({ period: r.period, income: sumAmounts(r.income), expense: sumAmounts(r.expense) }));
  if (series.length === 0) return null;

  const W = 640;
  const H = 280;
  const pad = { top: 16, right: 12, bottom: 36, left: 56 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const rawMax = Math.max(...series.flatMap((s) => [s.income, s.expense]), 1);
  const step = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const max = Math.ceil(rawMax / step) * step;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const groupW = innerW / series.length;
  const barW = Math.min(28, groupW * 0.32);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const compact = new Intl.NumberFormat(toIntlLocale(locale), { notation: "compact", maximumFractionDigits: 0 });

  return (
    <figure className="card-surface p-5 sm:p-6">
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">{t("chart.title")}</p>
          <p className="text-sm text-muted-foreground">{t("chart.description")}</p>
        </div>
        <ul className="flex items-center gap-4 text-xs font-semibold" aria-hidden>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-primary" />
            {t("chart.income")}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-muted-foreground" />
            {t("chart.expense")}
          </li>
        </ul>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("chart.aria", { count: series.length })} className="h-auto w-full text-xs">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={W - pad.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeWidth={1} />
            <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={11}>
              {compact.format(tick)}
            </text>
          </g>
        ))}
        {series.map((s, i) => {
          const cx = pad.left + groupW * i + groupW / 2;
          const month = periodLabel(s.period, locale);
          return (
            <g key={s.period}>
              <rect x={cx - barW - 2} y={y(s.income)} width={barW} height={innerH + pad.top - y(s.income)} rx={4} fill="var(--primary)">
                <title>{t("chart.bar", { month, label: t("chart.income"), amount: formatCurrency(s.income, "JPY", locale) })}</title>
              </rect>
              <rect x={cx + 2} y={y(s.expense)} width={barW} height={innerH + pad.top - y(s.expense)} rx={4} fill="var(--muted-foreground)">
                <title>{t("chart.bar", { month, label: t("chart.expense"), amount: formatCurrency(s.expense, "JPY", locale) })}</title>
              </rect>
              <text x={cx} y={H - pad.bottom + 20} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={600}>
                {month}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
