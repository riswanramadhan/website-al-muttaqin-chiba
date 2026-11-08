"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck, LoaderCircle, WifiOff, CircleAlert } from "lucide-react";
import type { SerializedDay } from "@/lib/prayer";
import type { Locale } from "@/lib/types";
import { formatDateTime, tokyoDateKey } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { IconCircle } from "@/components/ui/primitives";
import { OFFLINE_DAYS, OFFLINE_STORAGE_KEY } from "./prayer-utils";
import { PrayerDayPicker } from "./prayer-day-picker";

type StoredSchedule = { savedAt: string; days: SerializedDay[] };
type Status = "saving" | "saved" | "offline" | "error" | "none";
type State = { status: Status; savedAt?: string; days?: SerializedDay[] };

function readStore(): StoredSchedule | null {
  try {
    const raw = window.localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSchedule>;
    if (!parsed || typeof parsed.savedAt !== "string" || !Array.isArray(parsed.days)) return null;
    return { savedAt: parsed.savedAt, days: parsed.days };
  } catch {
    return null;
  }
}

function writeStore(days: SerializedDay[]): string {
  const savedAt = new Date().toISOString();
  try {
    window.localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify({ savedAt, days } satisfies StoredSchedule));
  } catch {
    // Penyimpanan penuh atau diblokir: abaikan, jadwal tetap tampil dari jaringan.
  }
  return savedAt;
}

/** Hari mulai hari ini (Tokyo) dari daftar tersimpan. */
function fromToday(days: SerializedDay[]): SerializedDay[] {
  const today = tokyoDateKey();
  return days.filter((d) => d.dateKey >= today);
}

export type OfflineScheduleProps = {
  /** Jadwal awal dari server (dipakai sampai data jaringan/penyimpanan tersedia). */
  initialDays: SerializedDay[];
};

/**
 * Mengambil /api/prayer?days=30, menyimpannya di localStorage (`acc-prayer-30d`),
 * dan saat offline atau gagal memakai salinan tersimpan. Merender pemilih hari + catatan.
 */
export function OfflineSchedule({ initialDays }: OfflineScheduleProps) {
  const t = useTranslations("prayer");
  const locale = useLocale() as Locale;
  const [state, setState] = useState<State>({ status: "saving" });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function refresh() {
      try {
        const res = await fetch(`/api/prayer?days=${OFFLINE_DAYS}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { days?: SerializedDay[] };
        if (!Array.isArray(json.days) || json.days.length === 0) throw new Error("empty");
        const savedAt = writeStore(json.days);
        if (!cancelled) setState({ status: "saved", savedAt, days: fromToday(json.days) });
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
        const stored = readStore();
        const offline = typeof navigator !== "undefined" && !navigator.onLine;
        if (stored) setState({ status: offline ? "offline" : "error", savedAt: stored.savedAt, days: fromToday(stored.days) });
        else setState({ status: "none" });
      }
    }

    void refresh();
    const onOnline = () => void refresh();
    window.addEventListener("online", onOnline);
    return () => {
      cancelled = true;
      controller.abort();
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const days = state.days && state.days.length > 0 ? state.days : initialDays;
  const Icon = state.status === "saved" ? CircleCheck : state.status === "saving" ? LoaderCircle : state.status === "none" ? CircleAlert : WifiOff;
  const detail =
    state.status === "saved" && state.savedAt
      ? t("app.offlineSaved", { date: formatDateTime(state.savedAt, locale) })
      : state.status === "offline"
        ? t("app.offlineNow")
        : state.status === "error"
          ? t("app.offlineError")
          : state.status === "none"
            ? t("app.offlineNone")
            : t("app.offlineSaving");

  return (
    <div className="space-y-4">
      <PrayerDayPicker days={days} />
      <div className="card-muted flex items-start gap-3 p-4" role="status">
        <IconCircle size="sm" tone={state.status === "none" ? "default" : "soft"}>
          <Icon className={cn(state.status === "saving" && "motion-safe:animate-spin")} />
        </IconCircle>
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{t("app.offlineTitle")}</p>
          <p className="mt-0.5 text-muted-foreground">{t("app.offlineBody")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  );
}
