"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-hero/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  closeLabel = "Close",
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { closeLabel?: string; showClose?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-soft duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 max-h-[calc(100dvh-2rem)] overflow-y-auto",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <X className="size-4" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 pr-8 text-left", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-bold leading-snug", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

/** Panel geser dari sisi layar (menu mobile, filter). */
export function SheetContent({ side = "right", className, children, closeLabel = "Close", ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: "left" | "right" | "bottom"; closeLabel?: string }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover p-6 text-popover-foreground shadow-soft transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",
          side === "right" && "inset-y-0 right-0 h-full w-[88%] max-w-sm border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" && "inset-y-0 left-0 h-full w-[88%] max-w-sm border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-3xl border-t border-border safe-bottom data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          "overflow-y-auto",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
          <X className="size-5" />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
