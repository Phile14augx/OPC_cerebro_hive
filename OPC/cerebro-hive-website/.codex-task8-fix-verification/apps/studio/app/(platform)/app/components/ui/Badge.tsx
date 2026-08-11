import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary-accent text-background",
        secondary: "bg-surface border border-border text-text-primary",
        destructive: "bg-red-500/10 text-red-500 border border-red-500/20",
        outline: "text-text-primary border border-border",
        success: "bg-green-400/10 text-green-400 border border-green-400/20",
        warning: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
        info: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
