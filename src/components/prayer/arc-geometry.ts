import type { PrayerName } from "@/lib/types";

/**
 * Geometri busur hari (murni, tanpa React) agar bisa diuji: posisi waktu salat di busur,
 * penempatan label tanpa tabrakan, dan viewBox yang selalu memuat semua label + padding tetap.
 *
 * Sistem koordinat: pusat lingkaran di (0, 0), ufuk di y = 0, atas bernilai y negatif.
 * Pecahan f: 0 = syuruk (kiri, di ufuk), 0.5 = puncak, 1 = Magrib (kanan, di ufuk);
 * f < 0 atau f > 1 berarti di bawah ufuk (Subuh, Isya, malam).
 */

export const ARC_ORDER: PrayerName[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

export const ARC = {
  /** Jari-jari busur. */
  R: 112,
  /** Subuh dan Isya digambar sejauh ini di bawah ufuk (pecahan setengah lingkaran). */
  TWILIGHT: 0.14,
  /** Batas busur malam (sebelum Subuh / setelah Isya). */
  NIGHT: 0.2,
  /** Rentang waktu malam (ms) yang dipetakan dari batas malam ke Subuh/Isya. */
  NIGHT_SPAN_MS: 3 * 60 * 60_000,
  /** Jarak label dari penanda. */
  LABEL_GAP: 14,
  NAME_SIZE: 13,
  TIME_SIZE: 12,
  /** Tinggi blok label dua baris (nama + jam). */
  LABEL_H: 31,
  /** Jarak minimum antar-label. */
  LABEL_SPACING: 5,
  /** Ruang ekstra di sekitar penanda (lingkar fokus/terpilih, cahaya matahari). */
  MARKER_HALO: 17,
  PAD: 10,
} as const;

export const ARC_START = -ARC.NIGHT;
export const ARC_END = 1 + ARC.NIGHT;

export type ArcTimes = Record<PrayerName, Date>;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Posisi pecahan sebuah instant pada busur; selalu dalam [ARC_START, ARC_END]. */
export function fractionOf(t: number, times: ArcTimes): number {
  const { TWILIGHT: T, NIGHT: N, NIGHT_SPAN_MS: span } = ARC;
  const fajr = times.fajr.getTime();
  const sunrise = times.sunrise.getTime();
  const maghrib = times.maghrib.getTime();
  const isha = times.isha.getTime();
  if (t < fajr) return -T - (N - T) * clamp01((fajr - t) / span);
  if (t <= sunrise) return -T * (1 - (t - fajr) / Math.max(1, sunrise - fajr));
  if (t > isha) return 1 + T + (N - T) * clamp01((t - isha) / span);
  if (t >= maghrib) return 1 + T * ((t - maghrib) / Math.max(1, isha - maghrib));
  return (t - sunrise) / Math.max(1, maghrib - sunrise);
}

/** Pecahan progres 0..1 sepanjang seluruh busur (untuk pathLength). */
export function progressOf(f: number): number {
  return clamp01((f - ARC_START) / (ARC_END - ARC_START));
}

export type Point = { x: number; y: number };

export function pointAt(f: number, r: number = ARC.R): Point {
  const theta = Math.PI - f * Math.PI;
  return { x: r * Math.cos(theta), y: -r * Math.sin(theta) };
}

/** Path SVG busur dari pecahan `from` ke `to` (searah jarum jam di layar). */
export function arcPath(from: number = ARC_START, to: number = ARC_END, r: number = ARC.R): string {
  const a = pointAt(from, r);
  const b = pointAt(to, r);
  const large = to - from > 1 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/** Perkiraan lebar teks (px) tanpa DOM; sengaja sedikit berlebih agar viewBox tidak memotong. */
export function estimateTextWidth(text: string, fontSize: number, bold = false): number {
  let em = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x2e80) em += 1;
    else if (/[0-9:]/.test(ch)) em += 0.6;
    else if (ch === " ") em += 0.3;
    else if (/[A-Z]/.test(ch)) em += 0.68;
    else if (/[ijlrtf.]/.test(ch)) em += 0.36;
    else em += 0.57;
  }
  return em * fontSize * (bold ? 1.06 : 1) + 2;
}

export type LabelAnchor = "start" | "middle" | "end";

export type ArcLabel = {
  name: PrayerName;
  f: number;
  marker: Point;
  anchor: LabelAnchor;
  /** Titik jangkar teks (x) dan tepi atas blok label. */
  x: number;
  top: number;
  width: number;
  height: number;
};

export type Box = { left: number; top: number; right: number; bottom: number };

export function labelBox(l: ArcLabel): Box {
  const left = l.anchor === "end" ? l.x - l.width : l.anchor === "middle" ? l.x - l.width / 2 : l.x;
  return { left, top: l.top, right: left + l.width, bottom: l.top + l.height };
}

export function boxesOverlap(a: Box, b: Box, margin = 0): boolean {
  return a.left < b.right + margin && b.left < a.right + margin && a.top < b.bottom + margin && b.top < a.bottom + margin;
}

