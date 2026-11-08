"use client";

import { Download, Share, Smartphone, SquarePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import { useIsClient, usePlatform, useStandalone } from "./browser-state";
import { promptInstall, useInstallState } from "./install-store";
import { useLocalValue, writeLocal } from "./local-store";

export const INSTALL_DISMISSED_KEY = "acc-install-dismissed";

/**
 * Kartu ajakan memasang App (PRD-07b). Muncul bila belum standalone dan belum ditutup:
 * Android/desktop Chromium memakai `beforeinstallprompt`; Safari iOS menampilkan langkah
 * "Tambah ke Layar Utama".
 */
export function InstallPrompt({ className }: { className?: string }) {
  const t = useTranslations("pwa");
  const isClient = useIsClient();
  const standalone = useStandalone();
  const platform = usePlatform();
  const { canPrompt, installed } = useInstallState();
  const dismissed = useLocalValue(INSTALL_DISMISSED_KEY) === "1";

  if (!isClient || standalone || installed || dismissed) return null;
  if (!canPrompt && platform !== "ios") return null;

  const dismiss = () => writeLocal(INSTALL_DISMISSED_KEY, "1");

  return (
    <section aria-labelledby="install-prompt-title" className={cn("card-surface relative p-5", className)}>
      <button type="button" onClick={dismiss} aria-label={t("later")} className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
        <X className="size-4" aria-hidden />
      </button>
      <div className="flex items-start gap-4 pr-6">
        <IconCircle tone="brand" shape="square">
          <Smartphone />
        </IconCircle>
        <div className="min-w-0">
          <h2 id="install-prompt-title" className="font-bold">
            {t("installTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("installBody")}</p>
        </div>
      </div>
      {canPrompt ? (
        <div className="mt-4 flex gap-2">
          <InstallButton className="flex-1" />
          <Button variant="ghost" onClick={dismiss}>
            {t("later")}
          </Button>
        </div>
      ) : (
        <IosSteps className="mt-4" />
      )}
    </section>
  );
}

/** Tombol pasang (hanya tampil bila browser menyediakan prompt instal). */
export function InstallButton({ className }: { className?: string }) {
  const t = useTranslations("pwa");
  const { canPrompt } = useInstallState();
  const toast = useToast();
  if (!canPrompt) return null;
  return (
    <Button
      className={className}
      onClick={async () => {
        const outcome = await promptInstall();
        if (outcome === "accepted") toast({ title: t("installed"), tone: "success" });
      }}
    >
      <Download aria-hidden />
      {t("installButton")}
    </Button>
  );
}

/** Langkah Safari iOS: Bagikan lalu Tambah ke Layar Utama. */
export function IosSteps({ className }: { className?: string }) {
  const t = useTranslations("pwa");
  return (
    <ol className={cn("space-y-2 rounded-xl bg-surface p-4 text-sm", className)}>
      <li className="flex items-center gap-3">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background">
          <Share className="size-4 stroke-[1.5]" aria-hidden />
        </span>
        <span>{t("iosStep1")}</span>
      </li>
      <li className="flex items-center gap-3">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background">
          <SquarePlus className="size-4 stroke-[1.5]" aria-hidden />
        </span>
        <span>{t("iosStep2")}</span>
      </li>
    </ol>
  );
}
