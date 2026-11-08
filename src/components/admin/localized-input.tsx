"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import type { Locale, LocalizedText } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAdminT } from "@/components/admin/i18n-context";
import { LOCALES } from "@/components/admin/utils";

type BaseProps = {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  /** Pesan kesalahan per bahasa (kunci errors.* atau teks). */
  errors?: Partial<Record<Locale, string | undefined>>;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
};

/**
 * Isian tiga bahasa dalam satu formulir: tab JA/EN/ID per kolom teks dan tombol
 * "Salin dari ID" yang menyalin teks Indonesia ke tab aktif (PRD-09).
 */
function LocalizedField({ multiline, label, value, onChange, errors, hint, required, disabled, placeholder, className, id }: BaseProps & { multiline: boolean }) {
  const { t } = useAdminT();
  const reactId = React.useId();
  const baseId = id ?? reactId;
  const [tab, setTab] = React.useState<Locale>("id");
  const filled = (l: Locale) => value[l].trim().length > 0;
  const error = errors?.[tab];

  function copyFromId() {
    if (tab === "id") return;
    onChange({ ...value, [tab]: value.id });
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={`${baseId}-${tab}`} className="flex items-center gap-1.5">
          {label}
          {required && <span className="text-brand" aria-hidden>*</span>}
        </Label>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Locale)}>
          <TabsList className="h-8 p-0.5">
            {LOCALES.map((l) => (
              <TabsTrigger key={l} value={l} className="h-7 px-2.5 text-xs">
                <span className={cn("size-1.5 rounded-full", filled(l) ? "bg-success" : "bg-muted-foreground/40")} aria-hidden />
                {t(`content.locales.${l}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as Locale)}>
        {LOCALES.map((l) => (
          <TabsContent key={l} value={l} className="mt-0">
            {multiline ? (
              <Textarea
                id={`${baseId}-${l}`}
                lang={l}
                value={value[l]}
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={Boolean(errors?.[l]) || undefined}
                onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              />
            ) : (
              <Input
                id={`${baseId}-${l}`}
                lang={l}
                value={value[l]}
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={Boolean(errors?.[l]) || undefined}
                onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p className="text-xs text-destructive" role="alert">
            {error.startsWith("errors.") ? t(error) : error}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : (
          <span />
        )}
        {tab !== "id" && !disabled && (
          <Button type="button" variant="link" size="sm" className="h-auto text-xs" onClick={copyFromId} disabled={!value.id.trim()}>
            <Copy className="size-3.5" />
            {t("common.copyFromId")}
          </Button>
        )}
      </div>
    </div>
  );
}

export function LocalizedInput(props: BaseProps) {
  return <LocalizedField {...props} multiline={false} />;
}

export function LocalizedTextarea(props: BaseProps) {
  return <LocalizedField {...props} multiline />;
}
