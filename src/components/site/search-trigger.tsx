"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { SearchDialog } from "@/components/search/search-dialog";
import { cn } from "@/lib/utils/cn";

function noopSubscribe(): () => void {
  return () => {};
}

function readIsMac(): boolean {
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
}

/** Hanya satu pemicu yang memegang pintasan Ctrl/Cmd+K bila ada beberapa di halaman. */
let shortcutOwner: symbol | null = null;

/**
 * Tombol pencarian global: membuka dialog pencarian (PRD-07b) dan memasang pintasan Ctrl/Cmd+K.
 */
export function SearchTrigger({ tone = "default", className }: { tone?: "default" | "inverse"; className?: string }) {
  const t = useTranslations("search");
  const [open, setOpen] = React.useState(false);
  const isMac = React.useSyncExternalStore(noopSubscribe, readIsMac, () => false);
  const shortcut = isMac ? "⌘K" : "Ctrl+K";

  React.useEffect(() => {
    const id = Symbol("search-trigger");
    if (shortcutOwner) return;
    shortcutOwner = id;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (shortcutOwner === id) shortcutOwner = null;
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("title")}
        aria-haspopup="dialog"
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        title={t("hint", { shortcut })}
        className={cn(buttonVariants({ variant: tone === "inverse" ? "outlineInverse" : "ghost", size: "icon" }), className)}
      >
        <Search />
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} shortcutLabel={shortcut} />
    </>
  );
}
