import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { SectionTag } from "@/components/ui/section-tag";
import { TwoToneTitle } from "@/components/ui/two-tone-title";

/**
 * Kepala section standar: tag pill, judul dua warna, deskripsi, dan slot aksi di kanan.
 */
export function SectionHeading({
  tag,
  tri,
  title,
  highlight,
  description,
  action,
  align = "left",
  tone = "default",
  as = "h2",
  className,
}: {
  tag?: string;
  tri?: { ja?: string; ar?: string };
  title: string;
  highlight?: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  tone?: "default" | "inverse";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center md:justify-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {tag && (
          <div className={cn("mb-4", align === "center" && "flex justify-center")}>
            <SectionTag tri={tri} tone={tone === "inverse" ? "inverse" : "default"}>
              {tag}
            </SectionTag>
          </div>
        )}
        <TwoToneTitle
          as={as}
          text={title}
          highlight={highlight}
          className={cn(
            as === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl",
            tone === "inverse" && "text-hero-foreground",
          )}
        />
        {description && (
          <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", tone === "inverse" ? "text-hero-muted" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
