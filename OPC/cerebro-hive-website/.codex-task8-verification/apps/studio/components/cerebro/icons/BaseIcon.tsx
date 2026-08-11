import React, { useId } from "react";
import { motion } from "framer-motion";
import { BaseIconProps } from "./types";
import { sizeMap, defaultStrokeWidth } from "./tokens";
import { iconAnimations } from "./animations";

export const BaseIcon = React.forwardRef<SVGSVGElement, BaseIconProps>(
  ({ 
    size = 24, 
    strokeWidth = defaultStrokeWidth, 
    variant = "duotone", 
    animation = "idle", 
    className = "", 
    children, 
    decorative = true,
    label,
    ...props 
  }, ref) => {
    
    const numericSize = typeof size === "number" ? (sizeMap[size] || size) : 24;
    
    // Select animation variants
    const animationProps = iconAnimations[animation] || {};

    // Generate unique IDs for accessibility
    const titleId = useId();
    const descId = useId();

    return (
      <motion.svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={numericSize}
        height={numericSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-icon-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cerebro-icon variant-${variant} ${className}`}
        variants={animationProps}
        animate="animate"
        whileHover={animation === "hover" ? "hover" : undefined}
        role="img"
        focusable={false}
        aria-hidden={decorative && !label ? "true" : undefined}
        aria-labelledby={label ? titleId : undefined}
        {...props}
      >
        {label && <title id={titleId}>{label}</title>}
        {children}
      </motion.svg>
    );
  }
);

BaseIcon.displayName = "BaseIcon";
