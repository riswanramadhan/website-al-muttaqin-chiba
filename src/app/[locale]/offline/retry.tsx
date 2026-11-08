"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineRetry({ label }: { label: string }) {
  return (
    <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
      <RefreshCw />
      <span>{label}</span>
    </Button>
  );
}
