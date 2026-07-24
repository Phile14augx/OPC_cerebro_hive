"use client";

import React from "react";

type Status =
  | "DRAFT" | "PUBLISHED" | "ARCHIVED"
  | "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"
  | "PENDING" | "PROCESSING" | "INDEXED"
  | "ACTIVE" | "DEPRECATED" | "DELETED";

const STATUS_CONFIG: Record<Status, { label: string; className: string; dot: string }> = {
  DRAFT:      { label: "Draft",      className: "bg-neutral-800 text-neutral-400 border-neutral-700",  dot: "bg-neutral-500" },
  PUBLISHED:  { label: "Published",  className: "bg-emerald-950 text-emerald-400 border-emerald-800",  dot: "bg-emerald-400" },
  ARCHIVED:   { label: "Archived",   className: "bg-neutral-800 text-neutral-500 border-neutral-700",  dot: "bg-neutral-600" },
  QUEUED:     { label: "Queued",     className: "bg-sky-950    text-sky-400    border-sky-800",         dot: "bg-sky-400" },
  RUNNING:    { label: "Running",    className: "bg-blue-950   text-blue-400   border-blue-800",        dot: "bg-blue-400 animate-pulse" },
  COMPLETED:  { label: "Completed",  className: "bg-emerald-950 text-emerald-400 border-emerald-800",  dot: "bg-emerald-400" },
  FAILED:     { label: "Failed",     className: "bg-red-950    text-red-400    border-red-800",         dot: "bg-red-400" },
  CANCELLED:  { label: "Cancelled",  className: "bg-neutral-800 text-neutral-400 border-neutral-700",  dot: "bg-neutral-500" },
  PENDING:    { label: "Pending",    className: "bg-amber-950  text-amber-400  border-amber-800",       dot: "bg-amber-400" },
  PROCESSING: { label: "Processing", className: "bg-blue-950   text-blue-400   border-blue-800",        dot: "bg-blue-400 animate-pulse" },
  INDEXED:    { label: "Indexed",    className: "bg-emerald-950 text-emerald-400 border-emerald-800",  dot: "bg-emerald-400" },
  ACTIVE:     { label: "Active",     className: "bg-emerald-950 text-emerald-400 border-emerald-800",  dot: "bg-emerald-400" },
  DEPRECATED: { label: "Deprecated", className: "bg-amber-950  text-amber-400  border-amber-800",      dot: "bg-amber-400" },
  DELETED:    { label: "Deleted",    className: "bg-red-950    text-red-400    border-red-800",         dot: "bg-red-400" },
};

interface Props {
  status: string;
  size?:  "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: Props) {
  const cfg = STATUS_CONFIG[status as Status] ?? {
    label:     status,
    className: "bg-neutral-800 text-neutral-400 border-neutral-700",
    dot:       "bg-neutral-500",
  };

  const sizeClass = size === "sm"
    ? "px-2 py-0.5 text-xs"
    : "px-2.5 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClass} ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
