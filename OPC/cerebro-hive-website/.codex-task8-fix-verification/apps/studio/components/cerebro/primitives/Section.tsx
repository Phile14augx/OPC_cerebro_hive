import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SectionSize = "tight" | "default" | "emphasized";

/**
 * tight formalizes the py-12 stat-strip pattern (EnterpriseDashboard,
 * ExecutiveDashboard). default reuses the existing global `.section-pad`
 * class (120px desktop -> 80px at <=768px) rather than redefining those
 * two numbers a second time in Tailwind arbitrary values. emphasized
 * formalizes the deliberate py-32-equivalent CTA/manifesto sections
 * (96px -> 160px, using Tailwind's md: 768px breakpoint to match
 * .section-pad's own breakpoint).
 */
export const sectionSizeClasses: Record<SectionSize, string> = {
  tight: "py-12",
  default: "section-pad",
  emphasized: "py-24 md:py-40",
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  size?: SectionSize;
}

export function Section({
  size = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(sectionSizeClasses[size], className)} {...props}>
      {children}
    </section>
  );
}
