"use client";

import * as React from "react";

/**
 * Angka statistik yang naik saat masuk layar (PRD §8), menghormati prefers-reduced-motion.
 */
export function CountUp({ value, duration = 1400, prefix = "", suffix = "", locale, className }: { value: number; duration?: number; prefix?: string; suffix?: string; locale?: string; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(0);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Tanpa animasi: tampilkan nilai akhir pada frame berikutnya (bukan setState sinkron di effect).
      const id = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {new Intl.NumberFormat(locale).format(display)}
      {suffix}
    </span>
  );
}
