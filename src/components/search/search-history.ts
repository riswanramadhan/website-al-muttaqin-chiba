"use client";

import { readLocalJson, useLocalJson, writeLocal } from "@/components/pwa/local-store";

export const SEARCH_HISTORY_KEY = "acc-search-history";
const HISTORY_LIMIT = 5;
const EMPTY: string[] = [];

export function useSearchHistory(): { history: string[]; add: (query: string) => void; remove: (query: string) => void; clear: () => void } {
  const [stored] = useLocalJson<string[]>(SEARCH_HISTORY_KEY, EMPTY);
  const history = Array.isArray(stored) ? stored.filter((s): s is string => typeof s === "string").slice(0, HISTORY_LIMIT) : EMPTY;
  return {
    history,
    add: addSearchHistory,
    remove: (query: string) => {
      const current = readLocalJson<string[]>(SEARCH_HISTORY_KEY, EMPTY);
      writeLocal(SEARCH_HISTORY_KEY, JSON.stringify(current.filter((q) => q !== query)));
    },
    clear: () => writeLocal(SEARCH_HISTORY_KEY, null),
  };
}

export function addSearchHistory(query: string): void {
  const q = query.trim();
  if (!q) return;
  const current = readLocalJson<string[]>(SEARCH_HISTORY_KEY, EMPTY);
  const list = Array.isArray(current) ? current.filter((s) => typeof s === "string" && s.toLowerCase() !== q.toLowerCase()) : [];
  writeLocal(SEARCH_HISTORY_KEY, JSON.stringify([q, ...list].slice(0, HISTORY_LIMIT)));
}
