import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;
export type IconVariant = "outline" | "duotone" | "filled";

export interface BaseIconProps extends Omit<HTMLMotionProps<"svg">, "children"> {
  size?: IconSize;
  variant?: IconVariant;
  animated?: boolean;
  spin?: boolean;
  pulse?: boolean;
  glow?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const sizeMap: Record<string, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

export const BaseIcon = React.forwardRef<SVGSVGElement, BaseIconProps>(
  ({ size = "md", variant = "outline", animated, spin, pulse, glow, className = "", children, ...props }, ref) => {
    const numericSize = typeof size === "number" ? size : sizeMap[size] || 24;

    let motionProps = {};
    if (spin) {
      motionProps = { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: "linear" } };
    } else if (pulse) {
      motionProps = { animate: { scale: [1, 1.1, 1] }, transition: { duration: 1.5, repeat: Infinity } };
    } else if (glow) {
      motionProps = { animate: { filter: ["drop-shadow(0px 0px 0px var(--color-icon-accent))", "drop-shadow(0px 0px 8px var(--color-icon-accent))", "drop-shadow(0px 0px 0px var(--color-icon-accent))"] }, transition: { duration: 2, repeat: Infinity } };
    } else if (animated) {
      motionProps = {
        whileHover: { scale: 1.05, transition: { duration: 0.2 } },
        whileTap: { scale: 0.95 }
      };
    }

    return (
      <motion.svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={numericSize}
        height={numericSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-icon-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cerebro-icon ${className}`}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.svg>
    );
  }
);

BaseIcon.displayName = "BaseIcon";
