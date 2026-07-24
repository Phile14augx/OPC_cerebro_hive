import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
import { useCerebroMotion } from "../motion/foundation/MotionProvider";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  intensity?: "low" | "medium" | "high";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, interactive = false, intensity = "medium", ...props }, ref) => {
    const { getVariant } = useCerebroMotion();

    const intensityClasses = {
      low: "bg-card/30 border-border backdrop-blur-md",
      medium: "bg-card/50 border-border backdrop-blur-lg",
      high: "bg-card/80 border-border backdrop-blur-xl",
    };

    if (!interactive) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-2xl border",
            intensityClasses[intensity],
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl border cursor-pointer",
          intensityClasses[intensity],
          className
        )}
        variants={getVariant("card", "hover")}
        initial="rest"
        whileHover="hover"
        whileTap="hover" // Treat tap on mobile as hover state
        {...props as any}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
