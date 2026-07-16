import { Variants } from "framer-motion";
import { motionTokens } from "../foundation/tokens";

/**
 * CerebroMotion™ Primitives
 * Reusable motion behaviors. These describe WHAT happens (Reveal, Elevate), 
 * not WHERE it happens (Card, Button).
 */

export const primitives = {
  reveal: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }
    }
  } as Variants,

  draw: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.linear }
    }
  } as Variants,

  elevate: {
    rest: { y: 0, scale: 1, filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))" },
    hover: { 
      y: motionTokens.elevation.lift, 
      scale: 1.01,
      filter: "drop-shadow(0px 10px 30px rgba(0,0,0,0.1))",
      transition: motionTokens.physics.snappy 
    }
  } as Variants,

  liftAndGlow: {
    rest: { y: 0, filter: "drop-shadow(0px 0px 0px rgba(0,245,122,0))" },
    hover: { 
      y: motionTokens.elevation.lift, 
      filter: "drop-shadow(0px 10px 30px rgba(0,245,122,0.4))",
      transition: motionTokens.physics.gentle 
    }
  } as Variants,

  pulse: {
    rest: { scale: 1, opacity: 0.8 },
    animate: { 
      scale: [1, 1.05, 1], 
      opacity: [0.8, 1, 0.8],
      transition: { 
        duration: motionTokens.duration.ambient, 
        ease: motionTokens.easing.smooth, 
        repeat: Infinity 
      }
    }
  } as Variants
};
