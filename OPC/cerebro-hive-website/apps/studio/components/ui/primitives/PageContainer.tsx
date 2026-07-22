import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type PageContainerSize = "default" | "narrow";

/**
 * default matches the existing `.container-wide` CSS class exactly
 * (max-width 1400px, 32px horizontal padding, 24px below the 768px
 * breakpoint). narrow formalizes the ad-hoc `max-w-4xl` nested-content
 * pattern found across Services/Industries/Research/Products.
 */
export const containerSizeClasses: Record<PageContainerSize, string> = {
  default: "max-w-[1400px] px-6 md:px-8",
  narrow: "max-w-4xl px-6 md:px-8",
};

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: PageContainerSize;
}

export function PageContainer({
  size = "default",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto", containerSizeClasses[size], className)} {...props}>
      {children}
    </div>
  );
}
