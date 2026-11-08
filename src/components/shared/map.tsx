"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { GeoPoint } from "@/lib/types";
import { Skeleton } from "@/components/ui/primitives";

export type MapMarker = {
  id: string;
  position: GeoPoint;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  kind?: "mosque" | "prayer-room" | "restaurant" | "mart" | "service" | "default";
};

export type LeafletMapProps = {
  center: GeoPoint;
  zoom?: number;
  markers: MapMarker[];
  height?: number;
  className?: string;
  /** Tampilkan tombol "lokasi saya" dan pusatkan peta ke pengguna bila diizinkan. */
  locateUser?: boolean;
  locateLabel?: string;
};

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full rounded-2xl" />,
});

/** Peta Leaflet + OpenStreetMap yang hanya dirender di klien (PRD §6.1). */
export function LeafletMap(props: LeafletMapProps) {
  return <MapInner {...props} />;
}
