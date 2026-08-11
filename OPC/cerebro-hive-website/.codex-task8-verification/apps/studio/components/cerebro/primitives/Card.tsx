import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * size scale: sm=20px, md=24px (default, matches the slightly more
 * common hand-rolled p-6), lg=32px (matches p-8), xl=48px (hero-panel
 * cards, matches p-12). variant has one value today ("surface", the
 * de-facto bg-surface/border-border/rounded-2xl shape found across all
 * 8 in-scope sections) - kept as an explicit axis so a second real
 * appearance is additive later, not a redesign. Do not add more
 * variants without new production usage to justify them.
 */
export const cardVariants = cva("bg-surface border border-border rounded-2xl", {
  variants: {
    size: {
      sm: "p-5",
      md: "p-6",
      lg: "p-8",
      xl: "p-12",
    },
    variant: {
      surface: "",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "surface",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ size, variant, className, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ size, variant }), className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 pt-6 border-t border-border flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
