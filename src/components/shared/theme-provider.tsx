"use client";

import * as React from "react";
import type { GeoPoint, PrayerConfig } from "@/lib/types";
import { getPrayerTimesToday } from "@/lib/prayer";
import { tokyoDateKey } from "@/lib/utils/i18n";

export type ThemeMode = "light" | "dark" | "system" | "sun";

export const THEME_STORAGE_KEY = "acc-theme";
export const SUN_STORAGE_KEY = "acc-sun";

/**
 * Skrip inline yang dijalankan sebelum render untuk mencegah kedipan tema.
 * Mode "sun": gelap antara Maghrib dan matahari terbit (tema malam otomatis, PRD §1).
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=false;var m=matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'){d=true}else if(t==='light'){d=false}else if(t==='sun'){var s=null;try{s=JSON.parse(localStorage.getItem('${SUN_STORAGE_KEY}')||'null')}catch(e){}var n=Date.now();if(s&&s.sunrise&&s.maghrib){d=(n<s.sunrise)||(n>=s.maghrib)}else{d=m}}else{d=m}var c=document.documentElement.classList;if(d){c.add('dark')}else{c.remove('dark')}document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})();`;

type ThemeContextValue = {
  theme: ThemeMode;
  resolved: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(THEME_STORAGE_KEY);
  return v === "light" || v === "dark" || v === "sun" ? v : "system";
}

/** Penyimpanan tema sebagai external store agar bisa dibaca lewat useSyncExternalStore (tanpa setState di effect). */
const listeners = new Set<() => void>();
function subscribeTheme(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}
function getServerTheme(): ThemeMode {
  return "system";
}

export function ThemeProvider({ children, prayerConfig, coordinates }: { children: React.ReactNode; prayerConfig: PrayerConfig; coordinates: GeoPoint }) {
  const theme = React.useSyncExternalStore(subscribeTheme, readStoredTheme, getServerTheme);
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  const compute = React.useCallback(
    (mode: ThemeMode): "light" | "dark" => {
      const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (mode === "dark" || mode === "light") return mode;
      if (mode === "sun") {
        const today = getPrayerTimesToday(prayerConfig, coordinates);
        const record = { date: tokyoDateKey(), sunrise: today.times.sunrise.getTime(), maghrib: today.times.maghrib.getTime() };
        window.localStorage.setItem(SUN_STORAGE_KEY, JSON.stringify(record));
        const now = Date.now();
        return now < record.sunrise || now >= record.maghrib ? "dark" : "light";
      }
      return system;
    },
    [prayerConfig, coordinates],
  );

  const apply = React.useCallback(
    (mode: ThemeMode) => {
      const next = compute(mode);
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.style.colorScheme = next;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#0a0a0a" : "#7f1d1d");
      setResolved(next);
    },
    [compute],
  );

  React.useEffect(() => {
    // Sinkronkan kelas .dark dengan tema tersimpan; skrip inline sudah mencegah kedipan awal.
    const frame = requestAnimationFrame(() => apply(theme));
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(readStoredTheme());
    mq.addEventListener("change", onChange);
    // Mode "sun": cek setiap menit agar berganti tepat saat Maghrib/matahari terbit.
    const timer = window.setInterval(() => {
      if (readStoredTheme() === "sun") apply("sun");
    }, 60_000);
    return () => {
      cancelAnimationFrame(frame);
      mq.removeEventListener("change", onChange);
      window.clearInterval(timer);
    };
  }, [apply, theme]);

  const setTheme = React.useCallback(
    (mode: ThemeMode) => {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      listeners.forEach((l) => l());
      apply(mode);
    },
    [apply],
  );

  const value = React.useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme harus dipakai di dalam ThemeProvider");
  return ctx;
}
