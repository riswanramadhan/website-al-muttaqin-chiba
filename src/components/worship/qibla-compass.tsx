"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Compass, ExternalLink, LocateFixed, MapPin, TriangleAlert } from "lucide-react";
import type { GeoPoint, Locale } from "@/lib/types";
import { getQiblaDirection } from "@/lib/prayer";
import { formatNumber } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { useIsClient, useReducedMotionPreference } from "./storage";
import { angularDistance, compassPoint, googleMapsQiblaUrl, haversineKm, KAABA, normalizeDegrees, shortestDelta } from "./utils";

type SensorStatus = "idle" | "needsPermission" | "waiting" | "active" | "unsupported" | "denied";

type OrientationEventLike = DeviceOrientationEvent & { webkitCompassHeading?: number };
type OrientationCtor = { requestPermission?: () => Promise<"granted" | "denied"> };

function needsPermission(): boolean {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return false;
  return typeof (DeviceOrientationEvent as unknown as OrientationCtor).requestPermission === "function";
}

function initialStatus(): SensorStatus {
  if (typeof window === "undefined") return "idle";
  if (!("DeviceOrientationEvent" in window)) return "unsupported";
  return needsPermission() ? "needsPermission" : "waiting";
}

/** Arah dari event orientasi: webkitCompassHeading (iOS) atau 360 - alpha (absolut). */
function headingFromEvent(e: OrientationEventLike): { heading: number; absolute: boolean } | null {
  if (typeof e.webkitCompassHeading === "number" && !Number.isNaN(e.webkitCompassHeading)) {
    return { heading: normalizeDegrees(e.webkitCompassHeading), absolute: true };
  }
  if (typeof e.alpha === "number" && !Number.isNaN(e.alpha)) {
    return { heading: normalizeDegrees(360 - e.alpha), absolute: e.absolute === true || e.type === "deviceorientationabsolute" };
  }
  return null;
}

const ALIGN_TOLERANCE = 5;
const SENSOR_TIMEOUT_MS = 3000;

