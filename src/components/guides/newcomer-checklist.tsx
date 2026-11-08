"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, RotateCcw } from "lucide-react";
import type { Locale } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { Progress } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "acc-newcomer-checklist";

type CheckedMap = Record<string, boolean>;

function readStored(): CheckedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: CheckedMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) out[k] = v === true;
    return out;
  } catch {
    return {};
  }
}

function writeStored(map: CheckedMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Penyimpanan penuh atau mode privat: abaikan, ceklis tetap bekerja di memori.
  }
}

/**
 * Ceklis langkah pertama muslim baru. Status tersimpan di localStorage
 * (kunci `acc-newcomer-checklist`), dimuat setelah hidrasi agar SSR dan klien cocok.
 */
export function NewcomerChecklist({ locale }: { locale: Locale }) {
  const t = useTranslations("newcomers.checklist");
  const items = Object.entries(t.raw("items") as Record<string, string>);
  const details = t.raw("details") as Record<string, string>;

  const [checked, setChecked] = React.useState<CheckedMap>({});
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setChecked(readStored());
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  function toggle(key: string, value: boolean) {
    setChecked((prev) => {
      const next = { ...prev, [key]: value };
      writeStored(next);
      return next;
    });
  }

  function reset() {
    setChecked({});
    writeStored({});
  }

  const total = items.length;
  const done = items.filter(([key]) => checked[key]).length;
  const complete = hydrated && total > 0 && done === total;

  return (
    <div className="card-surface p-5 sm:p-6" lang={locale}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">{t("title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="print:hidden" disabled={!hydrated || done === 0}>
          <RotateCcw />
          {t("reset")}
        </Button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold tabular">{t("progress", { done, total })}</span>
          {complete && (
            <span className="inline-flex items-center gap-1.5 text-success">
              <CircleCheck className="size-4" />
              {t("complete")}
            </span>
          )}
        </div>
        <Progress value={done} max={total} tone={complete ? "success" : "brand"} label={t("title")} />
      </div>

      <Accordion type="multiple" className="mt-5 flex flex-col gap-2">
        {items.map(([key, label], index) => {
          const id = `newcomer-step-${key}`;
          const isChecked = Boolean(checked[key]);
          return (
            <AccordionItem key={key} value={key} className={cn("px-4", isChecked && "bg-success/5")}>
              <div className="flex items-start gap-3 py-3">
                <Checkbox id={id} checked={isChecked} onChange={(e) => toggle(key, e.target.checked)} disabled={!hydrated} aria-describedby={`${id}-detail`} />
                <label htmlFor={id} className={cn("flex-1 cursor-pointer text-sm leading-snug font-semibold", isChecked && "text-muted-foreground line-through decoration-success/60")}>
                  <span className="text-brand mr-2 text-xs font-bold tabular">{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </label>
              </div>
              <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground">{t("detailsLabel")}</AccordionTrigger>
              <AccordionContent className="pb-4">
                <p id={`${id}-detail`}>{details[key]}</p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
