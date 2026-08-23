import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";
import { analytics } from "@/lib/analytics/AnalyticsAdapter";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-accent text-background hover:bg-primary-accent/90 shadow-elevated",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-border bg-transparent hover:bg-surface hover:text-text-primary",
        secondary: "bg-surface border border-border text-text-primary hover:bg-surface-elevated hover:border-primary-accent/40",
        ghost: "hover:bg-surface hover:text-text-primary",
        link: "text-primary-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Optional analytics overrides — falls back to a generic tracked click if omitted. */
  analyticsEvent?: string;
  analyticsCategory?: string;
  analyticsLabel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, analyticsEvent, analyticsCategory, analyticsLabel, onClick, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      analytics.track({
        eventName: analyticsEvent || "click",
        category: analyticsCategory || "platform-ui",
        label: analyticsLabel || (typeof children === "string" ? children : "button"),
      });
      if (onClick) onClick(e);
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
