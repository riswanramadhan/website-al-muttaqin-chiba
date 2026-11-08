"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight, Moon, Star, Sun } from "lucide-react";
import type { HijriImportantDate, Locale } from "@/lib/types";
import { HIJRI_MONTHS, fromHijri, hijriMonthGrid, hijriMonthName, toHijri, type HijriDate } from "@/lib/hijri";
import { daysInMonth, formatDate, formatNumber, pick, tokyoDate, tokyoDateKey, tokyoParts } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { IconCircle } from "@/components/ui/primitives";
import { daysUntilHijri, weekdayShortNames } from "./utils";

type View = "hijri" | "gregorian";
type Cell = { date: Date; key: string; hijri: HijriDate; gregDay: number; weekday: number };

function monthTitle(view: View, year: number, month: number, locale: Locale, t: (key: string, values?: Record<string, string | number>) => string): string {
  if (view === "hijri") {
    return locale === "ja" ? `${t("hijriYear", { year })} ${hijriMonthName(month, "ja")}` : `${hijriMonthName(month, locale)} ${t("hijriYear", { year })}`;
  }
  return formatDate(tokyoDate(year, month, 1, 12), locale, { year: "numeric", month: "long" });
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

export function HijriCalendar({ adjustment, importantDates, locale }: { adjustment: number; importantDates: HijriImportantDate[]; locale: Locale }) {
  const t = useTranslations("hijri");
  const [now] = React.useState(() => new Date());
  const todayKey = tokyoDateKey(now);
  const todayHijri = React.useMemo(() => toHijri(now, adjustment), [now, adjustment]);
  const todayParts = tokyoParts(now);

  const [view, setView] = React.useState<View>("hijri");
  const [hCursor, setHCursor] = React.useState({ year: todayHijri.year, month: todayHijri.month });
  const [gCursor, setGCursor] = React.useState({ year: todayParts.year, month: todayParts.month });

  const cursor = view === "hijri" ? hCursor : gCursor;

  const cells: Cell[] = React.useMemo(() => {
    if (view === "hijri") {
      return hijriMonthGrid(cursor.year, cursor.month, adjustment).map((d) => {
        const noon = new Date(d.date.getTime() + 12 * 3_600_000);
        const p = tokyoParts(noon);
        return { date: noon, key: tokyoDateKey(noon), hijri: { year: cursor.year, month: cursor.month, day: d.hijriDay }, gregDay: p.day, weekday: p.weekday };
      });
    }
    const total = daysInMonth(cursor.year, cursor.month);
    return Array.from({ length: total }, (_, i) => {
      const noon = tokyoDate(cursor.year, cursor.month, i + 1, 12);
      return { date: noon, key: tokyoDateKey(noon), hijri: toHijri(noon, adjustment), gregDay: i + 1, weekday: tokyoParts(noon).weekday };
    });
  }, [view, cursor.year, cursor.month, adjustment]);

  const weekdays = React.useMemo(() => weekdayShortNames(locale), [locale]);
  const offset = cells[0]?.weekday ?? 0;

  const importantInView = cells.flatMap((c) => importantDates.filter((d) => d.month === c.hijri.month && d.day === c.hijri.day).map((d) => ({ cell: c, item: d })));
  const importantKeys = new Set(importantInView.map((x) => x.cell.key));

  const countdowns = React.useMemo(
    () => [
      { key: "ramadan", icon: <Moon />, ...daysUntilHijri(9, 1, now, adjustment) },
      { key: "eidFitr", icon: <Star />, ...daysUntilHijri(10, 1, now, adjustment) },
      { key: "eidAdha", icon: <Sun />, ...daysUntilHijri(12, 10, now, adjustment) },
    ],
    [now, adjustment],
  );

  function move(delta: number) {
    if (view === "hijri") setHCursor((c) => shiftMonth(c.year, c.month, delta));
    else setGCursor((c) => shiftMonth(c.year, c.month, delta));
  }

  function goToday() {
    setHCursor({ year: todayHijri.year, month: todayHijri.month });
    setGCursor({ year: todayParts.year, month: todayParts.month });
  }

  function switchView(next: View) {
    setView(next);
    goToday();
  }

  // Konversi tanggal.
  const [gInput, setGInput] = React.useState(todayKey);
  const [hInput, setHInput] = React.useState<HijriDate>(todayHijri);
  const gToH = React.useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(gInput);
    if (!m) return null;
    const d = tokyoDate(Number(m[1]), Number(m[2]), Number(m[3]), 12);
    if (Number.isNaN(d.getTime())) return null;
    const h = toHijri(d, adjustment);
    return locale === "ja" ? `${t("hijriYear", { year: h.year })} ${hijriMonthName(h.month, "ja")} ${h.day}日` : `${h.day} ${hijriMonthName(h.month, locale)} ${t("hijriYear", { year: h.year })}`;
  }, [gInput, adjustment, locale, t]);
  const hToG = React.useMemo(() => {
    if (!hInput.year || !hInput.month || !hInput.day || hInput.day > 30) return null;
    const d = fromHijri(hInput, adjustment);
    return formatDate(new Date(d.getTime() + 12 * 3_600_000), locale, { weekday: "short", year: "numeric", month: "long", day: "numeric" });
  }, [hInput, adjustment, locale]);

  return (
    <div className="flex flex-col gap-4">
      <section className="card-surface flex items-center gap-3 p-4">
        <IconCircle tone="brand" size="md">
          <CalendarDays />
        </IconCircle>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">{t("todayLabel")}</p>
          <p className="font-bold">
            {locale === "ja"
              ? `${t("hijriYear", { year: todayHijri.year })} ${hijriMonthName(todayHijri.month, "ja")} ${todayHijri.day}日`
              : `${todayHijri.day} ${hijriMonthName(todayHijri.month, locale)} ${t("hijriYear", { year: todayHijri.year })}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(now, locale, { weekday: "short", year: "numeric", month: "long", day: "numeric" })} · <span lang="ar" dir="rtl" className="font-arabic">{todayHijri.day} {hijriMonthName(todayHijri.month, "ar")}</span>
          </p>
        </div>
      </section>

      <section className="card-surface flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex h-9 items-center gap-1 rounded-full bg-surface p-1" role="group" aria-label={t("view.label")}>
            {(["hijri", "gregorian"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => switchView(v)} className={cn("h-7 rounded-full px-3 text-xs font-semibold transition-colors", view === v ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")}>
                {t(`view.${v}`)}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={goToday}>
            {t("todayButton")}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="iconSm" onClick={() => move(-1)} aria-label={t("nav.prev")}>
            <ChevronLeft />
          </Button>
          <h2 className="text-center text-base font-bold" aria-live="polite">
            {monthTitle(view, cursor.year, cursor.month, locale, t)}
          </h2>
          <Button variant="outline" size="iconSm" onClick={() => move(1)} aria-label={t("nav.next")}>
            <ChevronRight />
          </Button>
        </div>

        <div role="grid" aria-label={t("gridLabel")} className="grid grid-cols-7 gap-1">
          {weekdays.map((w, i) => (
            <div key={w} role="columnheader" className={cn("py-1 text-center text-[11px] font-semibold text-muted-foreground", i === 5 && "text-brand")}>
              {w}
            </div>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`pad-${i}`} aria-hidden />
          ))}
          {cells.map((c) => {
            const isToday = c.key === todayKey;
            const bidh = c.hijri.day >= 13 && c.hijri.day <= 15;
            const monThu = c.weekday === 1 || c.weekday === 4;
            const important = importantKeys.has(c.key);
            const big = view === "hijri" ? c.hijri.day : c.gregDay;
            const small = view === "hijri" ? c.gregDay : c.hijri.day;
            const showSmallMonth = view === "hijri" ? c.gregDay === 1 || c === cells[0] : c.hijri.day === 1 || c === cells[0];
            const smallMonth = view === "hijri" ? formatDate(c.date, locale, { month: "short" }) : HIJRI_MONTHS[locale][c.hijri.month - 1].split(/[\s・]/)[0];
            return (
              <div
                key={c.key}
                role="gridcell"
                aria-current={isToday ? "date" : undefined}
                aria-label={`${formatDate(c.date, locale, { month: "long", day: "numeric" })} · ${c.hijri.day} ${hijriMonthName(c.hijri.month, locale)}`}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center rounded-xl border px-0.5 py-1 text-center",
                  isToday ? "border-primary bg-primary text-primary-foreground" : bidh ? "border-accent bg-accent/60" : monThu ? "border-border bg-surface" : "border-transparent",
                )}
              >
                <span className={cn("text-sm font-bold tabular leading-none", !isToday && bidh && "text-accent-foreground")}>{big}</span>
                <span className={cn("mt-0.5 text-[10px] leading-none tabular", isToday ? "opacity-80" : "text-muted-foreground")}>
                  {showSmallMonth ? `${small} ${smallMonth}` : small}
                </span>
                {important && <span className={cn("absolute top-1 right-1 size-1.5 rounded-full", isToday ? "bg-primary-foreground" : "bg-primary")} aria-hidden />}
              </div>
            );
          })}
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-md bg-primary" aria-hidden />
            {t("legend.today")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-md border border-accent bg-accent/60" aria-hidden />
            {t("legend.ayyamulBidh")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-md border border-border bg-surface" aria-hidden />
            {t("legend.monThu")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            {t("legend.important")}
          </li>
        </ul>
      </section>

      <section className="card-muted flex flex-col gap-2 p-4">
        <h2 className="text-sm font-bold">{t("important.title")}</h2>
        {importantInView.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("important.empty")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {importantInView.map(({ cell, item }) => (
              <li key={`${item.id}-${cell.key}`} className="flex items-center gap-3 py-2">
                <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-background text-xs font-bold tabular">
                  {cell.hijri.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{pick(item.title, locale)}</span>
                  <span className="block text-xs text-muted-foreground">{formatDate(cell.date, locale, { weekday: "short", month: "short", day: "numeric" })}</span>
                </span>
                <Badge variant={item.kind === "eid" ? "brand" : item.kind === "ramadan" ? "soft" : "outline"}>{t(`kinds.${item.kind}`)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface flex flex-col gap-3 p-4">
        <h2 className="text-sm font-bold">{t("countdown.title")}</h2>
        <ul className="flex flex-col gap-2">
          {countdowns.map((c) => (
            <li key={c.key} className="flex items-center gap-3">
              <IconCircle size="sm" tone="soft">
                {c.icon}
              </IconCircle>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{t(`countdown.${c.key}`)} {t("hijriYear", { year: c.hijri.year })}</span>
                <span className="block text-xs text-muted-foreground">{formatDate(new Date(c.date.getTime() + 12 * 3_600_000), locale, { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</span>
              </span>
              <span className="text-right text-sm font-bold tabular">{t("countdown.days", { count: c.days })}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-muted flex flex-col gap-3 p-4">
        <h2 className="text-sm font-bold">{t("convert.title")}</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hijri-g-input">{t("convert.gregorian")}</Label>
          <Input id="hijri-g-input" type="date" value={gInput} onChange={(e) => setGInput(e.target.value)} />
          <p className="text-sm font-semibold">{t("convert.result")}: {gToH ?? "-"}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hijri-h-day">{t("convert.hijri")}</Label>
          <div className="grid grid-cols-[4rem_1fr_5rem] gap-2">
            <Input id="hijri-h-day" type="number" inputMode="numeric" min={1} max={30} aria-label={t("convert.day")} value={hInput.day} onChange={(e) => setHInput({ ...hInput, day: Number(e.target.value) })} />
            <Select aria-label={t("convert.month")} value={hInput.month} onChange={(e) => setHInput({ ...hInput, month: Number(e.target.value) })}>
              {HIJRI_MONTHS[locale].map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </Select>
            <Input type="number" inputMode="numeric" min={1300} max={1600} aria-label={t("convert.year")} value={hInput.year} onChange={(e) => setHInput({ ...hInput, year: Number(e.target.value) })} />
          </div>
          <p className="text-sm font-semibold">{t("convert.result")}: {hToG ?? "-"}</p>
        </div>
      </section>

      <div className="flex flex-col gap-1 rounded-2xl border border-border p-4 text-xs text-muted-foreground">
        <p>{t("note.base")}</p>
        <p>{adjustment !== 0 ? t("note.adjusted", { count: formatNumber(adjustment, locale) }) : t("note.notAdjusted")}</p>
      </div>
    </div>
  );
}
