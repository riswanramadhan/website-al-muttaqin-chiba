import type { GeoPoint } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Jarak lingkaran besar (haversine) dalam kilometer. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type WithDistance<T> = T & { distanceKm: number };

/** Tambahkan jarak dari titik asal dan urutkan dari yang terdekat. */
export function sortByDistance<T extends { coordinates: GeoPoint }>(items: T[], from: GeoPoint): WithDistance<T>[] {
  return items
    .map((item) => ({ ...item, distanceKm: haversineKm(from, item.coordinates) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** "350 m" di bawah 1 km, "1.2 km" di bawah 10 km, "27 km" di atasnya. */
export function formatDistance(km: number): string {
  if (km < 0.95) return `${Math.max(10, Math.round(km * 100) * 10)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
