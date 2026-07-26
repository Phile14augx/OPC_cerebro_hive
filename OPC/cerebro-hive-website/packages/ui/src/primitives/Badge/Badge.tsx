
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-bg-primary)] text-white",
        secondary:
          "border-transparent bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]",
        destructive:
          "border-transparent bg-[var(--color-text-danger)] text-white",
        outline: "text-[var(--color-text-primary)] border-[var(--color-border-default)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
