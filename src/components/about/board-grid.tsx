import * as React from "react";
import Image from "next/image";
import type { BoardMember, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";

function initials(name: string): string {
  const clean = name.replace(/^PLACEHOLDER:\s*/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Daftar pengurus dengan avatar inisial bila tanpa foto (PRD-03a). */
export function BoardGrid({ members, locale, placeholderLabel }: { members: BoardMember[]; locale: Locale; placeholderLabel: string }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => {
        const isPlaceholder = /^PLACEHOLDER:/i.test(m.name);
        const name = isPlaceholder ? placeholderLabel : m.name;
        return (
          <li key={m.id} className="card-surface flex items-center gap-4 p-5">
            {m.photo ? (
              <Image src={m.photo} alt={name} width={56} height={56} className="size-14 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-accent-foreground" aria-hidden>
                {initials(m.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-bold leading-snug">{name}</p>
              <p className="mt-0.5 text-sm text-brand">{pick(m.role, locale)}</p>
              {m.organization && <p className="mt-0.5 truncate text-xs text-muted-foreground">{m.organization}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
