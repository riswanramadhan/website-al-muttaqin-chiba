"use client";

import * as React from "react";
import { Check, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Tombol bagikan: navigator.share bila tersedia (HP), selain itu salin tautan
 * ke clipboard dengan umpan balik toast.
 */
export function ShareButton({
  title,
  text,
  url,
  label,
  variant = "outline",
  size = "sm",
  iconOnly = false,
  ...props
}: { title: string; text?: string; url?: string; label?: string; iconOnly?: boolean } & Omit<ButtonProps, "onClick" | "title">) {
  const t = useTranslations("common");
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);

  async function share() {
    const shareUrl = url ? new URL(url, window.location.origin).toString() : window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast({ title: t("actions.copied"), tone: "success" });
    } catch {
      toast({ title: t("errors.generic"), tone: "error" });
    }
  }

  const caption = label ?? t("actions.share");
  return (
    <Button variant={variant} size={size} onClick={share} aria-label={iconOnly ? caption : undefined} {...props}>
      {copied ? <Check /> : <Share2 />}
      {!iconOnly && <span>{copied ? t("actions.copied") : caption}</span>}
    </Button>
  );
}
