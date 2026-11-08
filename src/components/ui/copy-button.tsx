"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/** Tombol salin ke clipboard dengan umpan balik "Tersalin" selama 2 detik. */
export function CopyButton({ value, label, className, variant = "outline", size = "sm", ...props }: { value: string; label?: string } & Omit<ButtonProps, "onClick" | "value">) {
  const t = useTranslations("common.actions");
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback untuk browser lama
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button variant={variant} size={size} onClick={copy} aria-live="polite" className={cn(copied && "border-success text-success", className)} {...props}>
      {copied ? <Check /> : <Copy />}
      <span>{copied ? t("copied") : (label ?? t("copy"))}</span>
    </Button>
  );
}
