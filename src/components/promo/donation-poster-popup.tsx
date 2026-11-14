"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HeartHandshake, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { PromoPopup } from "@/lib/types";
import { markPromoSeen, promoSeenKey, readPromoSeen } from "@/components/promo/seen";

const AUTO_CLOSE_MS = 5000;
const OPEN_DELAY_MS = 700;

/**
 * Pop-up poster donasi pada akses pertama: tampil sekali per perangkat (localStorage),
 * menutup otomatis setelah 5 detik (bilah progres), bisa ditutup dengan tombol X / Esc /
 * ketuk latar. Mengetuk poster atau tombol membuka halaman Infaq.
 */
export function DonationPosterPopup({ popup, alt }: { popup: PromoPopup; alt: string }) {
  const t = useTranslations("donate");
  const { enabled, image, href, version } = popup;
  const seenKey = promoSeenKey(version);
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);

  // Akses pertama: unduh poster dulu agar langsung tampil utuh, lalu buka (minimal setelah jeda singkat).
  React.useEffect(() => {
    if (!enabled || !image.src || readPromoSeen(seenKey)) return;
    let cancelled = false;
    let delayDone = false;
    let imageDone = false;
    const show = () => {
      if (cancelled || !delayDone || !imageDone) return;
      markPromoSeen(seenKey);
      setOpen(true);
    };
    const img = new window.Image();
    img.onload = img.onerror = () => {
      imageDone = true;
      show();
    };
    img.src = image.src;
    const timer = window.setTimeout(() => {
      delayDone = true;
      show();
    }, OPEN_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, image.src, seenKey]);

  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showClose={false}
        className="w-[min(calc(100vw-2rem),26rem,calc((100dvh-8.5rem)*0.8))] max-w-none gap-0 overflow-visible rounded-3xl border-0 bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{t("promo.title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("promo.description")}</DialogDescription>

        <div className="relative overflow-hidden rounded-3xl bg-card shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
          <Link href={href} onClick={() => setOpen(false)} className="block focus-visible:ring-inset" aria-label={t("promo.cta")}>
            <Image src={image.src} alt={alt || t("promo.alt")} width={image.width || 1080} height={image.height || 1350} unoptimized className="block h-auto w-full" />
          </Link>
          {/* Bilah waktu tutup otomatis */}
          <div className="absolute inset-x-0 top-0 h-1 bg-black/20" aria-hidden>
            {open && (
              <motion.div
                className="h-full origin-left bg-gold-soft"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: reduce ? 0 : AUTO_CLOSE_MS / 1000, ease: "linear" }}
              />
            )}
          </div>
          <DialogClose
            className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/25 backdrop-blur-md transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">{t("promo.close")}</span>
          </DialogClose>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <Link href="/donate" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "primary" }), "shadow-lg")}>
            <HeartHandshake />
            {t("promo.cta")}
          </Link>
          <DialogClose className={cn(buttonVariants({ variant: "inverse" }), "shadow-lg")}>{t("promo.later")}</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
