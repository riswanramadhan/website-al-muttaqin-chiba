/**
 * Util berkas media (Supabase Storage, bucket `media`). Murni tanpa akses jaringan sehingga
 * aman dipakai di client, server, dan tes.
 */
export const MEDIA_BUCKET = "media";

/** Awalan URL publik bucket media: `<supabaseUrl>/storage/v1/object/public/media/`. */
export function mediaPublicPrefix(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/`;
}

/**
 * Gambar dari luar (unggahan admin di Supabase Storage) sudah dikompres di browser saat diunggah,
 * jadi ditampilkan apa adanya (`unoptimized`) agar tidak memakai kuota Image Optimization Vercel.
 */
export function isRemoteImage(src: string | null | undefined): boolean {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}

export function isSvgImage(src: string | null | undefined): boolean {
  return typeof src === "string" && /\.svg(\?.*)?$/i.test(src);
}

/** Next/Image harus `unoptimized` untuk SVG dan gambar dari luar. */
export function shouldSkipOptimization(src: string | null | undefined): boolean {
  return isRemoteImage(src) || isSvgImage(src);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Kumpulkan jalur berkas bucket media yang dirujuk di mana pun dalam sebuah nilai JSON. */
export function collectMediaPaths(value: unknown, prefix: string, found: Set<string> = new Set()): Set<string> {
  if (typeof value === "string") {
    if (value.startsWith(prefix)) {
      const path = value.slice(prefix.length).split(/[?#]/)[0];
      if (path) found.add(safeDecode(path));
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectMediaPaths(item, prefix, found);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectMediaPaths(item, prefix, found);
  }
  return found;
}

/** Berkas yang dirujuk data lama tetapi tidak lagi dirujuk data baru (aman untuk dihapus). */
export function removedMediaPaths(before: unknown, after: unknown, prefix: string): string[] {
  const kept = collectMediaPaths(after, prefix);
  return [...collectMediaPaths(before, prefix)].filter((path) => !kept.has(path));
}
