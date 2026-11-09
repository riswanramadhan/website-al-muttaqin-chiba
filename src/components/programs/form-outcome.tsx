"use client";

import { CircleCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import type { SubmitOutcome } from "@/components/programs/schemas";

/** Kartu hasil kirim: tersimpan, atau fallback WhatsApp dengan tombol pesan terisi. */
export function FormOutcome({
  outcome,
  successTitle,
  successBody,
  fallbackTitle,
  fallbackBody,
  onReset,
  resetLabel,
}: {
  outcome: SubmitOutcome;
  successTitle: string;
  successBody: string;
  fallbackTitle: string;
  fallbackBody: string;
  onReset?: () => void;
  resetLabel?: string;
}) {
  const tc = useTranslations("common");
  const isFallback = outcome.fallback === "whatsapp";

  return (
    <div className="card-muted flex flex-col items-center gap-4 px-6 py-10 text-center" role="status" aria-live="polite">
      <IconCircle size="lg" tone={isFallback ? "soft" : "brand"}>
        {isFallback ? <WhatsAppIcon /> : <CircleCheck />}
      </IconCircle>
      <div>
        <p className="text-lg font-bold">{isFallback ? fallbackTitle : successTitle}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{isFallback ? fallbackBody : successBody}</p>
      </div>
      {isFallback && (
        <a href={outcome.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
          <WhatsAppIcon />
          {tc("actions.whatsapp")}
        </a>
      )}
      {onReset && resetLabel && (
        <Button variant="link" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </div>
  );
}

/** Terjemahkan kunci pesan kesalahan Zod (common.validation.* atau kunci namespace modul). */
export function useFieldErrorText() {
  const t = useTranslations();
  return (message?: string): string | undefined => (message ? t(message) : undefined);
}

/** Sisipan honeypot anti-bot: tersembunyi dari pengguna, diisi hanya oleh bot. */
export function HoneypotField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden>
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}
