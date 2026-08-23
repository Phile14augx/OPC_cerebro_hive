import { cn } from "@/lib/utils";
import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useCerebroMotion } from "../motion/foundation/MotionProvider";

interface GlassCardProps extends HTMLMotionProps<"div"> {
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

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl border",
          interactive && "cursor-pointer",
          intensityClasses[intensity],
          className
        )}
        variants={interactive ? getVariant("card", "hover") : undefined}
        initial={interactive ? "rest" : undefined}
        whileHover={interactive ? "hover" : undefined}
        whileTap={interactive ? "hover" : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
