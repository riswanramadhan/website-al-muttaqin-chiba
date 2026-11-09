"use client";

import * as React from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LeafletMapProps, MapMarker } from "./map";
import { cn } from "@/lib/utils/cn";

const COLORS: Record<NonNullable<MapMarker["kind"]>, string> = {
  mosque: "var(--primary)",
  "prayer-room": "var(--primary)",
  restaurant: "var(--warning)",
  mart: "var(--success)",
  service: "var(--muted-foreground)",
  default: "var(--primary)",
};

function pinIcon(kind: MapMarker["kind"] = "default") {
  const color = COLORS[kind];
  // Titik 18 px di tengah area ketuk 36 px agar mudah disentuh dengan presisi di ponsel.
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;width:36px;height:36px;align-items:center;justify-content:center"><span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 4px color-mix(in oklab, ${color} 30%, transparent), 0 2px 6px rgb(0 0 0 / .3)"></span></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -14],
  });
}

function LocateControl({ label }: { label: string }) {
  const map = useMap();
  const [busy, setBusy] = React.useState(false);
  function locate() {
    if (!navigator.geolocation) return;
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
        L.circleMarker([pos.coords.latitude, pos.coords.longitude], { radius: 7, color: "#2563eb", fillOpacity: 0.9 }).addTo(map);
        setBusy(false);
      },
      () => setBusy(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control m-2">
        <button
          type="button"
          onClick={locate}
          disabled={busy}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft disabled:opacity-60"
        >
          {label}
        </button>
      </div>
    </div>
  );
}

export default function MapInner({ center, zoom = 15, markers, height = 320, className, locateUser = false, locateLabel = "My location" }: LeafletMapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height }}
      className={cn("z-0 w-full overflow-hidden rounded-2xl border border-border", className)}
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.position.lat, m.position.lng]}
          icon={pinIcon(m.kind)}
          title={m.title}
          eventHandlers={{ add: (e) => (e.target as L.Marker).getElement()?.setAttribute("aria-label", m.title) }}
        >
          <Popup>
            <div className="min-w-40 text-sm">
              <p className="font-semibold">{m.title}</p>
              {m.description && <p className="mt-1 text-xs text-neutral-600">{m.description}</p>}
              {m.href && (
                <a href={m.href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold underline">
                  {m.linkLabel ?? "Google Maps"}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      {locateUser && <LocateControl label={locateLabel} />}
    </MapContainer>
  );
}
