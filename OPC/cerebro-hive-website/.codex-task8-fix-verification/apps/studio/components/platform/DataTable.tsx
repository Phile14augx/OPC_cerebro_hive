"use client";

import React from "react";

export interface Column<T> {
  key:       string;
  header:    string;
  render:    (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns:    Column<T>[];
  data:       T[];
  loading?:   boolean;
  empty?:     React.ReactNode;
  rowKey:     (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  className?:  string;
}

const SKELETON_ROWS = 6;

export function DataTable<T>({
  columns, data, loading, empty, rowKey, onRowClick, className = "",
}: DataTableProps<T>) {
  return (
    <div className={`overflow-hidden rounded-xl border border-neutral-800 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/80">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-500 ${col.headerClassName ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/40">
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-neutral-800"
                           style={{ width: `${60 + Math.random() * 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {empty ?? (
                    <span className="text-sm text-neutral-500">No results found</span>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-neutral-800/40" : ""
                  }`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3 text-sm text-neutral-300 ${col.className ?? ""}`}>
                      {col.render(row, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
