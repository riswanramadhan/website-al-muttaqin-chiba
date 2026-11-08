import * as React from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getProfile, getPrograms } from "@/lib/data";
import { toIntlLocale } from "@/lib/utils/i18n";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils/cn";

/**
 * Baris statistik dengan angka naik (PRD-03a): kapasitas, jumlah program, bahasa, tahun berdiri.
 * Tahun ditampilkan statis agar tidak dipisah tanda ribuan.
 */
export async function StatsRow({ locale, tone = "default", className }: { locale: Locale; tone?: "default" | "inverse"; className?: string }) {
  const [t, profile, programs] = await Promise.all([getTranslations({ locale, namespace: "about" }), getProfile(), getPrograms()]);
  const intl = toIntlLocale(locale);
  const inverse = tone === "inverse";

  const stats: { key: string; value: number; label: string; animate: boolean; suffix?: string }[] = [
    { key: "capacity", value: profile.capacity, label: t("stats.capacity"), animate: true },
    { key: "programs", value: programs.length, label: t("stats.programs"), animate: true },
    { key: "languages", value: 3, label: t("stats.languages"), animate: true },
    { key: "founded", value: profile.foundedYear, label: t("stats.founded"), animate: false },
  ];

  return (
    <dl className={cn("grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4", className)}>
      {stats.map((s) => (
        <div
          key={s.key}
          className={cn(
            "rounded-2xl px-5 py-6",
            inverse ? "border border-hero-foreground/15 bg-hero-foreground/5" : "card-muted",
          )}
        >
          <dd className={cn("headline text-3xl sm:text-4xl tabular", inverse ? "text-hero-foreground" : "text-brand")}>
            {s.animate ? <CountUp value={s.value} locale={intl} suffix={s.suffix} /> : <span>{s.value}</span>}
          </dd>
          <dt className={cn("mt-2 text-sm", inverse ? "text-hero-muted" : "text-muted-foreground")}>{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
