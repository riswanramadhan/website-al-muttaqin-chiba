"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils/cn";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-background shadow-soft transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}

/** Baris pengaturan: label, deskripsi, dan switch di kanan. */
export function SwitchRow({ id, label, description, className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & { label: string; description?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3", className)}>
      <label htmlFor={id} className="flex-1 cursor-pointer">
        <span className="block font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>}
      </label>
      <Switch id={id} {...props} />
    </div>
  );
}
