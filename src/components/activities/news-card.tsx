import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale, NewsPost } from "@/lib/types";
import { formatDate, pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";

/** Kartu berita / laporan / artikel. Sinkron; aman untuk server dan klien. */
export function NewsCard({ post, locale }: { post: NewsPost; locale: Locale }) {
  const t = useTranslations("news");
  const tc = useTranslations("common");

  return (
    <Link href={`/news/${post.slug}`} className="card-surface lift group flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={post.category === "report" ? "soft" : "default"}>{tc(`categories.${post.category}`)}</Badge>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale, { year: "numeric", month: "short", day: "numeric" })}</time>
      </div>
      <h3 className="mt-3 text-lg leading-snug font-bold group-hover:text-brand">{pick(post.title, locale)}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pick(post.excerpt, locale)}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
        <span className="truncate">{t("labels.author", { name: post.author })}</span>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand">
          {t("labels.readMore")}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
