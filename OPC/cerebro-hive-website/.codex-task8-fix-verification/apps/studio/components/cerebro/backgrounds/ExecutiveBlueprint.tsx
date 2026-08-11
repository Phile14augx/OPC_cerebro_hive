import React from "react";
import { motion } from "framer-motion";
import { useCerebroMotion } from "../../motion/foundation/MotionProvider";

/**
 * CerebroMotion™: Executive Blueprint Background (Light Theme)
 * Precise, architectural, calm, premium, data-centric.
 */
export function ExecutiveBlueprint() {
  const { getVariant } = useCerebroMotion();
  const drawVariant = getVariant("background", "enter");

  return (
    <motion.div 
      className="absolute inset-0 z-0 overflow-hidden bg-background opacity-50"
      initial="hidden"
      animate="visible"
    >
      {/* Graph Paper Grid Base */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      <svg className="absolute inset-0 w-full h-full stroke-text-muted/30 stroke-[1px] fill-none">
        {/* Architectural Connections */}
        <motion.path 
          d="M 100,0 L 100,1000 M 0,200 L 1920,200" 
          variants={drawVariant}
        />
        
        <motion.path 
          d="M 300,200 L 300,500 L 600,500" 
          variants={drawVariant}
        />

        <motion.circle 
          cx="300" cy="500" r="4" 
          className="fill-text-muted/30"
          variants={drawVariant}
        />
        
        {/* Coordinate Marks */}
        <motion.text x="110" y="30" className="text-[10px] fill-text-muted/50 stroke-none font-mono" variants={drawVariant}>X: 100</motion.text>
        <motion.text x="10" y="190" className="text-[10px] fill-text-muted/50 stroke-none font-mono" variants={drawVariant}>Y: 200</motion.text>
      </svg>
    </motion.div>
  );
}
