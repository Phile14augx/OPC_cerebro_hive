import React from "react";
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
    ...props 
  }, ref) => {
    
    const numericSize = typeof size === "number" ? (sizeMap[size] || size) : 24;
    
    // Select animation variants
    const animationProps = iconAnimations[animation] || {};

    // For dual-tone styling, we apply standard Cerebro color variables
    const isDuotone = variant === "duotone";

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
        className={cerebro-icon variant-\ \}
        variants={animationProps}
        animate="animate"
        whileHover={animation === "hover" ? "hover" : undefined}
        {...props}
      >
        {children}
      </motion.svg>
    );
  }
);

BaseIcon.displayName = "BaseIcon";
