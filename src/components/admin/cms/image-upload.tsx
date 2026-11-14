"use client";

import * as React from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { FileText, ImageUp, LoaderCircle, Trash } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MEDIA_BUCKET } from "@/lib/utils/media";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createMediaUpload } from "@/actions/admin/media";
import { useAdminT } from "@/components/admin/i18n-context";
import type { ImagePreset, UploadFolder } from "@/components/admin/cms/fields";

/**
 * Unggah gambar hemat kuota:
 * 1. Gambar diperkecil dan dikompres ke WebP DI BROWSER admin (foto HP 4-8 MB menjadi sekitar
 *    100-300 KB), jadi Storage Supabase dan bandwidth pengunjung tetap kecil.
 * 2. Berkas dikirim langsung dari browser ke Supabase Storage memakai URL bertanda tangan,
 *    tidak melewati fungsi Vercel.
 * 3. Situs publik menampilkan hasilnya apa adanya (tanpa Image Optimization Vercel) dengan
 *    cache satu tahun.
 */

type PresetConfig = { maxSide: number; quality: number; keepAlpha: boolean };

const PRESETS: Record<ImagePreset, PresetConfig> = {
  photo: { maxSide: 1600, quality: 0.8, keepAlpha: false },
  poster: { maxSide: 1600, quality: 0.85, keepAlpha: false },
  qr: { maxSide: 1200, quality: 0.95, keepAlpha: false },
  avatar: { maxSide: 480, quality: 0.82, keepAlpha: false },
  logo: { maxSide: 800, quality: 0.9, keepAlpha: true },
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ONE_YEAR_SECONDS = "31536000";

export type UploadedImage = { src: string; width: number; height: number };

type Compressed = { blob: Blob; width: number; height: number };

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function loadBitmap(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // lanjut ke <img> (mis. format yang tidak didukung createImageBitmap)
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => undefined };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Perkecil ke sisi terpanjang `maxSide` dan kompres; WebP bila didukung, selain itu JPEG/PNG. */
async function compressImage(file: File, preset: PresetConfig): Promise<Compressed> {
  const bitmap = await loadBitmap(file);
  try {
    const scale = Math.min(1, preset.maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    if (!preset.keepAlpha) {
      // Latar putih agar area transparan tidak menjadi hitam pada JPEG/WebP tanpa alfa.
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap.source, 0, 0, width, height);

    const webp = await canvasToBlob(canvas, "image/webp", preset.quality);
    if (webp && webp.type === "image/webp") return { blob: webp, width, height };
    // Browser lama tanpa enkoder WebP.
    const fallbackType = preset.keepAlpha ? "image/png" : "image/jpeg";
    const fallback = await canvasToBlob(canvas, fallbackType, preset.quality);
    if (!fallback) throw new Error("encode");
    return { blob: fallback, width, height };
  } finally {
    bitmap.close();
  }
}

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function storageClient() {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(MEDIA_BUCKET);
}

export function ImageUpload({
  id,
  label,
  hint,
  error,
  required,
  value,
  onChange,
  folder,
  preset,
  allowPdf,
  disabled,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** URL gambar saat ini (kosong = belum ada). */
  value: string;
  /** `image` berisi ukuran hasil kompres; null bila URL diketik manual atau dihapus. */
  onChange: (src: string, image: UploadedImage | null) => void;
  folder: UploadFolder;
  preset: ImagePreset;
  allowPdf?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useAdminT();
  const toast = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Unggah berjalan beberapa detik; selama itu admin bisa mengetik kolom lain. onChange dari render
  // saat berkas dipilih membawa nilai formulir lama, jadi hasil unggah dikirim lewat onChange terbaru.
  const latestOnChange = React.useRef(onChange);
  React.useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);
  const [busy, setBusy] = React.useState(false);
  const [info, setInfo] = React.useState<string | null>(null);
  const isPdf = /\.pdf(\?.*)?$/i.test(value);

  async function handleFile(file: File) {
    setBusy(true);
    setInfo(null);
    try {
      const pdf = file.type === "application/pdf";
      if (pdf && !allowPdf) throw new Error("upload.invalidType");
      if (!pdf && !file.type.startsWith("image/")) throw new Error("upload.invalidType");

      const prepared: Compressed = pdf ? { blob: file, width: 0, height: 0 } : await compressImage(file, PRESETS[preset]);
      if (prepared.blob.size > MAX_UPLOAD_BYTES) throw new Error("errors.fileTooLarge");

      const ticket = await createMediaUpload({ folder, contentType: prepared.blob.type, size: prepared.blob.size });
      if (!ticket.ok) throw new Error(ticket.message && ticket.message.includes(".") ? ticket.message : `errors.${ticket.error}`);

      const storage = storageClient();
      if (!storage) throw new Error("errors.demo");
      const { error: uploadError } = await storage.uploadToSignedUrl(ticket.data.path, ticket.data.token, prepared.blob, {
        contentType: prepared.blob.type,
        cacheControl: ONE_YEAR_SECONDS,
      });
      if (uploadError) throw new Error(uploadError.message);

      latestOnChange.current(ticket.data.publicUrl, pdf ? null : { src: ticket.data.publicUrl, width: prepared.width, height: prepared.height });
      setInfo(
        pdf
          ? t("upload.donePdf", { size: formatBytes(prepared.blob.size) })
          : t("upload.done", { before: formatBytes(file.size), after: formatBytes(prepared.blob.size), width: prepared.width, height: prepared.height }),
      );
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "errors.uploadFailed";
      const translated = t(message);
      toast({ title: t("errors.uploadFailed"), description: translated === message && !message.includes(".") ? message : translated, tone: "error" });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {label}
        {required && <span className="text-brand" aria-hidden>*</span>}
      </Label>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-3 sm:flex-row sm:items-center">
        <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface sm:w-32">
          {value && !isPdf ? (
            <Image src={value} alt="" width={256} height={192} unoptimized className="size-full object-contain" />
          ) : isPdf ? (
            <FileText className="size-8 stroke-[1.5] text-muted-foreground" aria-hidden />
          ) : (
            <ImageUp className="size-8 stroke-[1.5] text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={allowPdf ? "image/*,application/pdf" : "image/*"}
              className="sr-only"
              tabIndex={-1}
              disabled={disabled || busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
              aria-hidden
            />
            <Button type="button" variant="secondary" size="sm" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
              {busy ? <LoaderCircle className="animate-spin" /> : <ImageUp />}
              {busy ? t("upload.uploading") : value ? t("upload.replace") : t("upload.choose")}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={disabled || busy} onClick={() => { setInfo(null); onChange("", null); }}>
                <Trash />
                {t("common.remove")}
              </Button>
            )}
          </div>
          <Input
            id={id}
            value={value}
            disabled={disabled || busy}
            placeholder={t("upload.urlPlaceholder")}
            aria-invalid={Boolean(error) || undefined}
            onChange={(e) => { setInfo(null); onChange(e.target.value, null); }}
            className="h-9 text-sm"
          />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground" aria-live="polite">{info ?? hint ?? t(allowPdf ? "upload.hintPdf" : "upload.hint")}</p>
      )}
    </div>
  );
}
