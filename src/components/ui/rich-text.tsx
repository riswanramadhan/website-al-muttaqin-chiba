import * as React from "react";
import type { ContentBlock } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/** Render blok konten (src/lib/types ContentBlock) dengan tipografi konsisten. */
export function RichText({ blocks, className }: { blocks: ContentBlock[]; className?: string }) {
  return (
    <div className={cn("space-y-5 text-base leading-relaxed text-foreground/90", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return <p key={i}>{block.text}</p>;
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-2xl font-bold">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-xl font-bold">
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-6 marker:text-brand">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-brand">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-primary pl-5 text-lg italic">
                <p>{block.text}</p>
                {block.cite && <cite className="mt-2 block text-sm text-muted-foreground not-italic">{block.cite}</cite>}
              </blockquote>
            );
          case "callout":
            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl border px-5 py-4 text-sm",
                  block.tone === "warning" && "border-warning/30 bg-warning/10",
                  block.tone === "success" && "border-success/30 bg-success/10",
                  (!block.tone || block.tone === "info") && "border-border bg-surface",
                )}
              >
                {block.title && <p className="mb-1 font-semibold">{block.title}</p>}
                <p>{block.text}</p>
              </div>
            );
          case "arabic":
            return (
              <div key={i} className="card-muted px-5 py-5 text-center">
                <p lang="ar" dir="rtl" className="font-arabic text-2xl leading-loose">
                  {block.text}
                </p>
                {block.translation && <p className="mt-3 text-sm text-muted-foreground">{block.translation}</p>}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
