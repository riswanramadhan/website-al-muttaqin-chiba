import { getTranslations } from "next-intl/server";
import { ArrowRight, Languages, Mic, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getJumuahThisWeek, getPrayerConfig } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { formatDate, formatWeekday, parseTokyoDate, pick } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { SectionTag } from "@/components/ui/section-tag";
import { TimeCountdown } from "./time-countdown";

export type JumuahCardProps = {
  locale: Locale;
  compact?: boolean;
  tone?: "default" | "inverse";
  className?: string;
};

/** Kartu Jumat pekan ini: khatib, imam, jam khutbah, bahasa, tema, hitung mundur (klien). */
export async function JumuahCard({ locale, compact = false, tone = "default", className }: JumuahCardProps) {
  const [jumuah, config, t] = await Promise.all([getJumuahThisWeek(), getPrayerConfig(), getTranslations({ locale, namespace: "jumuah" })]);
  const inverse = tone === "inverse";
  const muted = inverse ? "text-hero-muted" : "text-muted-foreground";
  const time = jumuah?.time ?? config.jumuah.time;
  const date = jumuah ? parseTokyoDate(jumuah.date) : null;
  const target = jumuah ? parseTokyoDate(jumuah.date, jumuah.time) : null;
  const note = pick(config.jumuah.note, locale);

  return (
    <section
      className={cn(
        "rounded-3xl",
        inverse ? "border border-hero-foreground/15 bg-hero-foreground/5 text-hero-foreground" : "card-surface",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      )}
      aria-label={t("card.title")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTag tone={inverse ? "inverse" : "brand"}>{t("card.title")}</SectionTag>
        {date && (
          <p className={cn("text-sm font-semibold", muted)}>
            {formatWeekday(date, locale)}, {formatDate(date, locale, { day: "numeric", month: "long" })}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={cn("text-xs font-semibold tracking-wide uppercase", muted)}>{t("card.time")}</p>
          <p className={cn("tabular font-bold leading-none", compact ? "text-3xl" : "text-4xl sm:text-5xl")}>{time}</p>
          {config.jumuah.secondTime && <p className={cn("mt-1 text-xs", muted)}>{t("card.second", { time: config.jumuah.secondTime })}</p>}
        </div>
        {jumuah && (
          <Badge variant={inverse ? "inverse" : "soft"} className="shrink-0">
            <Languages aria-hidden />
            {t(`languages.${jumuah.language}`)}
          </Badge>
        )}
      </div>

      {jumuah ? (
        <dl className={cn("mt-4 grid grid-cols-1 gap-3", !compact && "sm:grid-cols-2")}>
          <div className="flex items-center gap-3">
            <IconCircle size="sm" tone={inverse ? "inverse" : "soft"}>
              <Mic />
            </IconCircle>
            <div className="min-w-0">
              <dt className={cn("text-xs", muted)}>{t("card.khatib")}</dt>
              <dd className="truncate text-sm font-semibold">{jumuah.khatib}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IconCircle size="sm" tone={inverse ? "inverse" : "soft"}>
              <UserRound />
            </IconCircle>
            <div className="min-w-0">
              <dt className={cn("text-xs", muted)}>{t("card.imam")}</dt>
              <dd className="truncate text-sm font-semibold">{jumuah.imam}</dd>
            </div>
          </div>
          {jumuah.topic && (
            <div className={cn(!compact && "sm:col-span-2")}>
              <dt className={cn("text-xs", muted)}>{t("card.topic")}</dt>
              <dd className="text-sm font-semibold">{pick(jumuah.topic, locale)}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className={cn("mt-4 text-sm", muted)}>
          {t("card.none")} {t("card.default", { time })}
        </p>
      )}

      {!compact && target && (
        <TimeCountdown
          targetIso={target.toISOString()}
          label={t("card.countdown")}
          activeLabel={t("card.started")}
          activeMinutes={60}
          doneLabel={t("card.passed")}
          tone={tone}
          className="mt-4"
        />
      )}

      {!compact && note && <p className={cn("mt-4 text-sm leading-relaxed", muted)}>{note}</p>}

      {compact && (
        <Link href="/jumuah" className={cn(buttonVariants({ variant: inverse ? "outlineInverse" : "outline", size: "sm" }), "mt-4 w-full")}>
          {t("card.details")}
          <ArrowRight />
        </Link>
      )}
    </section>
  );
}
