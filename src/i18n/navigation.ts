import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Pembungkus navigasi Next.js yang sadar locale.
 * Selalu pakai Link/useRouter/usePathname/redirect dari sini, bukan dari next/link
 * atau next/navigation, agar prefix /ja, /en, /id ikut otomatis.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
