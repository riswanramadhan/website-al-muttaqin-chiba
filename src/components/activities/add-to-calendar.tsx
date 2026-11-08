import { CalendarPlus, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale, MosqueEvent } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { buttonVariants } from "@/components/ui/button";
import { googleCalendarUrl, icsPath } from "@/components/activities/calendar-links";
import { cn } from "@/lib/utils/cn";

/** Dua tombol: tautan Google Calendar dan unduh .ics dari route handler. */
export function AddToCalendar({ event, locale, siteUrl, size = "sm", className }: { event: MosqueEvent; locale: Locale; siteUrl: string; size?: "sm" | "md"; className?: string }) {
  const t = useTranslations("events");
  const url = `${siteUrl}/${locale}/events/${event.slug}`;
  const details = t("calendar.description", { title: pick(event.title, locale), url });

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <a href={googleCalendarUrl(event, locale, siteUrl, details)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size })}>
        <CalendarPlus />
        {t("detail.googleCalendar")}
      </a>
      <a href={icsPath(event, locale)} download={`${event.slug}.ics`} className={buttonVariants({ variant: "outline", size })}>
        <Download />
        {t("detail.downloadIcs")}
      </a>
    </div>
  );
}