/**
 * Letakkan label tiap waktu salat di luar busur: sisi kiri rata kanan, sisi kanan rata kiri,
 * bagian atas di tengah. Label yang bertumpuk didorong menjauh secara vertikal sampai bebas tabrakan.
 */
export function layoutLabels(fractions: Record<PrayerName, number>, widths: Record<PrayerName, number>): ArcLabel[] {
  const { R, LABEL_GAP, LABEL_H, LABEL_SPACING } = ARC;
  const labels: ArcLabel[] = ARC_ORDER.map((name) => {
    const f = fractions[name];
    const theta = Math.PI - f * Math.PI;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const marker = pointAt(f);
    const lx = (R + LABEL_GAP) * c;
    const ly = -(R + LABEL_GAP) * s;
    const anchor: LabelAnchor = c < -0.34 ? "end" : c > 0.34 ? "start" : "middle";
    const top = anchor === "middle" ? (s >= 0 ? ly - LABEL_H : ly) : ly - LABEL_H / 2;
    return { name, f, marker, anchor, x: lx, top, width: widths[name], height: LABEL_H };
  });

  for (let pass = 0; pass < 24; pass++) {
    let moved = false;
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labelBox(labels[i]);
        const b = labelBox(labels[j]);
        if (!boxesOverlap(a, b, LABEL_SPACING)) continue;
        const [upper, lower] = a.top + a.bottom <= b.top + b.bottom ? [labels[i], labels[j]] : [labels[j], labels[i]];
        const overlap = upper.top + upper.height + LABEL_SPACING - lower.top;
        if (overlap <= 0) continue;
        upper.top -= overlap / 2 + 0.5;
        lower.top += overlap / 2 + 0.5;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return labels;
}

export type ViewBox = { x: number; y: number; width: number; height: number };

/** viewBox simetris di sekitar pusat busur yang memuat busur, penanda, dan semua label + PAD. */
export function computeViewBox(labels: ArcLabel[], extraBottom = 0): ViewBox {
  const { R, MARKER_HALO, PAD } = ARC;
  let minX = -R - MARKER_HALO;
  let maxX = R + MARKER_HALO;
  let minY = -R - MARKER_HALO;
  let maxY = Math.max(pointAt(ARC_START).y, pointAt(ARC_END).y) + MARKER_HALO + extraBottom;
  for (const l of labels) {
    const b = labelBox(l);
    minX = Math.min(minX, b.left);
    maxX = Math.max(maxX, b.right);
    minY = Math.min(minY, b.top);
    maxY = Math.max(maxY, b.bottom);
  }
  const half = Math.ceil(Math.max(-minX, maxX) + PAD);
  const y = Math.floor(minY - PAD);
  return { x: -half, y, width: half * 2, height: Math.ceil(maxY + PAD) - y };
}

/** Konversi kotak koordinat SVG ke persen kontainer (untuk lapisan tombol HTML di atas SVG). */
export function toPercentBox(box: Box, vb: ViewBox): { left: string; top: string; width: string; height: string } {
  const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
  return {
    left: pct((box.left - vb.x) / vb.width),
    top: pct((box.top - vb.y) / vb.height),
    width: pct((box.right - box.left) / vb.width),
    height: pct((box.bottom - box.top) / vb.height),
  };
}

export type SkyKey = "night" | "dawn" | "day" | "dusk";
export type SkyWeights = Record<SkyKey, number>;

/**
 * Bobot warna langit (jumlah = 1) yang berubah halus sepanjang hari:
 * malam -> fajar (sekitar Subuh-syuruk) -> siang -> senja (sekitar Magrib) -> malam.
 */
export function skyWeights(t: number, times: ArcTimes): SkyWeights {
  const m = 60_000;
  const keys: Array<[number, SkyKey]> = [
    [times.fajr.getTime() - 30 * m, "night"],
    [times.sunrise.getTime() - 15 * m, "dawn"],
    [times.sunrise.getTime() + 50 * m, "day"],
    [times.maghrib.getTime() - 50 * m, "day"],
    [times.maghrib.getTime() + 5 * m, "dusk"],
    [times.isha.getTime() + 15 * m, "night"],
  ];
  const w: SkyWeights = { night: 0, dawn: 0, day: 0, dusk: 0 };
  if (t <= keys[0][0] || t >= keys[keys.length - 1][0]) {
    w.night = 1;
    return w;
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, k0] = keys[i];
    const [t1, k1] = keys[i + 1];
    if (t >= t0 && t <= t1) {
      const u = t1 > t0 ? (t - t0) / (t1 - t0) : 1;
      w[k0] += 1 - u;
      w[k1] += u;
      return w;
    }
  }
  w.night = 1;
  return w;
}

export function isDarkSky(w: SkyWeights): boolean {
  return w.night + w.dawn + w.dusk >= 0.5;
}
