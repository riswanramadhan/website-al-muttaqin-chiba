"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Trash } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button, buttonVariants, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminT } from "@/components/admin/i18n-context";

/**
 * Tombol simpan yang dinonaktifkan (dengan tooltip) saat mode demo atau peran hanya-baca.
 * `reason`: "demo" | "role" | undefined.
 */
export function GuardedButton({ reason, pending, children, ...props }: ButtonProps & { reason?: "demo" | "role"; pending?: boolean }) {
  const { t } = useAdminT();
  const button = (
    <Button {...props} disabled={Boolean(reason) || pending || props.disabled}>
      {pending ? <LoaderCircle className="animate-spin" /> : null}
      {children}
    </Button>
  );
  if (!reason) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={0}>
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason === "demo" ? t("common.demoDisabled") : t("common.readOnlyRole")}</TooltipContent>
    </Tooltip>
  );
}

/** Baris aksi formulir: kembali, hapus (opsional), dan tombol aksi utama di kanan. */
export function FormBar({ backHref, onDelete, deleteReason, pending, children, className }: { backHref: string; onDelete?: () => void; deleteReason?: "demo" | "role"; pending?: boolean; children: React.ReactNode; className?: string }) {
  const { t } = useAdminT();
  return (
    <div className={cn("sticky bottom-0 z-30 -mx-4 mt-8 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8", className)}>
      <Link href={backHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        <ArrowLeft className="size-4" />
        {t("common.back")}
      </Link>
      {onDelete && (
        <GuardedButton type="button" variant="ghost" size="sm" className="text-destructive" reason={deleteReason} pending={false} onClick={onDelete}>
          <Trash />
          {t("common.delete")}
        </GuardedButton>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
      {pending && <span className="sr-only" aria-live="polite">{t("common.loading")}</span>}
    </div>
  );
}

/** Pembungkus bagian formulir dengan judul kecil. */
export function FormSection({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("card-surface p-5 sm:p-6", className)}>
      <h2 className="text-base font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}
