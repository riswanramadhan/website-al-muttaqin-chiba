import * as React from "react";
import { cn } from "@/lib/utils/cn";

type DivProps = React.ComponentProps<"div">;

/**
 * Kartu bergaya PRD §8: radius 20-24 px, latar putih bergaris tipis (default)
 * atau abu sangat muda (variant="muted"), tanpa bayangan berat.
 */
export function Card({ className, variant = "default", interactive = false, ...props }: DivProps & { variant?: "default" | "muted" | "dark" | "brand"; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        variant === "default" && "card-surface",
        variant === "muted" && "card-muted",
        variant === "dark" && "bg-hero text-hero-foreground pattern-star",
        variant === "brand" && "bg-primary text-primary-foreground",
        interactive && "lift hover:shadow-soft",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-lg font-bold leading-snug", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("mt-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return <div className={cn("mt-6 flex items-center gap-3", className)} {...props} />;
}
