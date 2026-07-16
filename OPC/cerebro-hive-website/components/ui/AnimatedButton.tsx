import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCerebroMotion } from "../motion/foundation/MotionProvider";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const { getVariant } = useCerebroMotion();

    return (
      <motion.button
        ref={ref}
        variants={getVariant("button", "hover")}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className={cn(
          "group relative inline-flex items-center justify-center font-space font-medium transition-colors duration-300",
          size === "sm" && "text-sm px-6 py-2",
          size === "md" && "text-base px-8 py-3",
          size === "lg" && "text-lg px-10 py-4",
          className
        )}
        {...props as any}
      >
        <div 
          className={cn(
            "absolute inset-0 -skew-x-12 transition-all duration-300 overflow-hidden",
            variant === "primary" && "bg-primary-accent group-hover:bg-[#00D46A]",
            variant === "secondary" && "bg-secondary-accent group-hover:bg-[#00AEE6]",
            variant === "outline" && "border border-border group-hover:border-primary-accent/40 bg-transparent",
            variant === "ghost" && "bg-transparent",
          )}
        >
          {(variant === "primary" || variant === "secondary") && (
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-border-subtle to-transparent skew-x-12" />
          )}
        </div>
        
        <span className="relative z-10 flex items-center whitespace-nowrap">
          <span className={cn(
            variant === "primary" && "text-[#07090D]",
            variant === "secondary" && "text-text-primary",
            variant === "outline" && "text-text-primary",
            variant === "ghost" && "text-text-muted group-hover:text-text-primary"
          )}>
            {children}
          </span>
          
          <span className={cn(
            "ml-3 flex items-center transition-transform duration-300 group-hover:translate-x-1",
            variant === "primary" && "text-[#07090D]",
            variant === "secondary" && "text-text-primary",
            variant === "outline" && "text-text-primary",
            variant === "ghost" && "text-text-muted group-hover:text-text-primary"
          )}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L12 12L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </span>
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";
