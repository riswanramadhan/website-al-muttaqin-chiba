"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, LoaderCircle, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Pemutar murottal satu surah (Mishary Rashid Alafasy).
 * - Dua sumber: cdn.islamic.network lalu mp3quran.net sebagai cadangan bila yang pertama gagal.
 * - `data-media-player` membuat ketukan di sini tidak dipakai untuk "membuka" audio adzan
 *   (lihat `unlockAudio`), karena di iOS hal itu menghentikan murottal yang baru diputar.
 * - Media Session: judul surah tampil di layar kunci / pusat kontrol.
 */

type Status = "idle" | "loading" | "playing" | "paused" | "error";

function sourcesFor(surah: number): string[] {
  const padded = String(surah).padStart(3, "0");
  return [`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah}.mp3`, `https://server8.mp3quran.net/afs/${padded}.mp3`];
}

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

export function MurottalPlayer({ surah, title, subtitle }: { surah: number; title: string; subtitle: string }) {
  const t = useTranslations("quran");
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const sources = React.useMemo(() => sourcesFor(surah), [surah]);
  const [srcIndex, setSrcIndex] = React.useState(0);
  const [status, setStatus] = React.useState<Status>("idle");
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const wantPlay = React.useRef(false);

  // Ganti surah: kembali ke sumber pertama dan status awal.
  const [prevSurah, setPrevSurah] = React.useState(surah);
  if (prevSurah !== surah) {
    setPrevSurah(surah);
    setSrcIndex(0);
    setStatus("idle");
    setTime(0);
    setDuration(0);
  }

  React.useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: "Mishary Rashid Alafasy",
        album: subtitle,
        artwork: [{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
      });
    } catch {
      // abaikan
    }
  }, [title, subtitle]);

  async function play() {
    const el = audioRef.current;
    if (!el) return;
    wantPlay.current = true;
    if (status === "error") {
      setSrcIndex(0);
      el.src = sources[0];
      el.load();
    }
    setStatus("loading");
    try {
      await el.play();
    } catch (err) {
      if ((err as { name?: string } | null)?.name === "AbortError") return;
      // NotSupportedError / sumber gagal: penanganan lewat onError (pindah ke sumber cadangan).
      if ((err as { name?: string } | null)?.name === "NotAllowedError") {
        wantPlay.current = false;
        setStatus("paused");
      }
    }
  }

  function pause() {
    wantPlay.current = false;
    audioRef.current?.pause();
  }

  function onError() {
    const next = srcIndex + 1;
    const el = audioRef.current;
    if (next < sources.length && el) {
      setSrcIndex(next);
      el.src = sources[next];
      el.load();
      if (wantPlay.current) void el.play().catch(() => undefined);
      return;
    }
    wantPlay.current = false;
    setStatus("error");
  }

  function seek(value: number) {
    const el = audioRef.current;
    if (!el || !Number.isFinite(value)) return;
    el.currentTime = value;
    setTime(value);
  }

  const playing = status === "playing";
  const busy = status === "loading";
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div data-media-player className="w-full rounded-2xl border border-border bg-surface/70 p-3 text-left">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (playing || busy ? pause() : void play())}
          aria-label={playing || busy ? t("reader.audioPause") : t("reader.audioPlay")}
          className={cn(
            "relative flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-200 active:scale-90",
            playing && "ring-4 ring-primary/20",
          )}
        >
          {busy ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
          ) : playing ? (
            <Pause className="size-5 fill-current" aria-hidden />
          ) : (
            <Play className="size-5 translate-x-px fill-current" aria-hidden />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{t("reader.audioLabel")}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="w-10 shrink-0 text-[11px] text-muted-foreground tabular">{formatClock(time)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(time, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              disabled={!duration}
              aria-label={t("reader.audioSeek")}
              className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary disabled:cursor-default"
              style={{ background: `linear-gradient(to right, var(--primary) ${progress}%, var(--border) ${progress}%)` }}
            />
            <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground tabular">{formatClock(duration)}</span>
          </div>
        </div>
      </div>
      {status === "error" ? (
        <p role="alert" className="mt-2 flex items-center gap-2 text-xs text-destructive">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden />
          <span className="flex-1">{t("reader.audioError")}</span>
          <button type="button" onClick={() => void play()} className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
            <RotateCcw className="size-3.5" aria-hidden />
            {t("reader.retry")}
          </button>
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-muted-foreground">{t("reader.audioHint")}</p>
      )}
      <audio
        ref={audioRef}
        key={surah}
        src={sources[0]}
        preload="none"
        playsInline
        onPlaying={() => setStatus("playing")}
        onWaiting={() => wantPlay.current && setStatus("loading")}
        onPause={() => setStatus((s) => (s === "error" ? s : "paused"))}
        onEnded={() => {
          wantPlay.current = false;
          setStatus("paused");
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onError={onError}
      >
        {t("reader.audioUnsupported")}
      </audio>
    </div>
  );
}
