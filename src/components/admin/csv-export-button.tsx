"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAdminT } from "@/components/admin/i18n-context";
import { buildCsv, type CsvCell } from "@/components/admin/utils";

/**
 * Ekspor CSV di client dari data yang sudah diberikan server (peran dicek di server
 * sebelum data dikirim). File diunduh lewat Blob; `onExported` untuk mencatat log.
 */
export function CsvExportButton({
  filename,
  headers,
  rows,
  label,
  onExported,
  variant = "outline",
  size = "sm",
  ...props
}: {
  filename: string;
  headers: string[];
  rows: CsvCell[][];
  label?: string;
  onExported?: (count: number) => void;
} & Omit<ButtonProps, "onClick">) {
  const { t } = useAdminT();

  function download() {
    const csv = buildCsv(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExported?.(rows.length);
  }

  return (
    <Button variant={variant} size={size} onClick={download} disabled={rows.length === 0 || props.disabled} {...props}>
      <Download />
      <span>{label ?? t("common.exportCsv")}</span>
    </Button>
  );
}
