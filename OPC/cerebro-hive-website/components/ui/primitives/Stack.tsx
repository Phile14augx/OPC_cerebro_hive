import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type StackGap = "xs" | "sm" | "md" | "lg" | "xl";
export type StackDirection = "vertical" | "horizontal";

export const stackGapClasses: Record<StackGap, string> = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

const stackDirectionClasses: Record<StackDirection, string> = {
  vertical: "flex flex-col",
  horizontal: "flex flex-row items-center",
};

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: StackGap;
  direction?: StackDirection;
}

/**
 * Scoped usage: heading -> subtitle -> paragraph -> button rhythm and
 * icon-to-text pairs specifically. Not a blanket replacement for every
 * flex/gap layout in the codebase.
 */
export function Stack({
  gap = "md",
  direction = "vertical",
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div className={cn(stackDirectionClasses[direction], stackGapClasses[gap], className)} {...props}>
      {children}
    </div>
  );
}
