"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Bookmark, ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, Type } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale, QuranSurahMeta } from "@/lib/types";
import { formatNumber } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/primitives";
import { ArabicSizeControl, useArabicSizeClass } from "./arabic-size-control";
import { readJson, useStoredJson, writeJson } from "./storage";
import { LAST_READ_KEY, surahLocalName, type LastRead } from "./surah-list";
import { BASMALAH, stripBasmalah } from "./utils";

const EDITIONS: Record<Locale, string> = { id: "id.indonesian", en: "en.sahih", ja: "ja.ryoichi" };
const ARABIC_EDITION = "quran-uthmani";

type ApiAyah = { numberInSurah: number; text: string };
type ApiEdition = { edition: { identifier: string }; ayahs: ApiAyah[] };
type ApiResponse = { code: number; data: ApiEdition[] };

type Ayah = { n: number; arabic: string; translation: string };
type Loaded = { ayahs: Ayah[]; fromCache: boolean };
type State = { status: "loading" } | { status: "ready"; data: Loaded } | { status: "error" };

function cacheKey(surah: number, edition: string): string {
  return `acc-quran-${surah}-${edition}`;
}

function parseResponse(json: ApiResponse, surah: number): Ayah[] {
  const arabic = json.data.find((d) => d.edition.identifier === ARABIC_EDITION) ?? json.data[0];
  const translation = json.data.find((d) => d.edition.identifier !== ARABIC_EDITION) ?? json.data[1];
  if (!arabic) throw new Error("empty");
  const stripFirst = surah !== 1 && surah !== 9;
  return arabic.ayahs.map((a, i) => ({
    n: a.numberInSurah,
    arabic: stripFirst && a.numberInSurah === 1 ? stripBasmalah(a.text) : a.text,
    translation: translation?.ayahs[i]?.text ?? "",
  }));
}

async function fetchSurah(surah: number, edition: string): Promise<Ayah[]> {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/editions/${ARABIC_EDITION},${edition}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse;
  if (json.code !== 200 || !Array.isArray(json.data)) throw new Error("bad response");
  return parseResponse(json, surah);
}

const NO_LAST_READ: LastRead | null = null;

