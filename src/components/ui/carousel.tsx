"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * Carousel Embla dengan tombol bulat (PRD §8). Autoplay dimatikan bila
 * prefers-reduced-motion aktif. Anak-anak diberi lebar lewat className (mis. "basis-[85%] md:basis-1/3").
 */
export function Carousel({
  children,
  className,
  autoplay = false,
  loop = true,
  controls = true,
  labels = { previous: "Previous", next: "Next" },
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  labels?: { previous: string; next: string };
  tone?: "default" | "inverse";
}) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const plugins = React.useMemo(() => (autoplay && !reduce ? [Autoplay({ delay: 5000, stopOnInteraction: true })] : []), [autoplay, reduce]);
  const [ref, api] = useEmblaCarousel({ loop, align: "start", dragFree: false }, plugins);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} className="overflow-hidden">
        <div className="-ml-4 flex touch-pan-y">{children}</div>
      </div>
      {controls && (
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button
            variant={tone === "inverse" ? "outlineInverse" : "outline"}
            size="icon"
            onClick={() => api?.scrollPrev()}
            disabled={!canPrev}
            aria-label={labels.previous}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant={tone === "inverse" ? "outlineInverse" : "outline"}
            size="icon"
            onClick={() => api?.scrollNext()}
            disabled={!canNext}
            aria-label={labels.next}
          >
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 shrink-0 grow-0 basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3", className)} {...props} />;
}
