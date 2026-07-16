import { primitives } from "../primitives";

/**
 * CerebroMotion™ Registry
 * Maps semantic components and their intents to specific primitives based on theme.
 */

export const motionRegistry = {
  card: {
    hover: {
      dark: primitives.liftAndGlow,
      light: primitives.elevate,
    },
    enter: {
      dark: primitives.reveal,
      light: primitives.reveal,
    }
  },
  
  hero: {
    enter: {
      dark: primitives.reveal,
      light: primitives.reveal,
    }
  },

  background: {
    enter: {
      dark: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
      light: primitives.draw,
    }
  },
  
  button: {
    hover: {
      dark: { scale: 1.05, filter: "drop-shadow(0px 0px 15px rgba(0,245,122,0.6))" },
      light: { scale: 1.02, filter: "drop-shadow(0px 5px 15px rgba(0,0,0,0.1))" }
    },
    tap: {
      dark: { scale: 0.95 },
      light: { scale: 0.98 }
    }
  }
};

export type MotionComponent = keyof typeof motionRegistry;
