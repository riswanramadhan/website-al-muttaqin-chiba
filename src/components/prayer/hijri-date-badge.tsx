import { MoonStar } from "lucide-react";
import { getPrayerConfig } from "@/lib/data";
import { hijriMonthName, toHijri } from "@/lib/hijri";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

export type HijriDateBadgeProps = {
  locale: Locale;
  withArabic?: boolean;
  tone?: "default" | "inverse";
  className?: string;
};

/** Lencana tanggal Hijriah hari ini (Tokyo) dengan koreksi admin; opsional versi Arab. */
export async function HijriDateBadge({ locale, withArabic = false, tone = "default", className }: HijriDateBadgeProps) {
  const config = await getPrayerConfig();
  const h = toHijri(new Date(), config.hijriAdjustment);
  const latin =
    locale === "ja"
      ? `ヒジュラ暦${h.year}年 ${hijriMonthName(h.month, "ja")} ${h.day}日`
      : `${h.day} ${hijriMonthName(h.month, locale)} ${h.year} H`;
  const arabic = `${h.day} ${hijriMonthName(h.month, "ar")} ${h.year}`;

  return (
    <Badge variant={tone === "inverse" ? "inverse" : "soft"} className={cn("max-w-full flex-wrap gap-x-2 gap-y-0.5 py-1 whitespace-normal", className)}>
      <MoonStar aria-hidden />
      <span>{latin}</span>
      {withArabic && (
        <span lang="ar" dir="rtl" className="font-arabic text-sm leading-none opacity-80">
          {arabic}
        </span>
      )}
    </Badge>
  );
}