export function SurahReader({ meta, prev, next, locale }: { meta: QuranSurahMeta; prev?: QuranSurahMeta; next?: QuranSurahMeta; locale: Locale }) {
  const t = useTranslations("quran");
  const edition = EDITIONS[locale];
  const arabicClass = useArabicSizeClass();
  const [state, setState] = React.useState<State>({ status: "loading" });
  const [attempt, setAttempt] = React.useState(0);
  const [arabicOnly, setArabicOnly] = React.useState(false);
  const [jump, setJump] = React.useState("");
  const [lastRead] = useStoredJson<LastRead | null>(LAST_READ_KEY, NO_LAST_READ);
  const listRef = React.useRef<HTMLOListElement>(null);

  const surah = meta.number;
  const showBasmalah = surah !== 1 && surah !== 9;

  React.useEffect(() => {
    let cancelled = false;
    const key = cacheKey(surah, edition);
    const cached = readJson<Ayah[] | null>(key, null);
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    const source: Promise<Loaded> =
      offline && cached
        ? Promise.resolve({ ayahs: cached, fromCache: true })
        : fetchSurah(surah, edition).then((ayahs) => {
            writeJson(key, ayahs);
            return { ayahs, fromCache: false };
          });
    source
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (cancelled) return;
        if (cached) setState({ status: "ready", data: { ayahs: cached, fromCache: true } });
        else setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [surah, edition, attempt]);

  // Simpan ayat terakhir yang terlihat (IntersectionObserver), tanpa setState.
  React.useEffect(() => {
    if (state.status !== "ready" || !listRef.current || typeof IntersectionObserver === "undefined") return;
    const items = Array.from(listRef.current.querySelectorAll<HTMLElement>("[data-ayah]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const n = Number(entry.target.getAttribute("data-ayah"));
          if (Number.isFinite(n)) writeJson<LastRead>(LAST_READ_KEY, { surah, ayah: n });
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    for (const el of items) observer.observe(el);
    return () => observer.disconnect();
  }, [state.status, surah]);

  // Lompat ke hash #ayah-N setelah data siap.
  React.useEffect(() => {
    if (state.status !== "ready") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#ayah-")) return;
    const el = document.getElementById(hash.slice(1));
    const raf = window.requestAnimationFrame(() => el?.scrollIntoView({ block: "center" }));
    return () => window.cancelAnimationFrame(raf);
  }, [state.status]);

  function scrollToAyah(n: number) {
    const el = document.getElementById(`ayah-${n}`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  }

  function onJump(e: React.FormEvent) {
    e.preventDefault();
    const n = Number.parseInt(jump, 10);
    if (Number.isFinite(n) && n >= 1 && n <= meta.numberOfAyahs) scrollToAyah(n);
  }

  const lastReadHere = lastRead && lastRead.surah === surah ? lastRead.ayah : null;

  return (
    <div className="flex flex-col gap-4">
      <section className="card-surface flex flex-col items-center gap-2 p-5 text-center">
        <p lang="ar" dir="rtl" className="font-arabic text-4xl leading-snug">
          {meta.name}
        </p>
        <p className="text-sm text-muted-foreground">{surahLocalName(meta, locale)}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline">{t("surahNumber", { n: meta.number })}</Badge>
          <Badge variant="outline">{t(`revelation.${meta.revelationType}`)}</Badge>
          <Badge variant="outline">{t("ayahs", { count: meta.numberOfAyahs })}</Badge>
        </div>
        <div className="mt-2 w-full">
          <p className="mb-1 text-xs text-muted-foreground">{t("reader.audioLabel")}</p>
          <audio controls preload="none" className="w-full" src={`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah}.mp3`}>
            {t("reader.audioUnsupported")}
          </audio>
          <p className="mt-1 text-[11px] text-muted-foreground">{t("reader.audioHint")}</p>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ArabicSizeControl labels={{ label: t("reader.arabicSize"), sm: t("reader.sizeSm"), md: t("reader.sizeMd"), lg: t("reader.sizeLg") }} />
          <Button variant={arabicOnly ? "primary" : "outline"} size="sm" aria-pressed={arabicOnly} onClick={() => setArabicOnly((v) => !v)}>
            <Type />
            {arabicOnly ? t("reader.arabicOnly") : t("reader.withTranslation")}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={onJump} className="flex flex-1 gap-2">
            <Input type="number" inputMode="numeric" min={1} max={meta.numberOfAyahs} value={jump} onChange={(e) => setJump(e.target.value)} placeholder={t("reader.jumpPlaceholder")} aria-label={t("reader.jumpLabel")} className="h-9 min-w-0 flex-1" />
            <Button type="submit" variant="soft" size="sm">
              {t("reader.jumpGo")}
            </Button>
          </form>
          {lastReadHere !== null && state.status === "ready" && (
            <Button variant="ghost" size="sm" onClick={() => scrollToAyah(lastReadHere)}>
              <Bookmark />
              {t("reader.lastRead", { ayah: formatNumber(lastReadHere, locale) })}
            </Button>
          )}
        </div>
      </div>

      {state.status === "loading" && (
        <div className="flex flex-col gap-3" role="status" aria-live="polite">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {t("reader.loading")}
          </p>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card-surface flex flex-col gap-3 p-4">
              <Skeleton className="ml-auto h-8 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div className="card-muted flex flex-col items-center gap-3 p-6 text-center" role="alert">
          <CircleAlert className="size-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{t("reader.error")}</p>
          <Button size="sm" onClick={() => {
            setState({ status: "loading" });
            setAttempt((a) => a + 1);
          }}>
            {t("reader.retry")}
          </Button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          {state.data.fromCache && <p className="text-xs text-muted-foreground">{t("reader.offlineCopy")}</p>}
          {showBasmalah && (
            <div className="card-muted flex flex-col items-center gap-1 p-4 text-center">
              <p lang="ar" dir="rtl" className={cn("font-arabic", arabicClass)}>
                {BASMALAH}
              </p>
              {!arabicOnly && <p className="text-xs text-muted-foreground">{t("reader.basmalah")}</p>}
            </div>
          )}
          <ol ref={listRef} className="flex flex-col gap-3">
            {state.data.ayahs.map((a) => (
              <li key={a.n} id={`ayah-${a.n}`} data-ayah={a.n} tabIndex={-1} className="card-surface scroll-mt-20 flex flex-col gap-3 p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-bold tabular" aria-label={t("reader.ayah", { n: a.n })}>
                    {formatNumber(a.n, locale)}
                  </span>
                  <p lang="ar" dir="rtl" className={cn("font-arabic min-w-0 flex-1 text-right", arabicClass)}>
                    {a.arabic}
                  </p>
                </div>
                {!arabicOnly && a.translation && <p className="text-sm leading-relaxed text-muted-foreground">{a.translation}</p>}
              </li>
            ))}
          </ol>
          {!arabicOnly && <p className="text-xs text-muted-foreground">{t("reader.translationSource", { edition: t(`reader.editions.${edition.replace(".", "_")}`) })}</p>}
        </>
      )}

      <nav className="flex items-center justify-between gap-2 border-t border-border pt-4" aria-label={t("title")}>
        {prev ? (
          <Link href={`/app/quran/${prev.number}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "max-w-[48%]")}>
            <ChevronLeft />
            <span className="truncate">{prev.transliteration}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/app/quran/${next.number}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "max-w-[48%]")}>
            <span className="truncate">{next.transliteration}</span>
            <ChevronRight />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