export function QiblaCompass({ mosque, locale }: { mosque: GeoPoint; locale: Locale }) {
  const t = useTranslations("qibla");
  const isClient = useIsClient();
  const reducedMotion = useReducedMotionPreference();

  const [status, setStatus] = React.useState<SensorStatus>(initialStatus);
  const [relative, setRelative] = React.useState(false);
  /** Arah HP sebagai nilai kontinu (boleh > 360) agar transisi tidak berputar balik. */
  const [headingCont, setHeadingCont] = React.useState<number | null>(null);
  const [userPos, setUserPos] = React.useState<GeoPoint | null>(null);
  const [locating, setLocating] = React.useState(false);
  const [locError, setLocError] = React.useState(false);

  const origin = userPos ?? mosque;
  const qibla = React.useMemo(() => normalizeDegrees(getQiblaDirection(origin)), [origin]);
  const distanceKm = React.useMemo(() => haversineKm(origin, KAABA), [origin]);
  const heading = headingCont === null ? null : normalizeDegrees(headingCont);
  const aligned = heading !== null && angularDistance(heading, qibla) < ALIGN_TOLERANCE;

  const listening = status === "waiting" || status === "active";

  React.useEffect(() => {
    if (!listening) return;
    let received = false;
    const onOrientation = (ev: Event) => {
      const parsed = headingFromEvent(ev as OrientationEventLike);
      if (!parsed) return;
      received = true;
      setRelative(!parsed.absolute);
      setStatus("active");
      setHeadingCont((prev) => (prev === null ? parsed.heading : prev + shortestDelta(prev, parsed.heading)));
    };
    window.addEventListener("deviceorientationabsolute", onOrientation);
    window.addEventListener("deviceorientation", onOrientation);
    const timer = window.setTimeout(() => {
      if (!received) setStatus("unsupported");
    }, SENSOR_TIMEOUT_MS);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("deviceorientationabsolute", onOrientation);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [listening]);

  async function enableCompass() {
    const ctor = DeviceOrientationEvent as unknown as OrientationCtor;
    if (!ctor.requestPermission) {
      setStatus("waiting");
      return;
    }
    try {
      const result = await ctor.requestPermission();
      setStatus(result === "granted" ? "waiting" : "denied");
    } catch {
      setStatus("denied");
    }
  }

  // Pengaturan App (acc-qibla-location = "device"): hitung kiblat dari lokasi perangkat secara otomatis.
  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem("acc-qibla-location");
    } catch {
      stored = null;
    }
    if (stored !== "device" || !("geolocation" in navigator)) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!cancelled) setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocError(true);
      return;
    }
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  const transition = reducedMotion ? undefined : "transform 180ms ease-out";
  const dialRotation = heading === null ? 0 : -(headingCont ?? 0);
  const statusKey: SensorStatus = isClient ? status : "idle";
  const showSensorFallback = isClient && (status === "unsupported" || status === "denied");

  return (
    <div className="flex flex-col gap-4">
      <section className={cn("card-surface relative overflow-hidden p-5", aligned && "ring-2 ring-success")} aria-live="polite">
        <div className="mx-auto w-full max-w-[18rem]">
          <svg viewBox="0 0 240 240" role="img" aria-label={t("compassLabel")} className="h-auto w-full select-none">
            <circle cx="120" cy="120" r="114" className="fill-surface stroke-border" strokeWidth="2" />
            <g style={{ transform: `rotate(${dialRotation}deg)`, transformOrigin: "120px 120px", transition }}>
              {Array.from({ length: 36 }, (_, i) => {
                const major = i % 9 === 0;
                const mid = i % 3 === 0;
                return (
                  <line
                    key={i}
                    x1="120"
                    y1={major ? 14 : mid ? 18 : 22}
                    x2="120"
                    y2="28"
                    transform={`rotate(${i * 10} 120 120)`}
                    className={cn(major ? "stroke-foreground" : "stroke-border")}
                    strokeWidth={major ? 2.5 : 1.5}
                    strokeLinecap="round"
                  />
                );
              })}
              {(["n", "e", "s", "w"] as const).map((k, i) => (
                <text
                  key={k}
                  x="120"
                  y="48"
                  textAnchor="middle"
                  transform={`rotate(${i * 90} 120 120)`}
                  className={cn("text-[14px] font-bold", k === "n" ? "fill-primary" : "fill-muted-foreground")}
                >
                  {t(`cardinal.${k}`)}
                </text>
              ))}
              <g style={{ transform: `rotate(${qibla}deg)`, transformOrigin: "120px 120px", transition }}>
                <line x1="120" y1="120" x2="120" y2="72" className={cn(aligned ? "stroke-success" : "stroke-primary")} strokeWidth="3" strokeLinecap="round" />
                <rect x="110" y="54" width="20" height="20" rx="3" className={cn(aligned ? "fill-success" : "fill-foreground")} />
                <rect x="110" y="60" width="20" height="3" className="fill-background" />
              </g>
            </g>
            <path d="M120 2 L128 16 L112 16 Z" className={cn(aligned ? "fill-success" : "fill-primary")} />
            <circle cx="120" cy="120" r="34" className="fill-background stroke-border" strokeWidth="1.5" />
            <text x="120" y="118" textAnchor="middle" className="fill-foreground text-[22px] font-bold tabular">
              {Math.round(qibla)}°
            </text>
            <text x="120" y="136" textAnchor="middle" className="fill-muted-foreground text-[11px] font-semibold">
              {compassPoint(qibla)}
            </text>
          </svg>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2 text-center">
          {aligned ? (
            <Badge variant="success">{t("aligned")}</Badge>
          ) : (
            <Badge variant={statusKey === "active" ? "soft" : "outline"}>
              <Compass />
              {t(`status.${statusKey}`)}
            </Badge>
          )}
          {isClient && relative && status === "active" && <p className="text-xs text-muted-foreground">{t("status.relative")}</p>}
          {isClient && status === "needsPermission" && (
            <Button size="sm" onClick={enableCompass}>
              <Compass />
              {t("actions.enableCompass")}
            </Button>
          )}
          {isClient && (status === "active" || status === "waiting") && <p className="text-sm text-muted-foreground">{t("rotateHint")}</p>}
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3">
        <div className="card-muted p-4">
          <dt className="text-xs font-semibold text-muted-foreground">{t("qiblaLabel")}</dt>
          <dd className="mt-1 text-lg font-bold tabular">{t("degrees", { deg: formatNumber(Math.round(qibla * 10) / 10, locale) })}</dd>
        </div>
        <div className="card-muted p-4">
          <dt className="text-xs font-semibold text-muted-foreground">{t("distanceLabel")}</dt>
          <dd className="mt-1 text-lg font-bold tabular">{t("distance", { km: formatNumber(Math.round(distanceKm), locale) })}</dd>
        </div>
        {heading !== null && (
          <div className="card-muted p-4">
            <dt className="text-xs font-semibold text-muted-foreground">{t("headingLabel")}</dt>
            <dd className="mt-1 text-lg font-bold tabular">
              {Math.round(heading)}° {compassPoint(heading)}
            </dd>
          </div>
        )}
        <div className={cn("card-muted p-4", heading === null && "col-span-2")}>
          <dt className="text-xs font-semibold text-muted-foreground">{t("location.label")}</dt>
          <dd className="mt-1 flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            {userPos ? t("location.yours") : t("location.mosque")}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        {userPos ? (
          <Button variant="outline" size="sm" onClick={() => setUserPos(null)}>
            <MapPin />
            {t("actions.useMosque")}
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
            <LocateFixed />
            {locating ? t("actions.locating") : t("actions.useLocation")}
          </Button>
        )}
        <a href={googleMapsQiblaUrl(origin)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "soft", size: "sm" })}>
          <ExternalLink />
          {t("actions.openMaps")}
        </a>
      </div>
      {locError && <p className="text-sm text-destructive">{t("location.error")}</p>}

      {showSensorFallback && (
        <div className="card-muted flex items-start gap-3 p-4">
          <IconCircle size="sm" tone="soft">
            <Compass />
          </IconCircle>
          <p className="text-sm text-muted-foreground">{t("noSensorHint")}</p>
        </div>
      )}
      <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
        <p className="text-sm text-muted-foreground">{t("calibration")}</p>
      </div>
    </div>
  );
}
