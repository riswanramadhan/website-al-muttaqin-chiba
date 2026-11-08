"use client";

import * as React from "react";
import { createT, type AdminLang, type Translate } from "@/components/admin/i18n";

type AdminI18nValue = { lang: AdminLang; t: Translate };

const AdminI18nContext = React.createContext<AdminI18nValue | null>(null);

/** Menyediakan bahasa UI admin ke komponen client (dibaca dari cookie di layout). */
export function AdminI18nProvider({ lang, children }: { lang: AdminLang; children: React.ReactNode }) {
  const value = React.useMemo<AdminI18nValue>(() => ({ lang, t: createT(lang) }), [lang]);
  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminT(): AdminI18nValue {
  const ctx = React.useContext(AdminI18nContext);
  if (!ctx) throw new Error("useAdminT harus dipakai di dalam AdminI18nProvider");
  return ctx;
}
