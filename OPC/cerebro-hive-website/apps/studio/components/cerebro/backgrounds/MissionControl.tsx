import React from "react";
import { motion } from "framer-motion";
import { useCerebroMotion } from "../../motion/foundation/MotionProvider";

const energyNodes = Array.from({ length: 20 }, (_, index) => ({
  top: `${(index * 37 + 13) % 100}%`,
  left: `${(index * 61 + 29) % 100}%`,
  duration: 3 + (index % 5),
  delay: (index % 7) / 3,
}));

/**
 * CerebroMotion™: Mission Control Background (Dark Theme)
 * Cinematic, immersive, high-energy, cybernetic.
 */
export function MissionControl() {
  const { getVariant } = useCerebroMotion();

  // We could implement an actual Three.js or heavy canvas here, 
  // but we'll simulate the "Particle Universe / Orbital Systems" via CSS/framer-motion.
  return (
    <motion.div 
      className="absolute inset-0 z-0 overflow-hidden bg-background"
      variants={getVariant("background", "enter")}
      initial="hidden"
      animate="visible"
    >
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-accent/10 via-background to-background" />
      
      {/* Orbital Ring 1 */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-accent/20 border-dashed"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />

      {/* Orbital Ring 2 */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[1200px] h-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-accent/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Energy Nodes / Stars */}
      {energyNodes.map((node, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 bg-primary-accent rounded-full shadow-[0_0_10px_rgba(0,245,122,0.8)]"
          style={{ top: node.top, left: node.left }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: node.duration,
            repeat: Infinity,
            delay: node.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}
