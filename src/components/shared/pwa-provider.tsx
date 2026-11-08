"use client";

import * as React from "react";
import { SerwistProvider } from "@serwist/turbopack/react";

/** Mendaftarkan service worker (/serwist/sw.js) di semua halaman; aman dipakai di root layout. */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" options={{ scope: "/" }}>
      {children}
    </SerwistProvider>
  );
}
