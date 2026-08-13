"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "./utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Studio-local breadcrumb strip (D-08). Renders a trail sourced from
 * navigation/lookup.ts's findNavTrailByPath — platform design tokens only,
 * no search-engine structured-data markup (this is an authenticated
 * internal dashboard, not an indexed page). See apps/studio/components/
 * discovery/Breadcrumbs.tsx for the shadcn/structured-data variant this
 * intentionally does not reuse — only its { label, href? }[] prop shape
 * is shared.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
            {index > 0 && <ChevronRight size={12} className="text-text-muted shrink-0" aria-hidden="true" />}
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? "page" : undefined}
                className={cn(
                  "truncate",
                  isLast ? "text-text-primary font-[var(--font-weight-heading)]" : "text-text-secondary"
                )}
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="text-text-secondary hover:text-text-primary transition-colors truncate">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
