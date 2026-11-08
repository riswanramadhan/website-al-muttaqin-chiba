import { ChevronRight, Megaphone, Pin, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Announcement, Locale } from "@/lib/types";
import { formatDate, pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { IconCircle } from "@/components/ui/primitives";
import { ShareButton } from "@/components/activities/share-button";
import { cn } from "@/lib/utils/cn";

const NEW_WINDOW_MS = 7 * 86_400_000;

export function isNewAnnouncement(a: Pick<Announcement, "publishedAt">, now: number = Date.now()): boolean {
  return now - new Date(a.publishedAt).getTime() < NEW_WINDOW_MS;
}

/** Satu baris pengumuman: badge tersemat/baru/kategori, judul, ringkasan, tanggal, opsional tombol bagikan. */
export function AnnouncementItem({ announcement, locale, compact = false, share = false }: { announcement: Announcement; locale: Locale; compact?: boolean; share?: boolean }) {
  const t = useTranslations("news");
  const tc = useTranslations("common");
  const isNew = isNewAnnouncement(announcement);
  const urgent = announcement.category === "urgent";
  const title = pick(announcement.title, locale);
  const href = `/news/${announcement.slug}`;

  return (
    <li className={cn("card-surface relative flex gap-3 p-4 sm:gap-4 sm:p-5", announcement.pinned && "border-primary/30", urgent && "border-warning/40")}>
      <IconCircle size="sm" tone={urgent ? "brand" : announcement.pinned ? "soft" : "default"} className="mt-0.5">
        {urgent ? <TriangleAlert /> : <Megaphone />}
      </IconCircle>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {announcement.pinned && (
            <Badge variant="brand">
              <Pin />
              {t("labels.pinned")}
            </Badge>
          )}
          {isNew && <Badge variant="success">{t("labels.new")}</Badge>}
          <Badge variant={urgent ? "warning" : "outline"}>{tc(`categories.${announcement.category}`)}</Badge>
        </div>
        <h3 className="mt-2 text-base leading-snug font-bold">
          <Link href={href} className="after:absolute after:inset-0 hover:text-brand">
            {title}
          </Link>
        </h3>
        {!compact && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{pick(announcement.excerpt, locale)}</p>}
        <div className="mt-2 flex items-center justify-between gap-3">
          <time dateTime={announcement.publishedAt} className="text-xs text-muted-foreground">
            {formatDate(announcement.publishedAt, locale, { year: "numeric", month: "short", day: "numeric" })}
          </time>
          {share ? (
            <span className="relative z-10">
              <ShareButton title={title} text={pick(announcement.excerpt, locale)} url={`/${locale}${href}`} iconOnly variant="ghost" size="iconSm" />
            </span>
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Daftar pengumuman: yang tersemat (pinned) di atas. compact menyembunyikan ringkasan;
 * share menambahkan tombol bagikan di tiap item (dipakai di App /app/info).
 */
export function AnnouncementList({ announcements, locale, compact = false, share = false, className }: { announcements: Announcement[]; locale: Locale; compact?: boolean; share?: boolean; className?: string }) {
  const t = useTranslations("news");
  if (announcements.length === 0) {
    return <p className="card-muted p-6 text-center text-sm text-muted-foreground">{t("labels.empty")}</p>;
  }
  const ordered = [...announcements.filter((a) => a.pinned), ...announcements.filter((a) => !a.pinned)];
  return (
    <ul className={cn("grid gap-3", className)}>
      {ordered.map((a) => (
        <AnnouncementItem key={a.id} announcement={a} locale={locale} compact={compact} share={share} />
      ))}
    </ul>
  );
}
