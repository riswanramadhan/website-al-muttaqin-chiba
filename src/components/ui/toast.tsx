"use client";

import * as React from "react";
import { CircleCheck, CircleX, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastTone = "default" | "success" | "error";
type Toast = { id: number; title: string; description?: string; tone: ToastTone };

const ToastContext = React.createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

/** Pemberitahuan singkat di sudut layar. Pakai: const toast = useToast(); toast({ title, tone }). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-popover p-4 text-sm shadow-soft animate-in fade-in-0 slide-in-from-bottom-2",
            )}
            role="status"
          >
            {t.tone === "success" ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" /> : t.tone === "error" ? <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" /> : <Info className="mt-0.5 size-5 shrink-0 text-brand" />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-muted-foreground">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="rounded-full p-1 text-muted-foreground hover:bg-surface" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx.push;
}
