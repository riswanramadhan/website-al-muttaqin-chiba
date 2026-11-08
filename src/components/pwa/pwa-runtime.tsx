"use client";

import * as React from "react";
import { usePathname } from "@/i18n/navigation";
import { startInstallListener } from "./install-store";
import { OfflineBadge } from "./offline-badge";

/**
 * Dipasang sekali di layout locale: menangkap `beforeinstallprompt` sejak awal
 * dan menampilkan pil offline global (beranda App punya indikator sendiri).
 */
export function PwaRuntime() {
  const pathname = usePathname();
  React.useEffect(() => {
    startInstallListener();
  }, []);
  if (pathname === "/app") return null;
  return <OfflineBadge variant="floating" />;
}
