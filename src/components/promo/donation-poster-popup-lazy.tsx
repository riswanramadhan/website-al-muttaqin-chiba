"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { PromoPopup } from "@/lib/types";
import { promoSeenKey, readPromoSeen } from "@/components/promo/seen";

const DonationPosterPopup = dynamic(() => import("./donation-poster-popup").then((m) => m.DonationPosterPopup), { ssr: false });

/**
 * Pemuat malas pop-up poster promo. Pop-up beserta pustaka animasi dan dialognya (sekitar 50 KB
 * terkompresi) hanya diunduh bila memang akan tampil: fitur aktif dan perangkat ini belum pernah
 * melihat versi poster tersebut. Pengunjung yang sudah pernah melihatnya tidak mengunduh apa pun.
 */
export function DonationPosterPopupLazy({ popup, alt }: { popup: PromoPopup; alt: string }) {
  const [wanted, setWanted] = React.useState(false);
  const { enabled, version } = popup;
  const src = popup.image.src;

  React.useEffect(() => {
    if (!enabled || !src || readPromoSeen(promoSeenKey(version))) return;
    // Ditunda sebentar agar tidak berebut jaringan dengan konten utama halaman.
    const timer = window.setTimeout(() => setWanted(true), 400);
    return () => window.clearTimeout(timer);
  }, [enabled, src, version]);

  return wanted ? <DonationPosterPopup popup={popup} alt={alt} /> : null;
}
