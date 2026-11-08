"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, ExternalLink, Landmark, LoaderCircle, LocateFixed, MapPin, ShoppingBasket, Store, UtensilsCrossed } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";
import type { GeoPoint, HalalPlace, HalalPlaceType, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import { LeafletMap, type MapMarker } from "@/components/shared/map";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, IconCircle } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";
import { formatDistance, sortByDistance } from "./geo";

type TypeFilter = HalalPlaceType | "all";
const FILTERS: TypeFilter[] = ["all", "mosque", "prayer-room", "restaurant", "mart", "service"];

const TYPE_ICONS: Record<HalalPlaceType, React.ComponentType<{ className?: string }>> = {
  mosque: Landmark,
  "prayer-room": MapPin,
  restaurant: UtensilsCrossed,
  mart: ShoppingBasket,
  service: Store,
};

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
/** Tinggi viewport di klien (0 saat SSR); dipakai untuk peta 45vh pada varian App. */
function useViewportHeight(): number {
  return React.useSyncExternalStore(subscribeResize, () => window.innerHeight, () => 0);
}

type LocateState = "idle" | "locating" | "done" | "denied" | "unsupported";

export type HalalRadarProps = {
  places: HalalPlace[];
  locale: Locale;
  /** Titik asal jarak (koordinat masjid). */
  center: GeoPoint;
  /** Nomor WhatsApp pengurus untuk tombol "usulkan tempat"; tanpa ini tombol disembunyikan. */
  whatsapp?: string;
  /** `app`: peta setinggi ~45vh dan daftar satu kolom. */
  variant?: "site" | "app";
};

/**
 * Radar halal: peta Leaflet dengan marker per jenis, daftar terurut jarak (haversine dari masjid
 * atau dari lokasi pengguna), filter jenis, badge terverifikasi, Google Maps, usulan via WhatsApp.
 */
export function HalalRadar({ places, locale, center, whatsapp, variant = "site" }: HalalRadarProps) {
  const t = useTranslations("radar");
  const [filter, setFilter] = React.useState<TypeFilter>("all");
  const [origin, setOrigin] = React.useState<GeoPoint | null>(null);
  const [locate, setLocate] = React.useState<LocateState>("idle");
  const viewportHeight = useViewportHeight();

  const from = origin ?? center;
  const sorted = React.useMemo(() => sortByDistance(places, from), [places, from]);
  const visible = filter === "all" ? sorted : sorted.filter((p) => p.type === filter);

  const markers: MapMarker[] = visible.map((p) => ({
    id: p.id,
    position: p.coordinates,
    title: locale === "ja" && p.nameJa ? p.nameJa : p.name,
    description: [p.address, p.note ? pick(p.note, locale) : ""].filter(Boolean).join(" · "),
    href: p.mapsUrl,
    linkLabel: t("openMaps"),
    kind: p.type,
  }));
  if (origin) markers.unshift({ id: "you", position: origin, title: t("youAreHere"), kind: "default" });

  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocate("unsupported");
      return;
    }
    setLocate("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocate("done");
      },
      () => setLocate("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const suggestUrl = whatsapp
    ? buildWhatsAppUrl(
        whatsapp,
        composeMessage(t("suggestTitle"), [
          [t("suggestName"), t("suggestFill")],
          [t("suggestType"), t("suggestFill")],
          [t("suggestAddress"), t("suggestFill")],
          [t("suggestNote"), t("suggestFill")],
        ]),
      )
    : null;

  const isApp = variant === "app";
  const mapHeight = isApp ? Math.max(240, Math.round(viewportHeight * 0.45)) : 420;
  const mapKey = origin ? `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}` : "mosque";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={origin ? "soft" : "outline"} size="sm" onClick={requestLocation} disabled={locate === "locating"} className="print:hidden">
          {locate === "locating" ? <LoaderCircle className="animate-spin" /> : <LocateFixed />}
          {locate === "locating" ? t("locating") : t("myLocation")}
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {locate === "denied" ? t("locationDenied") : locate === "unsupported" ? t("locationUnsupported") : origin ? t("fromYou") : t("fromMosque")}
        </span>
      </div>

      <div aria-label={t("mapLabel")} role="region">
        <LeafletMap key={mapKey} center={from} zoom={origin ? 13 : 12} markers={markers} height={mapHeight} />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex w-max gap-2" role="group" aria-label={t("listTitle")}>
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={buttonVariants({ variant: filter === f ? "primary" : "outline", size: "sm" })}>
              {t(`filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t("count", { count: visible.length })}
        </p>
        {suggestUrl && (
          <a href={suggestUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "print:hidden")}>
            <WhatsAppIcon />
            {t("suggest")}
          </a>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<MapPin />} title={t("empty")} />
      ) : (
        <ul className={cn("grid grid-cols-1 gap-3", !isApp && "md:grid-cols-2")}>
          {visible.map((p) => {
            const Icon = TYPE_ICONS[p.type];
            const title = locale === "ja" && p.nameJa ? p.nameJa : p.name;
            const subtitle = locale === "ja" ? p.name : p.nameJa;
            return (
              <li key={p.id} id={p.id} className="card-surface flex scroll-mt-28 gap-4 p-4">
                <IconCircle tone="soft" shape="square" size="sm">
                  <Icon />
                </IconCircle>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{t(`types.${p.type}`)}</Badge>
                    {p.verified ? (
                      <Badge variant="success">
                        <CircleCheck />
                        {t("verified")}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{t("unverified")}</Badge>
                    )}
                    <span className="ml-auto text-xs font-semibold tabular text-brand">{t("distance", { distance: formatDistance(p.distanceKm) })}</span>
                  </div>
                  <p className="mt-2 font-bold leading-snug">{title}</p>
                  {subtitle && subtitle !== title && (
                    <p lang={locale === "ja" ? "en" : "ja"} className="text-sm text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">{p.address}</p>
                  {p.note && <p className="mt-1 text-sm">{pick(p.note, locale)}</p>}
                  <a href={p.mapsUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "link", size: "sm" }), "mt-2 h-auto")}>
                    {t("openMaps")}
                    <ExternalLink />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">{t("placeholderHint")}</p>
    </div>
  );
}
